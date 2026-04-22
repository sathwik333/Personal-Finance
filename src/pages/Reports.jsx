import { useState, useMemo } from 'react'
import { subWeeks, format, eachDayOfInterval, parseISO } from 'date-fns'
import { Download, TrendingDown, TrendingUp } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange, getWeekRange, groupByCategory } from '../lib/utils'
import SpendingBarChart from '../components/SpendingBarChart'
import TrendLineChart from '../components/TrendLineChart'
import { SkeletonChart } from '../components/Skeleton'
import Skeleton from '../components/Skeleton'

export default function Reports() {
  const [view, setView] = useState('monthly')
  const now = new Date()

  const range = view === 'monthly' ? getMonthRange(now.getFullYear(), now.getMonth()) : getWeekRange(now)
  const prevRange = view === 'monthly'
    ? getMonthRange(now.getFullYear(), now.getMonth() - 1)
    : getWeekRange(subWeeks(now, 1))

  const { transactions, loading, error } = useTransactions(range)
  const { transactions: prevTxs } = useTransactions(prevRange)

  const byCategory = useMemo(() => groupByCategory(transactions), [transactions])

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

  const currentSpend = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const prevSpend = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const diff = currentSpend - prevSpend

  function exportCSV() {
    const header = 'Date,Type,Category,Amount,Note'
    const rows = transactions.map(t =>
      `${t.date},${t.type},${t.categories?.name ?? ''},${t.amount},"${t.note ?? ''}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-${range.from}-${range.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const periodLabel = view === 'monthly' ? 'month' : 'week'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-xs text-gray-500 font-body mt-0.5 capitalize">{view} overview</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={loading || transactions.length === 0}
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
        {['weekly', 'monthly'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 cursor-pointer ${
              view === v
                ? 'bg-accent/20 text-accent border border-accent/25'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center animate-fade-up">
          Failed to load data. Please refresh.
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <Skeleton className="h-4 w-64" />
          </div>
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <>
          {/* Period comparison banner */}
          {diff !== 0 && !error && (
            <div
              className={`glass-card rounded-2xl px-5 py-4 flex items-center gap-3 animate-fade-up`}
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
