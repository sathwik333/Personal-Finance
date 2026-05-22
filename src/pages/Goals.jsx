import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { useGoals } from '../hooks/useGoals'
import { formatCurrency } from '../lib/utils'
import GoalRing from '../components/GoalRing'
import GoalSheet from '../components/GoalSheet'
import { SkeletonStatCards } from '../components/Skeleton'

export default function Goals() {
  const { goals, deposits, loading, error, addGoal, deleteGoal, addDeposit, deleteDeposit } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const selectedGoal = goals.find(g => g.id === selectedGoalId) ?? null
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newTarget, setNewTarget] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)

  async function handleAddGoal() {
    if (!newName.trim()) { setFormError('Enter a goal name'); return }
    if (!newTarget || Number(newTarget) <= 0) { setFormError('Enter a valid target amount'); return }
    setSaving(true)
    setFormError('')
    try {
      await addGoal({ name: newName.trim(), emoji: newEmoji, target_amount: newTarget, deadline: newDeadline || null })
      setShowNewForm(false)
      setNewName('')
      setNewEmoji('🎯')
      setNewTarget('')
      setNewDeadline('')
    } catch (err) { setFormError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Goals</h1>
          {goals.length > 0 && (
            <p className="text-xs text-gray-500 font-body mt-0.5">{formatCurrency(totalSaved)} saved across {goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center">Failed to load goals. Please refresh.</div>
      )}

      {loading ? <SkeletonStatCards /> : (
        <>
          {goals.length === 0 && !showNewForm && (
            <div className="glass-card rounded-2xl px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-body">No goals yet</p>
              <p className="text-gray-600 text-xs mt-1 font-body">Create your first savings goal below</p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-up">
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoalId(g.id)}
                  className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
                  style={g.complete ? { border: '1px solid rgba(52,211,153,0.3)' } : {}}
                >
                  <GoalRing pct={g.pct} complete={g.complete} />
                  <div>
                    <p className="text-sm font-semibold text-white">{g.emoji} {g.name}</p>
                    <p className="text-xs text-gray-500 font-body mt-0.5">
                      {formatCurrency(g.current_amount)} / {formatCurrency(Number(g.target_amount))}
                    </p>
                    {g.complete ? (
                      <p className="text-xs text-income font-body mt-0.5">🎉 Complete!</p>
                    ) : g.deadline ? (
                      <p className="text-xs text-gray-600 font-body mt-0.5">due {g.deadline}</p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* New goal form */}
          {showNewForm ? (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">New Goal</h2>
                <button onClick={() => { setShowNewForm(false); setFormError('') }} aria-label="Cancel new goal" className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-3">
                <div>
                  <label htmlFor="goal-emoji" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Emoji</label>
                  <input
                    id="goal-emoji"
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    className="glass-input rounded-xl px-3 py-3 text-xl text-center"
                    style={{ width: '56px' }}
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="goal-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Goal name</label>
                  <input
                    id="goal-name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                    placeholder="e.g. Vacation Fund"
                    autoFocus
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal-target" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Target amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg" aria-hidden="true">$</span>
                  <input
                    id="goal-target"
                    type="number" min="0.01" step="0.01"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="glass-input w-full rounded-xl pl-8 pr-4 py-3 text-xl font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal-deadline" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Deadline <span className="text-gray-600 normal-case font-normal">(optional)</span>
                </label>
                <input
                  id="goal-deadline"
                  type="date"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
                />
              </div>

              {formError && <p role="alert" className="text-expense text-sm font-body">{formError}</p>}

              <button onClick={handleAddGoal} disabled={saving} className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-40">
                {saving ? 'Creating…' : 'Create Goal'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer animate-fade-up"
              style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <Plus size={16} aria-hidden="true" /> New goal
            </button>
          )}
        </>
      )}

      {selectedGoal && (
        <GoalSheet
          goal={selectedGoal}
          deposits={deposits}
          onClose={() => setSelectedGoalId(null)}
          onAddDeposit={addDeposit}
          onDeleteDeposit={deleteDeposit}
          onDeleteGoal={async (id) => { await deleteGoal(id); setSelectedGoalId(null) }}
        />
      )}
    </div>
  )
}
