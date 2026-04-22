import { useState, useMemo } from 'react'
import { subMonths, format, eachDayOfInterval, parseISO } from 'date-fns'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange, getWeekRange, groupByCategory } from '../lib/utils'
import SpendingBarChart from '../components/SpendingBarChart'
import TrendLineChart from '../components/TrendLineChart'

export default function Reports() {
  const [view, setView] = useState('monthly')
  const now = new Date()

  const range = view === 'monthly' ? getMonthRange(now.getFullYear(), now.getMonth()) : getWeekRange(now)
  const prevRange = view === 'monthly'
    ? getMonthRange(now.getFullYear(), now.getMonth() - 1)
    : getWeekRange(subMonths(now, 1))

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

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Reports</h1>
        <button onClick={exportCSV} className="text-sm text-accent hover:underline" disabled={loading || transactions.length === 0}>
          Export CSV
        </button>
      </div>

      {/* Toggle */}
      <div className="flex bg-surface rounded-lg p-1 gap-1" role="group" aria-label="Report period">
        {['weekly', 'monthly'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              view === v ? 'bg-accent text-white' : 'text-gray-400'
            }`}>
            {v}
          </button>
        ))}
      </div>

      {error && <p className="text-expense text-sm text-center py-2">Failed to load data. Please refresh.</p>}

      {loading ? <p className="text-gray-400 text-center py-8">Loading...</p> : (
        <>
          {/* Period comparison */}
          {diff !== 0 && !error && (
            <div className={`rounded-xl p-4 text-sm ${diff > 0 ? 'bg-expense/10 text-expense' : 'bg-income/10 text-income'}`}>
              You spent {formatCurrency(Math.abs(diff))} {diff > 0 ? 'more' : 'less'} than last {view === 'monthly' ? 'month' : 'week'}.
            </div>
          )}

          {/* By category */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">By Category</h2>
            <SpendingBarChart data={byCategory} />
          </div>

          {/* Daily trend */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Daily Spending</h2>
            <TrendLineChart data={dailyTrend} />
          </div>
        </>
      )}
    </div>
  )
}
