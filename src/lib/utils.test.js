import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, groupByCategory, getMonthRange, getWeekRange } from './utils'

describe('formatCurrency', () => {
  it('formats positive number as USD', () => {
    expect(formatCurrency(45.5)).toBe('$45.50')
  })
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
  it('formats large number with commas', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    expect(formatDate('2026-04-21')).toBe('Apr 21, 2026')
  })
})

describe('groupByCategory', () => {
  it('sums amounts by category name', () => {
    const transactions = [
      { amount: 10, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
      { amount: 20, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
      { amount: 30, type: 'expense', categories: { name: 'Transport', color: '#3B82F6', icon: '🚗' } },
    ]
    const result = groupByCategory(transactions)
    expect(result).toEqual([
      { name: 'Food', value: 30, color: '#F59E0B', icon: '🍔' },
      { name: 'Transport', value: 30, color: '#3B82F6', icon: '🚗' },
    ])
  })
  it('ignores income transactions', () => {
    const transactions = [
      { amount: 100, type: 'income', categories: { name: 'Salary', color: '#10B981', icon: '💰' } },
    ]
    expect(groupByCategory(transactions)).toEqual([])
  })
})

describe('getMonthRange', () => {
  it('returns first and last day of given month', () => {
    const { from, to } = getMonthRange(2026, 3) // April (0-indexed)
    expect(from).toBe('2026-04-01')
    expect(to).toBe('2026-04-30')
  })
})
