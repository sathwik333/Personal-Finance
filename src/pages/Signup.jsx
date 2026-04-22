import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      const result = await signUp(email, password)
      if (result?.session) {
        navigate('/')
      } else {
        navigate('/login', { state: { message: 'Check your email to confirm your account, then sign in.' } })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: '#080B18',
        backgroundImage: `
          radial-gradient(ellipse 70% 60% at 90% 5%, rgba(59,130,246,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 10% 90%, rgba(124,58,237,0.15) 0%, transparent 60%)
        `,
      }}
    >
      <div
        className="absolute top-1/3 -right-20 w-56 h-56 rounded-full opacity-15 animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/3 -left-16 w-44 h-44 rounded-full opacity-10 animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, #34D399, transparent 70%)', animationDelay: '3s' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-xl shadow-violet-900/60">
            <TrendingUp size={18} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Finely</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Create account</h1>
        <p className="text-gray-400 mb-7 font-body text-sm">Start tracking your finances today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="glass-input w-full rounded-xl px-4 py-3 pr-12 text-sm"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-expense text-sm font-body px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating account...
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6 font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-white transition-colors font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
