import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function computeBudgetStats(budgets, spending) {
  const totalLimit = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.category_id] || 0), 0)
  const budgetsWithStats = budgets.map(b => {
    const spent = spending[b.category_id] || 0
    const limit = Number(b.monthly_limit)
    const pct = limit > 0 ? Math.min(spent / limit, 1) : 0
    const status = spent >= limit ? 'over' : spent >= limit * 0.8 ? 'warning' : 'ok'
    return { ...b, spent, pct, status }
  })
  return { totalLimit, totalSpent, budgetsWithStats }
}

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [spending, setSpending] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBudgets = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const now = new Date()
    const from = format(startOfMonth(now), 'yyyy-MM-dd')
    const to = format(endOfMonth(now), 'yyyy-MM-dd')

    const [{ data: budgetData, error: budgetErr }, { data: txData, error: txErr }] = await Promise.all([
      supabase.from('budgets').select('*, categories(id, name, icon, color)').eq('user_id', user.id),
      supabase.from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to),
    ])

    if (budgetErr || txErr) { setError(budgetErr || txErr); setLoading(false); return }

    const spendMap = {}
    for (const tx of txData ?? []) {
      if (!tx.category_id) continue
      spendMap[tx.category_id] = (spendMap[tx.category_id] || 0) + Number(tx.amount)
    }

    setBudgets(budgetData ?? [])
    setSpending(spendMap)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { setBudgets([]); setSpending({}); return }
    fetchBudgets()
  }, [fetchBudgets])

  const addBudget = useCallback(async ({ category_id, monthly_limit }) => {
    const { data, error } = await supabase
      .from('budgets')
      .insert({ user_id: user.id, category_id, monthly_limit: Number(monthly_limit) })
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    if (!data) throw new Error('Budget was not saved. Please try again.')
    setBudgets(prev => [...prev, data])
    return data
  }, [user])

  const updateBudget = useCallback(async (id, monthly_limit) => {
    const { data, error } = await supabase
      .from('budgets')
      .update({ monthly_limit: Number(monthly_limit) })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setBudgets(prev => prev.map(b => b.id === id ? data : b))
    return data
  }, [user])

  const deleteBudget = useCallback(async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [user])

  return { budgets, spending, loading, error, addBudget, updateBudget, deleteBudget, refetch: fetchBudgets }
}
