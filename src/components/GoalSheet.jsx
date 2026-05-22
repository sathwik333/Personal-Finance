import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency, formatDate } from '../lib/utils'
import GoalRing from './GoalRing'

export default function GoalSheet({ goal, deposits, onClose, onAddDeposit, onDeleteDeposit, onDeleteGoal }) {
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const goalDeposits = deposits.filter(d => d.goal_id === goal.id)

  async function handleAddDeposit() {
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onAddDeposit({ goal_id: goal.id, amount, date, note })
      setAmount('')
      setNote('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setShowDepositForm(false)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function handleDeleteDeposit(id) {
    if (!confirm('Remove this deposit?')) return
    try { await onDeleteDeposit(id) } catch (err) { console.error(err) }
  }

  async function handleDeleteGoal() {
    if (!confirm(`Delete "${goal.name}"? All deposits will be lost. This cannot be undone.`)) return
    try { await onDeleteGoal(goal.id); onClose() } catch (err) { console.error(err) }
  }

  const sheet = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '448px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(13, 16, 30, 0.99)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '28px 28px 0 0', boxShadow: '0 -8px 60px rgba(0,0,0,0.7)', animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GoalRing pct={goal.pct} complete={goal.complete} />
            <div>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{goal.emoji} {goal.name}</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '2px 0 0' }}>
                {formatCurrency(goal.current_amount)} of {formatCurrency(Number(goal.target_amount))}
                {goal.deadline ? ` · due ${formatDate(goal.deadline)}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '12px', color: '#94A3B8', cursor: 'pointer', padding: '8px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Add deposit form */}
          {showDepositForm ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>Add deposit</p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700, fontSize: '18px' }}>$</span>
                <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                  className="glass-input" style={{ width: '100%', borderRadius: '12px', paddingLeft: '34px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px', fontSize: '20px', fontWeight: 700, boxSizing: 'border-box' }}
                  placeholder="0.00" autoFocus />
              </div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="glass-input" style={{ width: '100%', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box' }} />
              <input value={note} onChange={e => setNote(e.target.value)}
                className="glass-input" style={{ width: '100%', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Note (optional)" maxLength={100} />
              {error && <p role="alert" style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAddDeposit} disabled={saving} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving…' : 'Add'}
                </button>
                <button onClick={() => { setShowDepositForm(false); setAmount(''); setNote(''); setError('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDepositForm(true)}
              className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Deposit
            </button>
          )}

          {/* Deposit history */}
          {goalDeposits.length > 0 && (
            <div>
              <p style={{ color: '#64748B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Deposit History</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', overflow: 'hidden' }}>
                {goalDeposits.map((d, i) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: i < goalDeposits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div>
                      <p style={{ color: '#34d399', fontWeight: 700, fontSize: '14px', margin: 0 }}>+{formatCurrency(Number(d.amount))}</p>
                      <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
                        {formatDate(d.date)}{d.note ? ` · ${d.note}` : ''}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteDeposit(d.id)} aria-label="Delete deposit" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete goal */}
          <button onClick={handleDeleteGoal}
            style={{ marginTop: '8px', width: '100%', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
            Delete goal
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(sheet, document.body)
}
