import { describe, it, expect } from 'vitest'
import { computeGoalStats } from './useGoals'

const goals = [
  { id: 'g1', name: 'Vacation', emoji: '✈️', target_amount: '3000.00' },
  { id: 'g2', name: 'Emergency', emoji: '🏠', target_amount: '5000.00' },
  { id: 'g3', name: 'New Laptop', emoji: '💻', target_amount: '1500.00' },
]

const deposits = [
  { goal_id: 'g1', amount: '1800.00' },
  { goal_id: 'g1', amount: '200.00' },
  { goal_id: 'g2', amount: '500.00' },
  { goal_id: 'g3', amount: '1500.00' },
]

describe('computeGoalStats', () => {
  it('sums deposits for each goal', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').current_amount).toBe(2000)
  })

  it('calculates percentage progress', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').pct).toBeCloseTo(2000 / 3000)
  })

  it('returns 0 for goal with no deposits', () => {
    const result = computeGoalStats(goals, [])
    expect(result.find(g => g.id === 'g1').current_amount).toBe(0)
  })

  it('marks goal as complete when current >= target', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g3').complete).toBe(true)
  })

  it('does not mark incomplete goal as complete', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').complete).toBe(false)
  })

  it('caps pct at 1 when over target', () => {
    const overdepositedDeposits = [...deposits, { goal_id: 'g3', amount: '500.00' }]
    const result = computeGoalStats(goals, overdepositedDeposits)
    expect(result.find(g => g.id === 'g3').pct).toBe(1)
  })
})
