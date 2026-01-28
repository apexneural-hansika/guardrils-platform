import { useState } from 'react'
import EnhancedCell from './EnhancedCell'
import RiskLegend from './RiskLegend'
import WhyHotPanel from './WhyHotPanel'

interface HeatmapData {
  endpoint: string
  severity: string
  count: number
  totalRequests: number
  trend: number
  topSources: Array<{ source: string; count: number; percentage: number }>
}

const data: HeatmapData[] = [
  { 
    endpoint: '/intercept', 
    severity: 'Low', 
    count: 89, 
    totalRequests: 2034, 
    trend: -0.5,
    topSources: [
      { source: 'User Input', count: 45, percentage: 51 },
      { source: 'Tenant A', count: 28, percentage: 31 },
      { source: 'SDK v0.9', count: 16, percentage: 18 },
    ],
  },
  { 
    endpoint: '/intercept', 
    severity: 'Medium', 
    count: 234, 
    totalRequests: 2034, 
    trend: 1.2,
    topSources: [
      { source: 'API Keys', count: 145, percentage: 62 },
      { source: 'Tenant B', count: 67, percentage: 29 },
      { source: 'SDK v0.8', count: 22, percentage: 9 },
    ],
  },
  { 
    endpoint: '/intercept', 
    severity: 'High', 
    count: 312, 
    totalRequests: 2034, 
    trend: 2.8,
    topSources: [
      { source: 'Secrets', count: 198, percentage: 63 },
      { source: 'Tenant C', count: 89, percentage: 29 },
      { source: 'SDK v0.7', count: 25, percentage: 8 },
    ],
  },
  { 
    endpoint: '/intercept', 
    severity: 'Critical', 
    count: 154, 
    totalRequests: 2034, 
    trend: 3.1,
    topSources: [
      { source: 'PII Data', count: 98, percentage: 64 },
      { source: 'Tenant D', count: 45, percentage: 29 },
      { source: 'SDK v0.6', count: 11, percentage: 7 },
    ],
  },
  { 
    endpoint: '/evaluate', 
    severity: 'Low', 
    count: 53, 
    totalRequests: 1456, 
    trend: -0.3,
    topSources: [
      { source: 'User Input', count: 32, percentage: 60 },
      { source: 'Tenant E', count: 15, percentage: 28 },
      { source: 'SDK v0.9', count: 6, percentage: 12 },
    ],
  },
  { 
    endpoint: '/evaluate', 
    severity: 'Medium', 
    count: 155, 
    totalRequests: 1456, 
    trend: 0.8,
    topSources: [
      { source: 'Output Content', count: 98, percentage: 63 },
      { source: 'Tenant F', count: 45, percentage: 29 },
      { source: 'SDK v0.8', count: 12, percentage: 8 },
    ],
  },
  { 
    endpoint: '/evaluate', 
    severity: 'High', 
    count: 222, 
    totalRequests: 1456, 
    trend: 1.5,
    topSources: [
      { source: 'Toxic Content', count: 145, percentage: 65 },
      { source: 'Tenant G', count: 62, percentage: 28 },
      { source: 'SDK v0.7', count: 15, percentage: 7 },
    ],
  },
  { 
    endpoint: '/evaluate', 
    severity: 'Critical', 
    count: 28, 
    totalRequests: 1456, 
    trend: 0.2,
    topSources: [
      { source: 'Sensitive Data', count: 18, percentage: 64 },
      { source: 'Tenant H', count: 8, percentage: 29 },
      { source: 'SDK v0.6', count: 2, percentage: 7 },
    ],
  },
]

export default function EndpointSeverityHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  
  const endpoints = Array.from(new Set(data.map(d => d.endpoint)))
  const severities = ['Low', 'Medium', 'High', 'Critical']

  const handleCellClick = (cell: HeatmapData) => {
    setSelectedCell(cell)
    setShowPanel(true)
  }

  const getRiskLevel = (count: number, rate: number): 'low' | 'elevated' | 'high' | 'critical' => {
    if (count > 250 || rate > 15) return 'critical'
    if (count > 150 || rate > 10) return 'high'
    if (count > 50 || rate > 5) return 'elevated'
    return 'low'
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return '#ef4444'
      case 'high':
        return '#f97316'
      case 'elevated':
        return '#eab308'
      default:
        return '#3b82f6'
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
    <div className="w-full">
      {/* Context Header */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Shows how often requests were blocked or modified by severity across gateway endpoints. 
        Higher rates indicate more enforcement activity. Click any cell to see detailed analysis and suggested actions.
      </p>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${severities.length}, 1fr)` }}>
            {/* Header */}
            <div></div>
            {severities.map(severity => (
              <div key={severity} className="text-center font-medium text-sm text-gray-700 dark:text-gray-300 pb-2">
                {severity}
              </div>
            ))}

            {/* Rows */}
            {endpoints.map(endpoint => (
              <>
                <div key={`label-${endpoint}`} className="text-sm text-gray-700 dark:text-gray-300 py-3 font-medium">
                  {endpoint}
                </div>
                {severities.map(severity => {
                  const cell = data.find(d => d.endpoint === endpoint && d.severity === severity)
                  if (!cell) {
                    return (
                      <div
                        key={`${endpoint}-${severity}`}
                        className="relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-center min-h-[80px] bg-gray-50 dark:bg-gray-800"
                      >
                        <span className="text-xs text-gray-400">0</span>
                      </div>
                    )
                  }

                  const rate = (cell.count / cell.totalRequests) * 100
                  const riskLevel = getRiskLevel(cell.count, rate)
                  const color = getRiskColor(riskLevel)
                  const intensity = getRiskIntensity(riskLevel)

                  return (
                    <EnhancedCell
                      key={`${endpoint}-${severity}`}
                      count={cell.count}
                      rate={rate}
                      trend={cell.trend}
                      severity={cell.severity}
                      onClick={() => handleCellClick(cell)}
                      style={{
                        backgroundColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                      }}
                    />
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

      {/* Why Hot Panel */}
      {selectedCell && (
        <WhyHotPanel
          isOpen={showPanel}
          onClose={() => {
            setShowPanel(false)
            setSelectedCell(null)
          }}
          data={{
            endpointOnly: selectedCell.endpoint,
            severity: selectedCell.severity,
            triggers: selectedCell.count,
            totalRequests: selectedCell.totalRequests,
            triggerRate: (selectedCell.count / selectedCell.totalRequests) * 100,
            trend: selectedCell.trend,
            topSources: selectedCell.topSources,
            severityLevel: selectedCell.severity,
          }}
        />
      )}
    </div>
  )
}
