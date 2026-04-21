import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

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
