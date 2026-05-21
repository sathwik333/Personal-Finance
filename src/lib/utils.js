import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(dateStr) {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM dd, yyyy')
}

export function groupByCategory(transactions) {
  const map = {}
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    const cat = tx.categories
    if (!cat) continue
    if (!map[cat.name]) {
      map[cat.name] = { name: cat.name, value: 0, color: cat.color, icon: cat.icon }
    }
    map[cat.name].value += Number(tx.amount)
  }
  return Object.values(map)
}

export function getMonthRange(year, month) {
  const date = new Date(year, month, 1)
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getWeekRange(date = new Date()) {
  return {
    from: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    to: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

export function calcBalance(transactions) {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + Number(tx.amount) : acc - Number(tx.amount)
  }, 0)
}

export function normalizeHex(value) {
  const cleaned = value.startsWith('#') ? value : `#${value}`
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned.toLowerCase() : null
}

export function getDateRange(rangeKey, now = new Date()) {
  switch (rangeKey) {
    case 'this-month':
      return getMonthRange(now.getFullYear(), now.getMonth())
    case 'last-month': {
      const prev = subMonths(now, 1)
      return { from: format(startOfMonth(prev), 'yyyy-MM-dd'), to: format(endOfMonth(prev), 'yyyy-MM-dd') }
    }
    case 'last-3-months':
      return {
        from: format(subMonths(now, 3), 'yyyy-MM-dd'),
        to: format(now, 'yyyy-MM-dd'),
      }
    default:
      return {}
  }
}
