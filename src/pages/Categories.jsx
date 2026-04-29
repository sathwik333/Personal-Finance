import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useCategories } from '../hooks/useCategories'
import { normalizeHex } from '../lib/utils'

const EMOJIS = ['🍔','🚗','🛵','🛍️','🧾','🏥','🎬','📚','📦','💊','🏋️','✈️','🎮','🍺','☕','🐾','🏠','💡']

export default function Categories() {
  const { systemCategories, customCategories, loading, error: fetchError, addCategory, deleteCategory, updateCategory } = useCategories()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#6366f1')
  const [hexText, setHexText] = useState('#6366f1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editHexText, setEditHexText] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await addCategory({ name: name.trim(), icon, color })
      resetAddForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function resetAddForm() {
    setShowForm(false)
    setName('')
    setIcon('📦')
    setColor('#6366f1')
    setHexText('#6366f1')
    setError('')
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Transactions using it will become uncategorized.')) return
    setDeleteError('')
    try {
      await deleteCategory(id)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  function handleEditOpen(cat) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditIcon(cat.icon)
    setEditColor(cat.color)
    setEditHexText(cat.color)
    setEditError('')
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditName('')
    setEditIcon('')
    setEditColor('')
    setEditHexText('')
    setEditError('')
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editName.trim()) return
    setEditSaving(true)
    setEditError('')
    try {
      await updateCategory(editingId, { name: editName.trim(), icon: editIcon, color: editColor })
      handleEditCancel()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditSaving(false)
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
                  aria-label={`Select ${e} icon`}
                  aria-pressed={icon === e}
                  className={`text-xl p-1 rounded ${icon === e ? 'ring-2 ring-accent' : ''}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Color</label>
            <HexColorPicker
              color={color}
              onChange={val => { setColor(val); setHexText(val) }}
              style={{ width: '100%' }}
            />
            <input
              type="text"
              value={hexText}
              onChange={e => {
                setHexText(e.target.value)
                const normalized = normalizeHex(e.target.value)
                if (normalized) setColor(normalized)
              }}
              className="mt-2 w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent"
              placeholder="#6366f1"
              maxLength={7}
            />
          </div>
          {error && <p className="text-expense text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={resetAddForm}
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

      {deleteError && <p className="text-expense text-sm">{deleteError}</p>}

      {customCategories.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Custom</h2>
          <div className="bg-surface rounded-xl divide-y divide-gray-800">
            {customCategories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-white flex-1">{cat.name}</span>
                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                  <button
                    type="button"
                    onClick={() => editingId === cat.id ? handleEditCancel() : handleEditOpen(cat)}
                    className="text-gray-600 hover:text-accent transition-colors mr-2"
                    aria-label="Edit category"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    className="text-gray-600 hover:text-expense transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {editingId === cat.id && (
                  <form onSubmit={handleEditSave} className="px-4 pb-4 space-y-4 border-t border-gray-800">
                    <div className="pt-3">
                      <label htmlFor={`edit-name-${cat.id}`} className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
                        id={`edit-name-${cat.id}`}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
                        placeholder="Category name"
                        maxLength={30}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOJIS.map(e => (
                          <button key={e} type="button" onClick={() => setEditIcon(e)}
                            aria-label={`Select ${e} icon`}
                            aria-pressed={editIcon === e}
                            className={`text-xl p-1 rounded ${editIcon === e ? 'ring-2 ring-accent' : ''}`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Color</label>
                      <HexColorPicker
                        color={editColor}
                        onChange={val => { setEditColor(val); setEditHexText(val) }}
                        style={{ width: '100%' }}
                      />
                      <input
                        type="text"
                        value={editHexText}
                        onChange={e => {
                          setEditHexText(e.target.value)
                          const normalized = normalizeHex(e.target.value)
                          if (normalized) setEditColor(normalized)
                        }}
                        className="mt-2 w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent"
                        placeholder="#6366f1"
                        maxLength={7}
                      />
                    </div>
                    {editError && <p className="text-expense text-sm">{editError}</p>}
                    <div className="flex gap-2">
                      <button type="submit" disabled={editSaving}
                        className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={handleEditCancel}
                        className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
