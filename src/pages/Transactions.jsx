import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'

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
    await deleteTransaction(id)
  }

  function handleEdit(tx) {
    setEditing(tx)
    setShowForm(true)
  }

  async function handleSave(data) {
    if (editing) {
      await updateTransaction(editing.id, data)
    } else {
      await addTransaction(data)
    }
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'expense', 'income'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              filterType === t ? 'bg-accent text-white' : 'bg-surface text-gray-400'
            }`}>
            {t}
          </button>
        ))}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-surface text-gray-400 text-sm rounded-full px-3 py-1 focus:outline-none"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-expense text-sm text-center py-2">Failed to load transactions. Please refresh.</p>}

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      ) : (
        <div className="bg-surface rounded-xl divide-y divide-gray-800">
          {filtered.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          initial={editing}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
