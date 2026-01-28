import { useState } from 'react'
import EnhancedCell from './EnhancedCell'
import RiskLegend from './RiskLegend'
import WhyHotPanel from './WhyHotPanel'

interface HeatmapData {
  category: string
  severity: string
  count: number
  totalRequests: number
  trend: number
  topSources: Array<{ source: string; count: number; percentage: number }>
}

const data: HeatmapData[] = [
  { 
    category: 'AI Safety', 
    severity: 'Low', 
    count: 67, 
    totalRequests: 5000, 
    trend: 0.5,
    topSources: [
      { source: 'Prompt Injection', count: 34, percentage: 51 },
      { source: 'Tenant A', count: 21, percentage: 31 },
      { source: 'SDK v0.9', count: 12, percentage: 18 },
    ],
  },
  { 
    category: 'AI Safety', 
    severity: 'Medium', 
    count: 145, 
    totalRequests: 5000, 
    trend: 1.2,
    topSources: [
      { source: 'Toxic Content', count: 89, percentage: 61 },
      { source: 'Tenant B', count: 45, percentage: 31 },
      { source: 'SDK v0.8', count: 11, percentage: 8 },
    ],
  },
  { 
    category: 'AI Safety', 
    severity: 'High', 
    count: 234, 
    totalRequests: 5000, 
    trend: 2.1,
    topSources: [
      { source: 'Jailbreak Attempts', count: 145, percentage: 62 },
      { source: 'Tenant C', count: 67, percentage: 29 },
      { source: 'SDK v0.7', count: 22, percentage: 9 },
    ],
  },
  { 
    category: 'AI Safety', 
    severity: 'Critical', 
    count: 98, 
    totalRequests: 5000, 
    trend: 1.8,
    topSources: [
      { source: 'Malicious Prompts', count: 62, percentage: 63 },
      { source: 'Tenant D', count: 28, percentage: 29 },
      { source: 'SDK v0.6', count: 8, percentage: 8 },
    ],
  },
  { 
    category: 'Data Protection', 
    severity: 'Low', 
    count: 34, 
    totalRequests: 5000, 
    trend: -0.3,
    topSources: [
      { source: 'PII Detection', count: 18, percentage: 53 },
      { source: 'Tenant E', count: 11, percentage: 32 },
      { source: 'SDK v0.9', count: 5, percentage: 15 },
    ],
  },
  { 
    category: 'Data Protection', 
    severity: 'Medium', 
    count: 89, 
    totalRequests: 5000, 
    trend: 0.8,
    topSources: [
      { source: 'Data Leakage', count: 54, percentage: 61 },
      { source: 'Tenant F', count: 28, percentage: 31 },
      { source: 'SDK v0.8', count: 7, percentage: 8 },
    ],
  },
  { 
    category: 'Data Protection', 
    severity: 'High', 
    count: 178, 
    totalRequests: 5000, 
    trend: 1.5,
    topSources: [
      { source: 'GDPR Violations', count: 112, percentage: 63 },
      { source: 'Tenant G', count: 54, percentage: 30 },
      { source: 'SDK v0.7', count: 12, percentage: 7 },
    ],
  },
  { 
    category: 'Data Protection', 
    severity: 'Critical', 
    count: 45, 
    totalRequests: 5000, 
    trend: 0.9,
    topSources: [
      { source: 'Sensitive Data Exposure', count: 28, percentage: 62 },
      { source: 'Tenant H', count: 13, percentage: 29 },
      { source: 'SDK v0.6', count: 4, percentage: 9 },
    ],
  },
  { 
    category: 'Security', 
    severity: 'Low', 
    count: 23, 
    totalRequests: 5000, 
    trend: -0.2,
    topSources: [
      { source: 'Secrets Scan', count: 12, percentage: 52 },
      { source: 'Tenant I', count: 8, percentage: 35 },
      { source: 'SDK v0.9', count: 3, percentage: 13 },
    ],
  },
  { 
    category: 'Security', 
    severity: 'Medium', 
    count: 112, 
    totalRequests: 5000, 
    trend: 0.6,
    topSources: [
      { source: 'API Key Leaks', count: 67, percentage: 60 },
      { source: 'Tenant J', count: 34, percentage: 30 },
      { source: 'SDK v0.8', count: 11, percentage: 10 },
    ],
  },
  { 
    category: 'Security', 
    severity: 'High', 
    count: 89, 
    totalRequests: 5000, 
    trend: 1.1,
    topSources: [
      { source: 'Unauthorized Access', count: 54, percentage: 61 },
      { source: 'Tenant K', count: 28, percentage: 31 },
      { source: 'SDK v0.7', count: 7, percentage: 8 },
    ],
  },
  { 
    category: 'Security', 
    severity: 'Critical', 
    count: 67, 
    totalRequests: 5000, 
    trend: 2.3,
    topSources: [
      { source: 'Credential Exposure', count: 42, percentage: 63 },
      { source: 'Tenant L', count: 20, percentage: 30 },
      { source: 'SDK v0.6', count: 5, percentage: 7 },
    ],
  },
  { 
    category: 'Tool Control', 
    severity: 'Low', 
    count: 18, 
    totalRequests: 5000, 
    trend: -0.1,
    topSources: [
      { source: 'Tool Calls', count: 9, percentage: 50 },
      { source: 'Tenant M', count: 6, percentage: 33 },
      { source: 'SDK v0.9', count: 3, percentage: 17 },
    ],
  },
  { 
    category: 'Tool Control', 
    severity: 'Medium', 
    count: 43, 
    totalRequests: 5000, 
    trend: 0.3,
    topSources: [
      { source: 'Unauthorized Tools', count: 26, percentage: 60 },
      { source: 'Tenant N', count: 13, percentage: 30 },
      { source: 'SDK v0.8', count: 4, percentage: 10 },
    ],
  },
  { 
    category: 'Tool Control', 
    severity: 'High', 
    count: 33, 
    totalRequests: 5000, 
    trend: 0.5,
    topSources: [
      { source: 'Restricted Tools', count: 20, percentage: 61 },
      { source: 'Tenant O', count: 10, percentage: 30 },
      { source: 'SDK v0.7', count: 3, percentage: 9 },
    ],
  },
  { 
    category: 'Tool Control', 
    severity: 'Critical', 
    count: 12, 
    totalRequests: 5000, 
    trend: 0.2,
    topSources: [
      { source: 'Dangerous Tools', count: 8, percentage: 67 },
      { source: 'Tenant P', count: 3, percentage: 25 },
      { source: 'SDK v0.6', count: 1, percentage: 8 },
    ],
  },
]

export default function CategorySeverityHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  
  const categories = ['AI Safety', 'Data Protection', 'Security', 'Tool Control']
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

  const getCategoryTotal = (category: string) => {
    return data.filter(d => d.category === category).reduce((sum, d) => sum + d.count, 0)
  }

  return (
    <div className="w-full">
      {/* Context Header */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Breaks down violations by security category and severity level. Helps identify which categories need the most attention. 
        Use the Total column to see overall category impact. Click any cell to see detailed analysis and suggested actions.
      </p>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="grid gap-2" style={{ gridTemplateColumns: `160px repeat(${severities.length}, 1fr) 100px` }}>
            {/* Header */}
            <div></div>
            {severities.map(severity => (
              <div key={severity} className="text-center font-medium text-sm text-gray-700 dark:text-gray-300 pb-2">
                {severity}
              </div>
            ))}
            <div className="text-center font-medium text-sm text-gray-700 dark:text-gray-300 pb-2">
              Total
            </div>

            {/* Rows */}
            {categories.map(category => {
              const total = getCategoryTotal(category)
              
              return (
                <>
                  <div key={`label-${category}`} className="text-sm text-gray-700 dark:text-gray-300 py-3 font-medium">
                    {category}
                  </div>
                  {severities.map(severity => {
                    const cell = data.find(d => d.category === category && d.severity === severity)
                    if (!cell) {
                      return (
                        <div
                          key={`${category}-${severity}`}
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
                        key={`${category}-${severity}`}
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
                  <div className="flex items-center justify-center py-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
                      {total}
                    </span>
                  </div>
                </>
              )
            })}
          </div>
        </div>

        {/* Risk Legend */}
        <div className="flex-shrink-0">
          <RiskLegend />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6">
        {severities.map(severity => (
          <div key={severity} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getRiskColor(getRiskLevel(100, 5)) }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{severity}</span>
          </div>
        ))}
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
            category: selectedCell.category,
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
