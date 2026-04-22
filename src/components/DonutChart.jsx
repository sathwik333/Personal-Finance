import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function DonutChart({ data }) {
  if (!data || data.length === 0) {
    return <div role="status" className="flex items-center justify-center h-48 text-gray-500 text-sm">No expense data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart role="img" aria-label="Spending by category">
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
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
        <Legend
          formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
