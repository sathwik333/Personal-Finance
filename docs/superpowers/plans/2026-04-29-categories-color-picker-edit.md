# Categories: Color Picker & Edit Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 10-swatch color picker with a full HSL color wheel (`react-colorful`) and add inline edit (name, icon, color) for custom categories.

**Architecture:** Install `react-colorful` for the color wheel. Add `normalizeHex` to the existing utils. Add `updateCategory` to `useCategories`. Rewrite `Categories.jsx` in two commits — first the color wheel in the Add form, then the inline Edit form.

**Tech Stack:** React 18, `react-colorful`, Supabase JS, Lucide React, Tailwind CSS, Vitest

---

## File Map

| File | Change |
|------|--------|
| `package.json` | Add `react-colorful` dependency |
| `src/lib/utils.js` | Add `normalizeHex` export |
| `src/lib/utils.test.js` | Add `normalizeHex` tests |
| `src/hooks/useCategories.js` | Add `updateCategory` function + export |
| `src/pages/Categories.jsx` | Replace swatches with `HexColorPicker`, add inline edit |

---

## Task 1: Install react-colorful

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install react-colorful
```

- [ ] **Step 2: Verify it appears in package.json**

Open `package.json` and confirm `"react-colorful"` appears in `"dependencies"`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-colorful dependency"
```

---

## Task 2: Add normalizeHex utility and tests

**Files:**
- Modify: `src/lib/utils.js`
- Modify: `src/lib/utils.test.js`

- [ ] **Step 1: Write failing tests in `src/lib/utils.test.js`**

Add these tests to the existing file (after all current content):

```js
import { describe, it, expect } from 'vitest'
import { normalizeHex } from './utils'

describe('normalizeHex', () => {
  it('accepts a valid hex with hash prefix', () => {
    expect(normalizeHex('#6366f1')).toBe('#6366f1')
  })
  it('accepts a valid hex without hash prefix', () => {
    expect(normalizeHex('6366f1')).toBe('#6366f1')
  })
  it('normalizes uppercase letters to lowercase', () => {
    expect(normalizeHex('#6366F1')).toBe('#6366f1')
  })
  it('returns null for a 3-digit shorthand hex', () => {
    expect(normalizeHex('#fff')).toBeNull()
  })
  it('returns null for non-hex characters', () => {
    expect(normalizeHex('#gggggg')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(normalizeHex('')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose src/lib/utils.test.js
```

Expected: 6 failures with `normalizeHex is not a function` or similar.

- [ ] **Step 3: Add normalizeHex to `src/lib/utils.js`**

Append this export to the end of the file (after `calcBalance`):

```js
export function normalizeHex(value) {
  const cleaned = value.startsWith('#') ? value : `#${value}`
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned.toLowerCase() : null
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose src/lib/utils.test.js
```

Expected: all 6 `normalizeHex` tests PASS, all prior `computeSummary` tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js
git commit -m "feat: add normalizeHex utility with tests"
```

---

## Task 3: Add updateCategory to useCategories

**Files:**
- Modify: `src/hooks/useCategories.js`

- [ ] **Step 1: Add the `updateCategory` function**

Open `src/hooks/useCategories.js`. After the `deleteCategory` function (line 49), add:

```js
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
```

- [ ] **Step 2: Export updateCategory from the hook**

Find the return statement at the bottom of the hook (currently line 54) and replace it:

Old:
```js
  return { categories, systemCategories, customCategories, loading, error, addCategory, deleteCategory, refetch: fetchCategories }
```

New:
```js
  return { categories, systemCategories, customCategories, loading, error, addCategory, deleteCategory, updateCategory, refetch: fetchCategories }
```

- [ ] **Step 3: Run existing tests to confirm no regressions**

```bash
npm test -- --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCategories.js
git commit -m "feat: add updateCategory to useCategories hook"
```

---

## Task 4: Rewrite Categories.jsx with color wheel and inline edit

**Files:**
- Modify: `src/pages/Categories.jsx`

This is a full file replacement that delivers both the color wheel (Add form) and the inline edit form (custom categories) in one commit.

- [ ] **Step 1: Replace the entire content of `src/pages/Categories.jsx`**

```jsx
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
      setName('')
      setIcon('📦')
      setColor('#6366f1')
      setHexText('#6366f1')
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
            <button type="button" onClick={() => {
              setShowForm(false)
              setName('')
              setIcon('📦')
              setColor('#6366f1')
              setHexText('#6366f1')
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
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
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
```

- [ ] **Step 2: Run all tests to confirm no regressions**

```bash
npm test -- --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Open the app in a browser, navigate to Categories:
- Click **Add** — confirm the color wheel and hex input appear instead of swatches
- Drag the wheel — confirm the hex input updates live
- Type a valid hex in the input (e.g. `#ff0000`) — confirm the wheel jumps to that color
- Type a partial/invalid hex (e.g. `#gg`) — confirm the wheel stays on the previous valid color
- Save a new category — confirm it appears in the Custom list with the chosen color

- [ ] **Step 4: Commit**

```bash
git add src/pages/Categories.jsx
git commit -m "feat: replace color swatches with HexColorPicker and add inline category edit"
```

---

## Task 5: Regression check

**Files:** (read-only)

- [ ] **Step 1: Run the full test suite**

```bash
npm test -- --reporter=verbose
```

Expected: all tests PASS with no warnings.

- [ ] **Step 2: Manual smoke test — edit flow**

With the dev server running (`npm run dev`):

1. Navigate to Categories
2. Click the **pencil icon** on a custom category — confirm the inline form expands below that row, pre-filled with the current name, icon, and color
3. Change the name, pick a different icon, drag the color wheel — confirm all three fields update
4. Click **Save** — confirm the row updates immediately without a page reload, and the form collapses
5. Click pencil on a second category while the first is open — confirm the first closes and the second opens
6. Click **Cancel** — confirm the form collapses and the category row shows its original values
7. Verify system (default) categories have **no pencil icon**
