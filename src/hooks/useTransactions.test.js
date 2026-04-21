import { describe, it, expect } from 'vitest'
import { computeSummary } from './useTransactions'

describe('computeSummary', () => {
  const transactions = [
    { amount: 2000, type: 'income', categories: null },
    { amount: 45.50, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
    { amount: 8, type: 'expense', categories: { name: 'Rides', color: '#8B5CF6', icon: '🛵' } },
    { amount: 200, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
  ]

  it('calculates total income', () => {
    expect(computeSummary(transactions).totalIncome).toBe(2000)
  })

  it('calculates total expenses', () => {
    expect(computeSummary(transactions).totalExpenses).toBeCloseTo(253.50)
  })

  it('calculates balance', () => {
    expect(computeSummary(transactions).balance).toBeCloseTo(1746.50)
  })

  it('finds top category by spend', () => {
    expect(computeSummary(transactions).topCategory.name).toBe('Food')
  })
})
