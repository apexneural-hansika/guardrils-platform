import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subHours } from 'date-fns'

// Generate mock data for last 24 hours (hourly buckets)
const generateMockData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const hour = subHours(now, i)
    const hourStr = format(hour, 'HH:mm')
    
    // Generate realistic variation
    const baseAllowed = 80 + Math.random() * 40
    const baseBlocked = 5 + Math.random() * 15
    const baseRedacted = 2 + Math.random() * 8
    const baseReview = Math.random() * 3
    
    // Add some time-based variation (more activity during business hours)
    const hourNum = hour.getHours()
    const businessHoursMultiplier = hourNum >= 9 && hourNum <= 17 ? 1.3 : 0.7
    
    data.push({
      time: hourStr,
      hour: hourNum,
      Allowed: Math.round(baseAllowed * businessHoursMultiplier),
      Blocked: Math.round(baseBlocked * businessHoursMultiplier),
      Redacted: Math.round(baseRedacted * businessHoursMultiplier),
      'Review Required': Math.round(baseReview * businessHoursMultiplier),
    })
  }
  
  return data
}

const data = generateMockData()

export default function DecisionTrendChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRedacted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="time" 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
            itemStyle={{ color: '#374151', padding: '4px 0' }}
            formatter={(value: number, name: string) => [value, name]}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="Allowed"
            stackId="1"
            stroke="#22c55e"
            fill="url(#colorAllowed)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Blocked"
            stackId="1"
            stroke="#ef4444"
            fill="url(#colorBlocked)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Redacted"
            stackId="1"
            stroke="#f59e0b"
            fill="url(#colorRedacted)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Review Required"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorReview)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
