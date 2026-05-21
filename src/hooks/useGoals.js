import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function computeGoalStats(goals, deposits) {
  const depositMap = {}
  for (const d of deposits) {
    depositMap[d.goal_id] = (depositMap[d.goal_id] || 0) + Number(d.amount)
  }
  return goals.map(g => {
    const current = depositMap[g.id] || 0
    const target = Number(g.target_amount)
    const pct = Math.min(current / target, 1)
    return { ...g, current_amount: current, pct, complete: current >= target }
  })
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const [{ data: goalsData, error: goalsErr }, { data: depositsData, error: depositsErr }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('goal_deposits').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ])

    if (goalsErr || depositsErr) { setError(goalsErr || depositsErr); setLoading(false); return }
    setGoals(goalsData ?? [])
    setDeposits(depositsData ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { setGoals([]); setDeposits([]); return }
    fetchGoals()
  }, [fetchGoals])

  const addGoal = useCallback(async ({ name, emoji, target_amount, deadline }) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: user.id, name, emoji: emoji || '🎯', target_amount: Number(target_amount), deadline: deadline || null })
      .select()
      .single()
    if (error) throw error
    setGoals(prev => [...prev, data])
    return data
  }, [user])

  const deleteGoal = useCallback(async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setGoals(prev => prev.filter(g => g.id !== id))
    setDeposits(prev => prev.filter(d => d.goal_id !== id))
  }, [user])

  const addDeposit = useCallback(async ({ goal_id, amount, date, note }) => {
    const { data, error } = await supabase
      .from('goal_deposits')
      .insert({ goal_id, user_id: user.id, amount: Number(amount), date, note: note || null })
      .select()
      .single()
    if (error) throw error
    setDeposits(prev => [data, ...prev])
    return data
  }, [user])

  const deleteDeposit = useCallback(async (id) => {
    const { error } = await supabase.from('goal_deposits').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setDeposits(prev => prev.filter(d => d.id !== id))
  }, [user])

  const goalsWithStats = computeGoalStats(goals, deposits)

  return { goals: goalsWithStats, deposits, loading, error, addGoal, deleteGoal, addDeposit, deleteDeposit, refetch: fetchGoals }
}
