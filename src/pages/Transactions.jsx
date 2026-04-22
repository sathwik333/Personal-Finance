import { useState } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'
import { SkeletonTransactions } from '../components/Skeleton'

export default function Transactions() {
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('')
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    return true
  })

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    try { await deleteTransaction(id) } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  function handleEdit(tx) { setEditing(tx); setShowForm(true) }
  async function handleSave(data) {
    if (editing) await updateTransaction(editing.id, data)
    else await addTransaction(data)
    handleClose()
  }
  function handleClose() { setShowForm(false); setEditing(null) }

  const typeFilters = [
    { key: 'all', label: 'All' },
    { key: 'expense', label: 'Expenses' },
    { key: 'income', label: 'Income' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-gray-500 font-body mt-0.5">
            {!loading && `${filtered.length} ${filtered.length === 1 ? 'record' : 'records'}`}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </div>

      {/* Filters */}
      <div
        className="glass-card rounded-2xl p-3 space-y-3 animate-fade-up"
        style={{ animationDelay: '60ms', animationFillMode: 'both' }}
      >
        {/* Type filter pills */}
        <div className="flex gap-2" role="group" aria-label="Filter by type">
          {typeFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filterType === key
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" aria-hidden="true" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="glass-input w-full rounded-xl pl-8 pr-4 py-2 text-xs cursor-pointer"
              style={{ appearance: 'none' }}
              aria-label="Filter by category"
            >
              <option value="" style={{ background: '#0F1221' }}>All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0F1221' }}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center font-body animate-fade-up">
          Failed to load transactions. Please refresh.
        </div>
      )}

      {/* Transaction list */}
      {loading ? (
        <SkeletonTransactions count={6} />
      ) : filtered.length === 0 ? (
        <div
          className="glass-card rounded-2xl px-6 py-14 text-center animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm font-body">No transactions found</p>
          <p className="text-gray-600 text-xs mt-1 font-body">Try adjusting your filters</p>
        </div>
      ) : (
        <div
          className="glass-card rounded-2xl divide-y divide-white/[0.05] overflow-hidden animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          {filtered.map((tx, i) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={handleEdit}
              onDelete={handleDelete}
              animDelay={i * 30}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm initial={editing} onSave={handleSave} onClose={handleClose} />
      )}
    </div>
  )
}
