# Categories: Color Picker & Edit Feature

**Date:** 2026-04-29
**Status:** Approved

## Summary

Upgrade the Categories page with two improvements:
1. Replace the 10-swatch color picker with a full HSL color wheel (`react-colorful`)
2. Add inline edit capability for custom categories (name, icon, color)

## Scope

- Custom categories only get edit. System (default) categories remain read-only.
- Delete behavior is unchanged.
- Both the Add form and the Edit form use the new color wheel.

## Data Layer

**File:** `src/hooks/useCategories.js`

Add one new function to the existing hook:

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

Return `updateCategory` from the hook alongside the existing exports.

## Color Picker Component

**Dependency:** `react-colorful` (~2.8KB gzipped, no peer deps)

Replace the existing `COLORS` swatch row in `Categories.jsx` with:

1. `<HexColorPicker color={color} onChange={setColor} />` — full HSL wheel
2. A hex text `<input>` below it showing the current hex value. Typing/pasting a valid 6-digit hex (with or without `#`) updates the color state. Invalid input is ignored silently.

The existing colored circle preview in each category row updates live as the user picks.

The `COLORS` constant array is removed entirely.

## Edit UI — Inline Expand

**File:** `src/pages/Categories.jsx`

### State additions
```js
const [editingId, setEditingId] = useState(null)
const [editName, setEditName] = useState('')
const [editIcon, setEditIcon] = useState('')
const [editColor, setEditColor] = useState('')
const [editSaving, setEditSaving] = useState(false)
const [editError, setEditError] = useState('')
```

### Row changes (custom categories only)
- Add a `Pencil` icon button (Lucide) next to the existing `Trash2` button
- Clicking pencil: sets `editingId = cat.id`, pre-fills `editName/editIcon/editColor` from the category
- If another row is already open, it closes automatically (single `editingId` state handles this)

### Inline form (rendered below the row when `editingId === cat.id`)
- Name text input (pre-filled)
- Emoji grid (same 18 emojis, same ring highlight style)
- `HexColorPicker` + hex text input (pre-filled with current color)
- **Save** button: calls `updateCategory(editingId, { name: editName, icon: editIcon, color: editColor })`, then clears `editingId`
- **Cancel** button: clears `editingId` and edit state
- Error message shown if save fails

### Validation
- Save is blocked if `editName.trim()` is empty (same rule as add)

## Error Handling

- Save errors display inline below the edit form (same pattern as the add form)
- Network/Supabase errors are surfaced as text, not alerts

## Testing Notes

- Verify color wheel renders and updates the hex input live
- Verify hex input accepts pasted values and updates the wheel
- Verify edit form pre-fills correctly
- Verify only one edit form is open at a time
- Verify save updates the row in the list without a page reload
- Verify system categories have no edit/pencil icon
