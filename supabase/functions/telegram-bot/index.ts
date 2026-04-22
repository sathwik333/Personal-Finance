import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

interface ParsedTransaction {
  type: 'income' | 'expense'
  amount: number
  categoryHint: string
  note: string
}

function parseMessage(text: string): ParsedTransaction | null {
  // Format: "spent 45 food lunch" or "income 2000 salary"
  const lower = text.toLowerCase().trim()
  const match = lower.match(/^(spent|expense|income)\s+(\d+(?:\.\d{1,2})?)\s*(.*)$/)
  if (!match) return null

  const [, typeWord, amountStr, rest] = match
  const parts = rest.trim().split(/\s+/)
  const categoryHint = parts[0] ?? ''
  const note = parts.slice(1).join(' ')

  return {
    type: typeWord === 'income' ? 'income' : 'expense',
    amount: parseFloat(amountStr),
    categoryHint,
    note,
  }
}

async function getUserByTelegramId(chatId: number) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single()
  return data
}

async function linkAccount(chatId: number, code: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_link_code', code.toUpperCase())
    .single()
  if (!profile) return false

  const { error } = await supabase
    .from('profiles')
    .update({ telegram_chat_id: chatId, telegram_link_code: null })
    .eq('id', profile.id)
  return !error
}

async function findCategory(userId: string, hint: string) {
  if (!hint) return null
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .or(`user_id.eq.${userId},user_id.is.null`)
  if (!data) return null
  const lower = hint.toLowerCase()
  return data.find(c => c.name.toLowerCase().startsWith(lower)) ?? null
}

serve(async (req) => {
  // Verify webhook secret
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret !== WEBHOOK_SECRET) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const message = body.message
  if (!message?.text) return new Response('OK')

  const chatId: number = message.chat.id
  const text: string = message.text.trim()

  // /start command
  if (text === '/start') {
    await sendMessage(chatId, '👋 Welcome! Generate a link code in the app Settings → Telegram, then send it here to connect your account.')
    return new Response('OK')
  }

  // Link code (8 uppercase alphanumeric chars)
  if (/^[A-Z0-9]{8}$/i.test(text)) {
    const linked = await linkAccount(chatId, text)
    if (linked) {
      await sendMessage(chatId, '✅ Account linked! You can now log transactions.\n\nExamples:\n<code>spent 45 food lunch</code>\n<code>income 2000 salary</code>\n<code>/summary</code>')
    } else {
      await sendMessage(chatId, '❌ Invalid or expired code. Generate a new one in the app.')
    }
    return new Response('OK')
  }

  // All other commands require linked account
  const user = await getUserByTelegramId(chatId)
  if (!user) {
    await sendMessage(chatId, '⚠️ Account not linked. Go to Settings → Telegram in the app to get a link code.')
    return new Response('OK')
  }

  // /summary command
  if (text === '/summary') {
    const now = new Date()
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', from)

    const income = txs?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
    const spent = txs?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0
    const balance = income - spent

    await sendMessage(chatId,
      `📊 <b>This month</b>\nIncome: <b>$${income.toFixed(2)}</b>\nSpent: <b>$${spent.toFixed(2)}</b>\nBalance: <b>${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}</b>`
    )
    return new Response('OK')
  }

  // /categories command
  if (text === '/categories') {
    const { data: cats } = await supabase
      .from('categories')
      .select('name, icon')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
    const list = cats?.map(c => `${c.icon} ${c.name.toLowerCase()}`).join('\n') ?? ''
    await sendMessage(chatId, `📂 <b>Categories:</b>\n${list}`)
    return new Response('OK')
  }

  // Transaction logging
  const parsed = parseMessage(text)
  if (!parsed) {
    await sendMessage(chatId,
      '❓ I didn\'t understand that.\n\nTry:\n<code>spent 45 food lunch</code>\n<code>income 2000 salary</code>\n<code>/summary</code>\n<code>/categories</code>'
    )
    return new Response('OK')
  }

  const category = await findCategory(user.id, parsed.categoryHint)
  const today = new Date().toISOString().split('T')[0]

  await supabase.from('transactions').insert({
    user_id: user.id,
    amount: parsed.amount,
    type: parsed.type,
    category_id: category?.id ?? null,
    note: parsed.note || null,
    date: today,
  })

  const emoji = parsed.type === 'income' ? '💰' : '💸'
  const catName = category?.name ?? parsed.categoryHint ?? 'Uncategorized'
  await sendMessage(chatId,
    `${emoji} Logged: <b>$${parsed.amount.toFixed(2)}</b> — ${catName}${parsed.note ? ` (${parsed.note})` : ''}`
  )

  return new Response('OK')
})
