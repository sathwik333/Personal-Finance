import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'

const COLORS = ['#F59E0B','#3B82F6','#8B5CF6','#EC4899','#EF4444','#10B981','#F97316','#06B6D4','#6B7280','#6366F1']
const EMOJIS = ['🍔','🚗','🛵','🛍️','🧾','🏥','🎬','📚','📦','💊','🏋️','✈️','🎮','🍺','☕','🐾','🏠','💡']

export default function Categories() {
  const { systemCategories, customCategories, loading, error: fetchError, addCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#6366F1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await addCategory({ name: name.trim(), icon, color })
      setName('')
      setIcon('📦')
      setColor('#6366F1')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Transactions using it will become uncategorized.')) return
    try {
      await deleteCategory(id)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p className="text-gray-400 py-8 text-center">Loading...</p>
  if (fetchError) return <p className="text-expense py-8 text-center">Failed to load categories. Please refresh.</p>

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface rounded-xl p-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              id="cat-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="Category name"
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setIcon(e)}
                  className={`text-xl p-1 rounded ${icon === e ? 'ring-2 ring-accent' : ''}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                  aria-pressed={color === c}
                  className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-expense text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => {
              setShowForm(false)
              setName('')
              setIcon('📦')
              setColor('#6366F1')
              setError('')
            }}
              className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <section>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Default</h2>
        <div className="bg-surface rounded-xl divide-y divide-gray-800">
          {systemCategories.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-500">No default categories found.</p>
            : systemCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-white flex-1">{cat.name}</span>
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                </div>
              ))
          }
        </div>
      </section>

      {customCategories.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Custom</h2>
          <div className="bg-surface rounded-xl divide-y divide-gray-800">
            {customCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-white flex-1">{cat.name}</span>
                <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                <button onClick={() => handleDelete(cat.id)} className="text-gray-600 hover:text-expense transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
