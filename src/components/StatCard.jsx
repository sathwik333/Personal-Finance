export default function StatCard({ label, value, color, icon: Icon, delay = 0 }) {
  return (
    <div
      className="glass-card rounded-2xl p-4 hover-lift cursor-default animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {Icon && (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color ? color.replace('text-', 'bg-') + '/15' : 'bg-white/10'}`}>
          <Icon size={14} className={color ?? 'text-gray-400'} aria-hidden="true" />
        </div>
      )}
      <p className="text-xs text-gray-400 font-medium mb-1 font-body">{label}</p>
      <p className={`text-lg font-bold leading-tight ${color ?? 'text-white'}`}>{value}</p>
    </div>
  )
}
