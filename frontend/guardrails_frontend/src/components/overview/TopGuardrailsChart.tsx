import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Mock data for top guardrails triggered
const data = [
  { name: 'Prompt Injection', count: 145, color: '#ef4444' },
  { name: 'Secrets Scanner', count: 289, color: '#f59e0b' },
  { name: 'PII Detection', count: 198, color: '#3b82f6' },
  { name: 'Toxic Content', count: 156, color: '#8b5cf6' },
  { name: 'Tool Authorization', count: 87, color: '#10b981' },
]

export default function TopGuardrailsChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            type="number"
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
            formatter={(value: number) => [value, 'Triggers']}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]}
            className="hover:opacity-80 transition-opacity"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
