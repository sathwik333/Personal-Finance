import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, groupByCategory, getMonthRange, getWeekRange, calcBalance, normalizeHex, getDateRange } from './utils'

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

describe('getWeekRange', () => {
  it('returns Monday-to-Sunday range for a mid-week date', () => {
    const { from, to } = getWeekRange(new Date(2026, 3, 22)) // Wednesday Apr 22
    expect(from).toBe('2026-04-20') // Monday
    expect(to).toBe('2026-04-26')   // Sunday
  })
})

describe('calcBalance', () => {
  it('returns 0 for empty array', () => {
    expect(calcBalance([])).toBe(0)
  })
  it('adds income and subtracts expenses', () => {
    const txs = [
      { amount: 100, type: 'income' },
      { amount: 30, type: 'expense' },
    ]
    expect(calcBalance(txs)).toBe(70)
  })
})

describe('normalizeHex', () => {
  it('accepts a valid hex with hash prefix', () => {
    expect(normalizeHex('#6366f1')).toBe('#6366f1')
  })
  it('accepts a valid hex without hash prefix', () => {
    expect(normalizeHex('6366f1')).toBe('#6366f1')
  })
  it('normalizes uppercase letters to lowercase', () => {
    expect(normalizeHex('#6366F1')).toBe('#6366f1')
  })
  it('returns null for a 3-digit shorthand hex', () => {
    expect(normalizeHex('#fff')).toBeNull()
  })
  it('returns null for non-hex characters', () => {
    expect(normalizeHex('#gggggg')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(normalizeHex('')).toBeNull()
  })
})

describe('getDateRange', () => {
  const now = new Date(2026, 4, 20) // May 20 2026

  it('returns current month range for this-month', () => {
    const { from, to } = getDateRange('this-month', now)
    expect(from).toBe('2026-05-01')
    expect(to).toBe('2026-05-31')
  })

  it('returns previous month range for last-month', () => {
    const { from, to } = getDateRange('last-month', now)
    expect(from).toBe('2026-04-01')
    expect(to).toBe('2026-04-30')
  })

  it('returns 3-month range for last-3-months', () => {
    const { from, to } = getDateRange('last-3-months', now)
    expect(from).toBe('2026-02-20')
    expect(to).toBe('2026-05-20')
  })

  it('returns empty object for all-time', () => {
    expect(getDateRange('all-time', now)).toEqual({})
  })
})
