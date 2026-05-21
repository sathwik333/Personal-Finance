import { formatCurrency } from '../lib/utils'

export default function BudgetRing({ pct, remaining, totalLimit }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  const color = pct >= 1 ? '#f87171' : pct >= 0.8 ? '#fbbf24' : '#a78bfa'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-500 font-body">remaining</p>
          <p className="text-xl font-bold" style={{ color }}>{formatCurrency(Math.max(remaining, 0))}</p>
          <p className="text-xs text-gray-500 font-body">{Math.round(pct * 100)}% used</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-body">
        {formatCurrency(totalLimit - Math.max(remaining, 0))} spent of {formatCurrency(totalLimit)}
      </p>
    </div>
  )
}
