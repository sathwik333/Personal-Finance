import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
    if (error) {
      setError(error)
      setLoading(false)
      return
    }
    setCategories(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchCategories()
  }, [fetchCategories])

  async function addCategory({ name, icon, color }) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, icon, color })
      .select()
      .single()
    if (error) throw error
    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  async function updateCategory(id, { name, icon, color }) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, icon, color })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setCategories(prev =>
      prev.map(c => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data
  }

  const systemCategories = categories.filter(c => c.user_id === null)
  const customCategories = categories.filter(c => c.user_id !== null)

  return { categories, systemCategories, customCategories, loading, error, addCategory, deleteCategory, updateCategory, refetch: fetchCategories }
}
