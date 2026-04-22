import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { format } from 'date-fns'

export default function TransactionForm({ onSave, onClose, initial = null }) {
  const { categories } = useCategories()
  const [type, setType] = useState(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function handleSave() {
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ amount: Number(amount), type, category_id: categoryId || null, note, date })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        style={{
          width: '100%',
          maxWidth: '448px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(13, 16, 30, 0.99)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Pinned header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>
            {initial ? 'Edit' : 'New'} Transaction
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              borderRadius: '12px',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '6px' }}>
            {[
              { key: 'expense', label: 'Expense', Icon: ArrowDownCircle, color: '#F87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
              { key: 'income', label: 'Income', Icon: ArrowUpCircle, color: '#34D399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
            ].map(({ key, label, Icon, color, bg, border }) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: `1px solid ${type === key ? border : 'transparent'}`,
                  background: type === key ? bg : 'transparent',
                  color: type === key ? color : '#64748B',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="tx-amount" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700, fontSize: '18px' }}>$</span>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="glass-input"
                style={{ width: '100%', borderRadius: '14px', paddingLeft: '36px', paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px', fontSize: '24px', fontWeight: 700, boxSizing: 'border-box' }}
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="tx-category" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Category
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="glass-input"
              style={{ width: '100%', borderRadius: '14px', padding: '12px 16px', fontSize: '14px', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' }}
            >
              <option value="" style={{ background: '#0D101E' }}>No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: '#0D101E' }}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="tx-date" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="glass-input"
              style={{ width: '100%', borderRadius: '14px', padding: '12px 16px', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}
            />
          </div>

          {/* Note */}
          <div style={{ paddingBottom: '8px' }}>
            <label htmlFor="tx-note" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Note <span style={{ textTransform: 'none', color: '#374151' }}>(optional)</span>
            </label>
            <input
              id="tx-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="glass-input"
              style={{ width: '100%', borderRadius: '14px', padding: '12px 16px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="What was this for?"
              maxLength={100}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: '#F87171', fontSize: '14px', margin: 0 }}>{error}</p>
          )}
        </div>

        {/* ── Pinned submit — always visible at bottom ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </span>
            ) : initial ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
