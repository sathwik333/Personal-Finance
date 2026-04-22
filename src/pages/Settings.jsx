import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [linkCode, setLinkCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [password, setPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (user) checkTelegramStatus()
  }, [user])

  async function checkTelegramStatus() {
    const { data } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', user.id)
      .single()
    setTelegramLinked(!!data?.telegram_chat_id)
  }

  async function generateLinkCode() {
    setLoadingCode(true)
    const code = generateCode()
    await supabase.from('profiles').update({ telegram_link_code: code }).eq('id', user.id)
    setLinkCode(code)
    setLoadingCode(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (password.length < 6) { setPwError('Password must be at least 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setPwError(error.message)
    else { setPwSuccess('Password updated'); setPassword('') }
  }

  async function handleDeleteAccount() {
    if (!confirm('This will delete ALL your transactions and categories. This cannot be undone. Are you sure?')) return
    if (!confirm('Last chance — permanently delete everything?')) return
    await supabase.from('transactions').delete().eq('user_id', user.id)
    await supabase.from('categories').delete().eq('user_id', user.id)
    await signOut()
    navigate('/login')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Account */}
      <section className="bg-surface rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-400">Account</h2>
        <p className="text-white text-sm">{user?.email}</p>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="New password"
            />
          </div>
          {pwError && <p className="text-expense text-sm" role="alert">{pwError}</p>}
          {pwSuccess && <p className="text-income text-sm" role="status">{pwSuccess}</p>}
          <button type="submit" className="bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Update password
          </button>
        </form>
      </section>

      {/* Telegram */}
      <section className="bg-surface rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-400">Telegram Bot</h2>
        {telegramLinked ? (
          <div className="flex items-center gap-2">
            <span className="text-income text-sm">✓ Connected</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Link your Telegram account to log transactions by sending a message to the bot.
            </p>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Open Telegram and message <span className="text-accent">@YourBotUsername</span></li>
              <li>Send <code className="bg-base px-1 rounded">/start</code></li>
              <li>Generate a code below and send it to the bot</li>
            </ol>
            {linkCode ? (
              <div className="bg-base rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Your link code (expires in 10 minutes):</p>
                <p className="text-accent text-2xl font-mono font-bold tracking-widest">{linkCode}</p>
                <p className="text-xs text-gray-500 mt-1">Send this code to the bot in Telegram</p>
              </div>
            ) : (
              <button
                onClick={generateLinkCode}
                disabled={loadingCode}
                className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {loadingCode ? 'Generating...' : 'Generate Link Code'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors"
      >
        <LogOut size={18} aria-hidden="true" /> Sign out
      </button>

      {/* Danger zone */}
      <section className="border border-expense/30 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-expense">Danger Zone</h2>
        <p className="text-sm text-gray-400">Permanently delete all your data. This cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="bg-expense/10 hover:bg-expense/20 text-expense text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Delete all my data
        </button>
      </section>
    </div>
  )
}
