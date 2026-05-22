import { useState, useMemo } from 'react'
import { subWeeks, format, eachDayOfInterval, parseISO } from 'date-fns'
import { Download, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange, getWeekRange, groupByCategory } from '../lib/utils'
import SpendingBarChart from '../components/SpendingBarChart'
import TrendLineChart from '../components/TrendLineChart'
import StatCard from '../components/StatCard'
import Skeleton, { SkeletonChart, SkeletonStatCards } from '../components/Skeleton'

const VIEWS = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'alltime', label: 'All Time' },
]

export default function Reports() {
  const [view, setView] = useState('monthly')
  const now = new Date()

  const range = view === 'monthly' ? getMonthRange(now.getFullYear(), now.getMonth()) : getWeekRange(now)
  const prevRange = view === 'monthly'
    ? getMonthRange(now.getFullYear(), now.getMonth() - 1)
    : getWeekRange(subWeeks(now, 1))

  const { transactions, loading, error } = useTransactions(range)
  const { transactions: prevTxs } = useTransactions(prevRange)
  const { transactions: allTxs, loading: allLoading, error: allError } = useTransactions()

  const byCategory = useMemo(() => groupByCategory(transactions), [transactions])
  const allTimeByCategory = useMemo(() => groupByCategory(allTxs), [allTxs])

  const dailyTrend = useMemo(() => {
    if (!range.from || !range.to) return []
    const days = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) })
    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd')
      const total = transactions
        .filter(t => t.date === key && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { date: format(day, 'MMM d'), total }
    })
  }, [transactions, range])

  const monthlyTrend = useMemo(() => {
    const map = {}
    for (const tx of allTxs) {
      if (tx.type !== 'expense') continue
      const key = format(parseISO(tx.date), 'yyyy-MM')
      map[key] = (map[key] || 0) + Number(tx.amount)
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({ date: format(parseISO(key + '-01'), 'MMM yy'), total }))
  }, [allTxs])

  const allTimeIncome = useMemo(() => allTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [allTxs])
  const allTimeExpenses = useMemo(() => allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [allTxs])
  const allTimeBalance = allTimeIncome - allTimeExpenses

  const currentSpend = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const prevSpend = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const diff = currentSpend - prevSpend

  const exportTxs = view === 'alltime' ? allTxs : transactions
  const exportName = view === 'alltime' ? 'finance-alltime' : `finance-${range.from}-${range.to}`

  function exportCSV() {
    const header = 'Date,Type,Category,Amount,Note'
    const rows = exportTxs.map(t =>
      `${t.date},${t.type},${t.categories?.name ?? ''},${t.amount},"${t.note ?? ''}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const periodLabel = view === 'monthly' ? 'month' : 'week'
  const isAllTime = view === 'alltime'
  const activeLoading = isAllTime ? allLoading : loading
  const activeError = isAllTime ? allError : error

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-xs text-gray-500 font-body mt-0.5">{VIEWS.find(v => v.id === view)?.label} overview</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={activeLoading || exportTxs.length === 0}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed glass-card px-3 py-2 rounded-xl cursor-pointer"
        >
          <Download size={13} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/* Period toggle */}
      <div
        className="glass-card rounded-2xl p-1 flex gap-1 animate-fade-up"
        style={{ animationDelay: '50ms', animationFillMode: 'both' }}
        role="group"
        aria-label="Report period"
      >
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              view === v.id
                ? 'bg-accent/20 text-accent border border-accent/25'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {activeError && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center animate-fade-up">
          Failed to load data. Please refresh.
        </div>
      )}

      {activeLoading ? (
        <div className="space-y-5">
          {isAllTime && <SkeletonStatCards />}
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : isAllTime ? (
        <>
          {/* All-time summary cards */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
            <StatCard label="Income" value={formatCurrency(allTimeIncome)} color="text-income" icon={TrendingUp} delay={0} />
            <StatCard label="Spent" value={formatCurrency(allTimeExpenses)} color="text-expense" icon={TrendingDown} delay={60} />
            <StatCard
              label="Saved"
              value={formatCurrency(Math.abs(allTimeBalance))}
              color={allTimeBalance >= 0 ? 'text-income' : 'text-expense'}
              icon={Wallet}
              delay={120}
            />
          </div>

          {/* All-time by category */}
          <div
            className="glass-card rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-accent inline-block" />
              Spending by Category (All Time)
            </h2>
            {allTimeByCategory.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8 font-body">No expense data recorded yet</p>
            ) : (
              <SpendingBarChart data={allTimeByCategory} />
            )}
          </div>

          {/* Monthly spending trend */}
          <div
            className="glass-card rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: '150ms', animationFillMode: 'both' }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-income inline-block" />
              Monthly Spending Trend
            </h2>
            {monthlyTrend.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8 font-body">No data recorded yet</p>
            ) : (
              <TrendLineChart data={monthlyTrend} />
            )}
          </div>
        </>
      ) : (
        <>
          {/* Period comparison banner */}
          {diff !== 0 && !activeError && (
            <div
              className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3 animate-fade-up"
              style={{ animationDelay: '80ms', animationFillMode: 'both' }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                diff > 0 ? 'bg-expense/15' : 'bg-income/15'
              }`}>
                {diff > 0
                  ? <TrendingUp size={18} className="text-expense" />
                  : <TrendingDown size={18} className="text-income" />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${diff > 0 ? 'text-expense' : 'text-income'}`}>
                  {formatCurrency(Math.abs(diff))} {diff > 0 ? 'more' : 'less'} spent
                </p>
                <p className="text-xs text-gray-500 font-body">
                  compared to last {periodLabel}
                </p>
              </div>
            </div>
          )}

          {/* By category */}
          <div
            className="glass-card rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-accent inline-block" />
              Spending by Category
            </h2>
            {byCategory.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8 font-body">No expense data for this period</p>
            ) : (
              <SpendingBarChart data={byCategory} />
            )}
          </div>

          {/* Daily trend */}
          <div
            className="glass-card rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: '150ms', animationFillMode: 'both' }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-income inline-block" />
              Daily Spending
            </h2>
            {dailyTrend.every(d => d.total === 0) ? (
              <p className="text-gray-600 text-sm text-center py-8 font-body">No data for this period</p>
            ) : (
              <TrendLineChart data={dailyTrend} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
