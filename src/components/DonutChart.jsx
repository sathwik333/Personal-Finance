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
          formatter={(value) => [`$${value.toFixed(2)}`, '']}
          contentStyle={{ backgroundColor: '#1A1D27', border: 'none', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
