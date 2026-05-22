export default function GoalRing({ pct, complete }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  const color = complete ? '#34d399' : '#a78bfa'

  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color, fontSize: 11, fontWeight: 700 }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}
