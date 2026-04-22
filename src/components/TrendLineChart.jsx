import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div role="status" className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} role="img" aria-label="Daily spending trend line chart">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
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
        />
        <Line type="monotone" dataKey="total" stroke="#A78BFA" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#A78BFA', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
