import { useState } from 'react'
import { X } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {['expense', 'income'].map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === 'expense' ? 'bg-expense text-white' : 'bg-income text-white'
                  : 'text-gray-400'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tx-amount" className="block text-sm text-gray-400 mb-1">Amount ($)</label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-semibold focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="tx-category" className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-date" className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="tx-note" className="block text-sm text-gray-400 mb-1">Note (optional)</label>
            <input
              id="tx-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="What was this for?"
              maxLength={100}
            />
          </div>

          <p role="alert" className="text-expense text-sm min-h-[1.25rem]">{error}</p>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : initial ? 'Update' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
