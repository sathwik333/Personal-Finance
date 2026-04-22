import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div role="status" className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} role="img" aria-label="Daily spending trend line chart">
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1D27" />
        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={v => [`$${Number(v).toFixed(2)}`, 'Spent']}
          contentStyle={{ backgroundColor: '#1A1D27', border: 'none', borderRadius: 8 }}
        />
        <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
