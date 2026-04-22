import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function SpendingBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div role="status" className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }} role="img" aria-label="Spending by category bar chart">
        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={v => [`$${Number(v).toFixed(2)}`, 'Spent']}
          contentStyle={{
            backgroundColor: 'rgba(10, 12, 28, 0.97)',
            border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: '#A78BFA' }}
          cursor={{ fill: 'rgba(167,139,250,0.08)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
