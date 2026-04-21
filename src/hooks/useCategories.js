import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchCategories()
  }, [user])

  async function fetchCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
    if (!error) setCategories(data)
    setLoading(false)
  }

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

  const systemCategories = categories.filter(c => c.user_id === null)
  const customCategories = categories.filter(c => c.user_id !== null)

  return { categories, systemCategories, customCategories, loading, addCategory, deleteCategory, refetch: fetchCategories }
}
