export default function StatCard({ label, value, color }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color ?? 'text-white'}`}>{value}</p>
    </div>
  )
}
