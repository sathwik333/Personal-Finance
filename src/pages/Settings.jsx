import { useState, useEffect } from 'react'
import { LogOut, Shield, MessageCircle, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react'
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
  const [codeError, setCodeError] = useState('')
  const [password, setPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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
    setCodeError('')
    const code = generateCode()
    const { error } = await supabase.from('profiles').update({ telegram_link_code: code }).eq('id', user.id)
    if (error) setCodeError('Failed to generate code. Please try again.')
    else setLinkCode(code)
    setLoadingCode(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (password.length < 6) { setPwError('Password must be at least 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setPwError(error.message)
    else { setPwSuccess('Password updated successfully'); setPassword('') }
  }

  async function handleDeleteAccount() {
    if (!confirm('This will delete ALL your transactions and categories. This cannot be undone. Are you sure?')) return
    if (!confirm('Last chance — permanently delete everything?')) return
    try {
      const { error: txErr } = await supabase.from('transactions').delete().eq('user_id', user.id)
      if (txErr) throw txErr
      const { error: catErr } = await supabase.from('categories').delete().eq('user_id', user.id)
      if (catErr) throw catErr
      const { error: profErr } = await supabase.from('profiles').delete().eq('id', user.id)
      if (profErr) throw profErr
      await signOut()
      navigate('/login')
    } catch (err) {
      alert('Failed to delete account data: ' + (err.message ?? 'Unknown error'))
    }
  }

  async function handleConfirmSignOut() {
    setSigningOut(true)
    try { await signOut() } catch {}
    navigate('/login')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-gray-500 font-body mt-0.5">{user?.email}</p>
      </div>

      {/* Account / Change password */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
            <KeyRound size={15} className="text-accent" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>
          {pwError && <p className="text-expense text-sm font-body" role="alert">{pwError}</p>}
          {pwSuccess && (
            <p className="text-income text-sm font-body flex items-center gap-1.5" role="status">
              <CheckCircle size={14} /> {pwSuccess}
            </p>
          )}
          <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm">
            Update password
          </button>
        </form>
      </section>

      {/* Telegram */}
      <section className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <MessageCircle size={15} className="text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">Telegram Bot</h2>
          {telegramLinked && (
            <span className="ml-auto text-xs font-semibold text-income bg-income/15 px-2.5 py-1 rounded-full">
              Connected
            </span>
          )}
        </div>

        {telegramLinked ? (
          <p className="text-gray-400 text-sm font-body">Your Telegram account is linked and ready to log transactions.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 font-body">
              Link Telegram to log transactions by message.
            </p>
            <ol className="text-sm text-gray-300 space-y-1.5 list-decimal list-inside font-body">
              <li>Open Telegram and message <span className="text-accent font-semibold">@YourBotUsername</span></li>
              <li>Send <code className="px-1.5 py-0.5 rounded-md text-xs font-mono" style={{ background: 'rgba(255,255,255,0.08)' }}>/start</code></li>
              <li>Generate a code below and send it to the bot</li>
            </ol>

            {linkCode ? (
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs text-gray-500 mb-1.5 font-body">Your link code (expires in 10 min)</p>
                <p className="text-accent text-3xl font-mono font-bold tracking-widest">{linkCode}</p>
                <p className="text-xs text-gray-600 mt-1.5 font-body">Send this to the bot in Telegram</p>
              </div>
            ) : (
              <>
                {codeError && <p className="text-expense text-sm font-body" role="alert">{codeError}</p>}
                <button
                  onClick={generateLinkCode}
                  disabled={loadingCode}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
                >
                  {loadingCode ? 'Generating...' : 'Generate Link Code'}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Sign out */}
      {confirmSignOut ? (
        <div
          className="glass-card rounded-2xl p-5 space-y-4"
          style={{ border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-expense/15 flex items-center justify-center flex-shrink-0">
              <LogOut size={17} className="text-expense" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Sign out of Finely?</p>
              <p className="text-gray-500 text-xs font-body">You'll need to sign back in to access your data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmSignOut(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSignOut}
              disabled={signingOut}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-60"
              style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              {signingOut ? 'Signing out…' : 'Yes, sign out'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmSignOut(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-gray-300 hover:text-expense transition-colors cursor-pointer glass-card"
        >
          <LogOut size={17} aria-hidden="true" />
          Sign out
        </button>
      )}

      {/* Danger zone */}
      <section
        className="rounded-2xl p-5 space-y-3"
        style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.04)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-expense/15 flex items-center justify-center">
            <AlertTriangle size={15} className="text-expense" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-expense">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-400 font-body">Permanently delete all your data. This cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-expense transition-colors cursor-pointer"
          style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          Delete all my data
        </button>
      </section>
    </div>
  )
}
