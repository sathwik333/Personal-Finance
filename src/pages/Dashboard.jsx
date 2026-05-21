import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, TrendingDown, Wallet, Repeat2 } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange } from '../lib/utils'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import TransactionItem from '../components/TransactionItem'
import TransactionForm from '../components/TransactionForm'
import Skeleton, { SkeletonStatCards, SkeletonTransactions } from '../components/Skeleton'

export default function Dashboard() {
  const [{ from, to }] = useState(() => {
    const now = new Date()
    return getMonthRange(now.getFullYear(), now.getMonth())
  })
  const { transactions, loading, error, summary, addTransaction, updateTransaction, deleteTransaction } = useTransactions({ from, to })
  const { summary: totalSummary, loading: totalLoading } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    try { await deleteTransaction(id) } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  function handleEdit(tx) { setEditing(tx); setShowForm(true) }
  function handleClose() { setShowForm(false); setEditing(null) }
  async function handleSave(data) {
    try {
      if (editing) await updateTransaction(editing.id, data)
      else await addTransaction(data)
      handleClose()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save transaction. Please try again.')
    }
  }

  const navigate = useNavigate()
  const recurringTxs = transactions.filter(t => t.is_recurring && t.type === 'expense')
  const recurringTotal = recurringTxs.reduce((s, t) => s + Number(t.amount), 0)
  const recent = transactions.slice(0, 5)
  const now = new Date()
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Hero balance card */}
      <div
        className="rounded-3xl p-6 text-center relative overflow-hidden animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.1) 100%)',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: '0 8px 40px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #60A5FA, transparent 70%)', animationDelay: '3s' }}
          aria-hidden="true"
        />

        <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1 font-body">Total Savings</p>
        <p className="text-xs text-gray-400 mb-2 font-body">All-time balance</p>

        {totalLoading ? (
          <div className="flex justify-center">
            <Skeleton className="h-12 w-40 mx-auto" rounded="rounded-xl" />
          </div>
        ) : (
          <p className={`text-5xl font-bold tracking-tight ${totalSummary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {totalSummary.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(totalSummary.balance))}
          </p>
        )}

        {/* This month's balance */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1 font-body">{monthLabel}</p>
          {loading ? (
            <Skeleton className="h-5 w-24 mx-auto" rounded="rounded-lg" />
          ) : (
            <p className={`text-base font-semibold ${summary.balance >= 0 ? 'text-income/80' : 'text-expense/80'}`}>
              {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)} this month
            </p>
          )}
          {!loading && summary.balance >= 0 && summary.totalIncome > 0 && (
            <p className="text-income/50 text-xs mt-0.5 font-body">
              saving {((summary.balance / summary.totalIncome) * 100).toFixed(0)}% of income
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? <SkeletonStatCards /> : (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Spent" value={formatCurrency(summary.totalExpenses)} color="text-expense" icon={TrendingDown} delay={0} />
          <StatCard label="Income" value={formatCurrency(summary.totalIncome)} color="text-income" icon={TrendingUp} delay={60} />
          <StatCard
            label="Top Category"
            value={summary.topCategory ? summary.topCategory.name : '—'}
            icon={Wallet}
            delay={120}
          />
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center">
          Failed to load data. Please refresh.
        </div>
      )}

      {/* Recurring summary card */}
      {!loading && recurringTxs.length > 0 && (
        <button
          onClick={() => navigate('/transactions', { state: { filterRecurring: true } })}
          className="glass-card rounded-2xl px-5 py-4 flex items-center gap-4 w-full text-left animate-fade-up cursor-pointer hover:bg-white/[0.03] transition-colors"
          style={{ animationDelay: '130ms', animationFillMode: 'both' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Repeat2 size={18} className="text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Monthly Recurring</p>
            <p className="text-xs text-gray-500 font-body mt-0.5">{recurringTxs.length} subscription{recurringTxs.length !== 1 ? 's' : ''} this month</p>
          </div>
          <p className="text-expense font-bold text-sm tabular-nums flex-shrink-0">{formatCurrency(recurringTotal)}</p>
        </button>
      )}

      {/* Donut chart */}
      {loading ? (
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-48 w-full" rounded="rounded-xl" />
        </div>
      ) : (
        <div
          className="glass-card rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '150ms', animationFillMode: 'both' }}
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-accent inline-block" />
            Spending by Category
          </h2>
          <DonutChart data={summary.byCategory} />
        </div>
      )}

      {/* Recent transactions — extra bottom padding so FAB never covers last row */}
      <div
        className="animate-fade-up pb-4"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <h2 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-accent inline-block" />
          Recent Transactions
        </h2>

        {loading ? (
          <SkeletonTransactions count={4} />
        ) : !error && recent.length === 0 ? (
          <div className="glass-card rounded-2xl px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm font-body">No transactions this month</p>
            <p className="text-gray-600 text-xs mt-1 font-body">Tap + to add your first one</p>
          </div>
        ) : !error ? (
          <div className="glass-card rounded-2xl divide-y divide-white/[0.05] overflow-hidden">
            {recent.map((tx, i) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={handleEdit}
                onDelete={handleDelete}
                animDelay={i * 40}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        aria-label="Add transaction"
        className="fixed bottom-28 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-2xl flex items-center justify-center z-30 transition-all duration-200 active:scale-95 shadow-lg btn-primary"
        style={{ boxShadow: '0 8px 30px rgba(124,58,237,0.5)' }}
      >
        <Plus size={22} aria-hidden="true" />
      </button>

      {showForm && <TransactionForm initial={editing} onSave={handleSave} onClose={handleClose} />}
    </div>
  )
}
