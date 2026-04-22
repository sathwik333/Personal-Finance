import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange } from '../lib/utils'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import TransactionItem from '../components/TransactionItem'
import TransactionForm from '../components/TransactionForm'

export default function Dashboard() {
  const now = new Date()
  const { from, to } = getMonthRange(now.getFullYear(), now.getMonth())
  const { transactions, loading, error, summary, addTransaction, updateTransaction, deleteTransaction } = useTransactions({ from, to })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  function handleEdit(tx) { setEditing(tx); setShowForm(true) }
  function handleClose() { setShowForm(false); setEditing(null) }
  async function handleSave(data) {
    if (editing) await updateTransaction(editing.id, data)
    else await addTransaction(data)
    handleClose()
  }

  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-6 py-4">
      {/* Balance header */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 mb-1">Balance this month</p>
        <p className={`text-4xl font-bold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(Math.abs(summary.balance))}
        </p>
        {summary.balance < 0 && <p className="text-expense text-sm mt-1">in the red</p>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Spent" value={formatCurrency(summary.totalExpenses)} color="text-expense" />
        <StatCard label="Income" value={formatCurrency(summary.totalIncome)} color="text-income" />
        <StatCard
          label="Top Category"
          value={summary.topCategory ? `${summary.topCategory.icon} ${summary.topCategory.name}` : '—'}
        />
      </div>

      {error && <p className="text-expense text-sm text-center">Failed to load data. Please refresh.</p>}

      {/* Donut chart */}
      <div className="bg-surface rounded-xl p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Spending by Category</h2>
        <DonutChart data={summary.byCategory} />
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Transactions</h2>
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions this month</p>
        ) : (
          <div className="bg-surface rounded-xl divide-y divide-gray-800">
            {recent.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        aria-label="Add transaction"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-accent hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <Plus size={24} aria-hidden="true" />
      </button>

      {showForm && <TransactionForm initial={editing} onSave={handleSave} onClose={handleClose} />}
    </div>
  )
}
