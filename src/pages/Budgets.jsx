import { useState } from 'react'
import { Plus, Pencil, Check, Trash2 } from 'lucide-react'
import { useBudgets, computeBudgetStats } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency } from '../lib/utils'
import BudgetRing from '../components/BudgetRing'
import { SkeletonStatCards } from '../components/Skeleton'

function statusColor(status) {
  if (status === 'over') return { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', text: '#f87171' }
  if (status === 'warning') return { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', text: '#fbbf24' }
  return { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', text: '#34d399' }
}

function statusLabel(status, spent, limit) {
  if (status === 'over') return `$${(spent - limit).toFixed(0)} over`
  return `$${(limit - spent).toFixed(0)} left`
}

export default function Budgets() {
  const { budgets, spending, loading, error, addBudget, updateBudget, deleteBudget } = useBudgets()
  const { categories } = useCategories()
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addCategoryId, setAddCategoryId] = useState('')
  const [addLimit, setAddLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const { totalLimit, totalSpent, budgetsWithStats } = computeBudgetStats(budgets, spending)
  const remaining = totalLimit - totalSpent
  const overallPct = totalLimit > 0 ? totalSpent / totalLimit : 0

  const now = new Date()
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const categoriesWithoutBudget = categories.filter(
    c => !budgets.some(b => b.category_id === c.id)
  )

  async function handleSaveEdit(budget) {
    if (!editValue || Number(editValue) <= 0) return
    setSaving(true)
    try { await updateBudget(budget.id, editValue) } catch (err) { console.error(err) } finally {
      setSaving(false)
      setEditingId(null)
    }
  }

  async function handleAddBudget() {
    if (!addCategoryId || !addLimit || Number(addLimit) <= 0) return
    setSaving(true)
    try {
      await addBudget({ category_id: addCategoryId, monthly_limit: addLimit })
      setShowAddForm(false)
      setAddCategoryId('')
      setAddLimit('')
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this budget?')) return
    try { await deleteBudget(id) } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Budgets</h1>
        <p className="text-xs text-gray-500 font-body mt-0.5">{monthLabel}</p>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center">Failed to load budgets. Please refresh.</div>
      )}

      {loading ? <SkeletonStatCards /> : (
        <>
          {/* Summary ring */}
          {totalLimit > 0 && (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center animate-fade-up">
              <BudgetRing pct={overallPct} remaining={remaining} totalLimit={totalLimit} />
            </div>
          )}

          {budgetsWithStats.length === 0 && (
            <div className="glass-card rounded-2xl px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-body">No budgets set yet</p>
              <p className="text-gray-600 text-xs mt-1 font-body">Set a monthly limit for any category</p>
            </div>
          )}

          {/* Budget grid */}
          {budgetsWithStats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
              {budgetsWithStats.map(b => {
                const colors = statusColor(b.status)
                return editingId === b.id ? (
                  <div key={b.id} className="rounded-2xl p-4 space-y-2" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <p className="text-xs font-semibold text-white">{b.categories?.icon} {b.categories?.name}</p>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                      placeholder="Monthly limit"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(b)} disabled={saving} className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-income bg-income/15 cursor-pointer">
                        <Check size={12} className="inline mr-1" aria-hidden="true" />Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={b.id} className="rounded-2xl p-4 space-y-2 group" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold text-white truncate">{b.categories?.icon} {b.categories?.name}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(b.id); setEditValue(b.monthly_limit) }}
                          aria-label={`Edit ${b.categories?.name} budget`}
                          className="cursor-pointer text-gray-500 hover:text-white"
                        >
                          <Pencil size={11} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          aria-label={`Delete ${b.categories?.name} budget`}
                          className="cursor-pointer text-gray-500 hover:text-expense"
                        >
                          <Trash2 size={11} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 font-body">{formatCurrency(b.spent)}</span>
                        <span className="text-gray-500 font-body">{formatCurrency(Number(b.monthly_limit))}</span>
                      </div>
                      <div className="rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="rounded-full h-1.5 transition-all duration-500"
                          style={{ width: `${b.pct * 100}%`, background: colors.text }}
                          role="progressbar"
                          aria-valuenow={Math.round(b.pct * 100)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${b.categories?.name} budget ${Math.round(b.pct * 100)}% used`}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-semibold font-body" style={{ color: colors.text }}>
                      {statusLabel(b.status, b.spent, Number(b.monthly_limit))}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add budget button / form */}
          {categoriesWithoutBudget.length > 0 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer animate-fade-up"
              style={{ border: '1px dashed rgba(255,255,255,0.12)', animationDelay: '120ms', animationFillMode: 'both' }}
            >
              <Plus size={16} aria-hidden="true" /> Set budget for a category
            </button>
          )}

          {showAddForm && (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-up">
              <h2 className="text-sm font-semibold text-white">Set a budget</h2>
              <div>
                <label htmlFor="budget-category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  id="budget-category"
                  value={addCategoryId}
                  onChange={e => setAddCategoryId(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
                  style={{ appearance: 'none' }}
                >
                  <option value="" style={{ background: '#0F1221' }}>Choose a category…</option>
                  {categoriesWithoutBudget.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0F1221' }}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budget-limit" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Monthly limit ($)</label>
                <input
                  id="budget-limit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={addLimit}
                  onChange={e => setAddLimit(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddBudget}
                  disabled={saving || !addCategoryId || !addLimit}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Set Budget'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setAddCategoryId(''); setAddLimit('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer glass-card"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
