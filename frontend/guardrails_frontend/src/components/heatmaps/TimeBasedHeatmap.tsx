import RiskLegend from './RiskLegend'

interface HeatmapData {
  hour: string
  endpoint: string
  count: number
  totalRequests: number
  trend: number
}

const generateData = (): HeatmapData[] => {
  const data: HeatmapData[] = []
  const endpoints = ['/intercept', '/evaluate']
  
  for (let hour = 0; hour < 24; hour++) {
    endpoints.forEach(endpoint => {
      const isBusinessHour = hour >= 9 && hour <= 17
      const baseCount = isBusinessHour ? 30 : 10
      const variance = Math.random() * baseCount
      const count = Math.floor(baseCount + variance)
      const totalRequests = isBusinessHour ? 200 + Math.floor(Math.random() * 100) : 50 + Math.floor(Math.random() * 50)
      const trend = (Math.random() - 0.5) * 2 // -1 to +1
      
      data.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        endpoint,
        count,
        totalRequests,
        trend,
      })
    })
  }
  
  return data
}

export default function TimeBasedHeatmap() {
  const data = generateData()
  const hours = Array.from(new Set(data.map(d => d.hour)))
  const endpoints = ['/intercept', '/evaluate']

  const getRiskLevel = (count: number, rate: number): 'low' | 'elevated' | 'high' | 'critical' => {
    if (count > 50 || rate > 20) return 'critical'
    if (count > 30 || rate > 15) return 'high'
    if (count > 15 || rate > 10) return 'elevated'
    return 'low'
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return '#dc2626'
      case 'high':
        return '#f59e0b'
      case 'elevated':
        return '#eab308'
      case 'low':
        return '#60a5fa'
      default:
        return '#93c5fd'
    }
  }

  const getRiskIntensity = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 0.9
      case 'high':
        return 0.7
      case 'elevated':
        return 0.5
      default:
        return 0.3
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Context Header */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Shows violation patterns throughout the day. Yellow borders indicate business hours (9 AM - 5 PM) where higher activity is expected.
      </p>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 min-w-[800px]">
          <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${hours.length}, 1fr)` }}>
            {/* Header */}
            <div></div>
            {hours.map((hour, idx) => (
              <div 
                key={hour} 
                className={`text-center text-xs text-gray-600 dark:text-gray-400 pb-2 ${idx % 3 !== 0 ? 'opacity-0' : ''}`}
              >
                {hour}
              </div>
            ))}

            {/* Rows */}
            {endpoints.map(endpoint => (
              <>
                <div key={`label-${endpoint}`} className="text-xs text-gray-700 dark:text-gray-300 py-2 font-medium">
                  {endpoint}
                </div>
                {hours.map(hour => {
                  const cell = data.find(d => d.hour === hour && d.endpoint === endpoint)
                  if (!cell) return null

                  const rate = (cell.count / cell.totalRequests) * 100
                  const riskLevel = getRiskLevel(cell.count, rate)
                  const color = getRiskColor(riskLevel)
                  const intensity = getRiskIntensity(riskLevel)
                  
                  const hourNum = parseInt(hour.split(':')[0])
                  const isBusinessHour = hourNum >= 9 && hourNum <= 17
                  
                  return (
                    <div
                      key={`${endpoint}-${hour}`}
                      className={`relative rounded border cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group ${
                        isBusinessHour ? 'border-yellow-400' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      style={{
                        backgroundColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                        minHeight: '40px',
                      }}
                      title={`${hour} • ${endpoint}: ${cell.count} violations (${rate.toFixed(1)}%)`}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                        <span className="text-xs font-medium text-gray-900 font-mono">
                          {cell.count}
                        </span>
                        <span className="text-[10px] text-gray-700">
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {hour} • {endpoint}: {cell.count} violations ({rate.toFixed(1)}%)
                        {isBusinessHour && ' (Business Hour)'}
                        {cell.trend > 0 && ` • Trend: ↑ +${cell.trend.toFixed(1)}%`}
                        {cell.trend < 0 && ` • Trend: ↓ ${cell.trend.toFixed(1)}%`}
                      </div>
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>

        {/* Risk Legend */}
        <div className="flex-shrink-0">
          <RiskLegend />
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        💡 Yellow borders indicate business hours (9 AM - 5 PM) where higher activity is expected
      </div>
    </div>
  )
}
