import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { groupByCategory } from '../lib/utils'

export function computeSummary(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const byCategory = groupByCategory(transactions)
  const topCategory = [...byCategory].sort((a, b) => b.value - a.value)[0] ?? null

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, topCategory, byCategory }
}

export function useTransactions({ from, to } = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data, error } = await query
    if (!error) setTransactions(data)
    setLoading(false)
  }, [user, from, to])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  async function addTransaction({ amount, type, category_id, note, date }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, amount: Number(amount), type, category_id: category_id || null, note: note || null, date })
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setTransactions(prev => [data, ...prev])
    return data
  }

  async function updateTransaction(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const summary = computeSummary(transactions)

  return { transactions, loading, summary, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions }
}
