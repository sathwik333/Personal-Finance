import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, X, Repeat2 } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { getDateRange } from '../lib/utils'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'
import { SkeletonTransactions } from '../components/Skeleton'

const DATE_RANGES = [
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'last-3-months', label: '3 Months' },
  { key: 'all-time', label: 'All Time' },
]

export default function Transactions() {
  const location = useLocation()
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRecurring, setFilterRecurring] = useState(location.state?.filterRecurring ?? false)
  const [dateRange, setDateRange] = useState('this-month')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  const range = getDateRange(dateRange)
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions(range)
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    if (filterRecurring && !t.is_recurring) return false
    if (searchQuery && !t.note?.toLowerCase().includes(searchQuery.toLowerCase())) return false
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

  function handleCloseSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (searchOpen) handleCloseSearch(); else setSearchOpen(true) }}
            aria-label="Search transactions"
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer glass-card ${searchOpen ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-white'}`}
          >
            <Search size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus size={16} aria-hidden="true" /> Add
          </button>
        </div>
      </div>

      {/* Inline search bar */}
      {searchOpen && (
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up">
          <Search size={15} className="text-accent flex-shrink-0" aria-hidden="true" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by note..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            aria-label="Search transactions by note"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-gray-500 hover:text-white cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div
        className="glass-card rounded-2xl p-3 space-y-3 animate-fade-up"
        style={{ animationDelay: '60ms', animationFillMode: 'both' }}
      >
        {/* Type filter pills + recurring pill + date range pill */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by type">
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

          <button
            onClick={() => setFilterRecurring(v => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterRecurring
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Repeat2 size={11} aria-hidden="true" /> Recurring
          </button>

          {/* Date range pill — pushed to the right */}
          <div className="ml-auto relative">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              aria-label="Date range"
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-300 cursor-pointer pr-7"
              style={{ appearance: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {DATE_RANGES.map(r => (
                <option key={r.key} value={r.key} style={{ background: '#0F1221' }}>{r.label}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
          </div>
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
