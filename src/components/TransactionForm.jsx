import { useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { format } from 'date-fns'

export default function TransactionForm({ onSave, onClose, initial = null }) {
  const { categories } = useCategories()
  const [type, setType] = useState(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ amount: Number(amount), type, category_id: categoryId || null, note, date })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-5 animate-slide-up md:animate-scale-in"
        style={{
          background: 'rgba(15, 18, 33, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{initial ? 'Edit' : 'New'} Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div
          className="flex rounded-2xl overflow-hidden p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {[
            { key: 'expense', label: 'Expense', Icon: ArrowDownCircle, active: 'bg-expense/20 text-expense border-expense/30' },
            { key: 'income', label: 'Income', Icon: ArrowUpCircle, active: 'bg-income/20 text-income border-income/30' },
          ].map(({ key, label, Icon, active }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                type === key ? active : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="tx-amount" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="glass-input w-full rounded-xl pl-9 pr-4 py-3.5 text-2xl font-bold"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="tx-category" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
              style={{ appearance: 'none' }}
            >
              <option value="" style={{ background: '#0F1221' }}>No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: '#0F1221' }}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="tx-note" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Note <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <input
              id="tx-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              placeholder="What was this for?"
              maxLength={100}
            />
          </div>

          {error && (
            <p role="alert" className="text-expense text-sm font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3.5 rounded-xl text-sm"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </span>
            ) : initial ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
