import { describe, it, expect } from 'vitest'
import { computeBudgetStats } from './useBudgets'

const budgets = [
  { id: '1', category_id: 'cat-a', monthly_limit: '500.00', categories: { name: 'Food', icon: '🍔', color: '#F59E0B' } },
  { id: '2', category_id: 'cat-b', monthly_limit: '200.00', categories: { name: 'Transport', icon: '🚗', color: '#3B82F6' } },
  { id: '3', category_id: 'cat-c', monthly_limit: '100.00', categories: { name: 'Fun', icon: '🎮', color: '#8B5CF6' } },
]

const spending = { 'cat-a': 340, 'cat-b': 210, 'cat-c': 50 }

describe('computeBudgetStats', () => {
  it('sums total limit across all budgets', () => {
    const { totalLimit } = computeBudgetStats(budgets, spending)
    expect(totalLimit).toBe(800)
  })

  it('sums total spent across all budgets', () => {
    const { totalSpent } = computeBudgetStats(budgets, spending)
    expect(totalSpent).toBe(600)
  })

  it('marks over-limit budget as over', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-b').status).toBe('over')
  })

  it('marks 68% spent budget as ok', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-a').status).toBe('ok')
  })

  it('marks 50% spent budget as ok', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-c').status).toBe('ok')
  })

  it('returns 0 spent for category with no transactions', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, {})
    expect(budgetsWithStats[0].spent).toBe(0)
  })

  it('caps pct at 1 when over budget', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-b').pct).toBe(1)
  })

  it('marks 85% spent budget as warning', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, { 'cat-a': 425 })
    expect(budgetsWithStats.find(b => b.category_id === 'cat-a').status).toBe('warning')
  })

  it('marks exactly 80% spent budget as warning (boundary)', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, { 'cat-a': 400 })
    expect(budgetsWithStats.find(b => b.category_id === 'cat-a').status).toBe('warning')
  })
})
