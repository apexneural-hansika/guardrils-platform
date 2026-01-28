import { useState } from 'react'
import EnhancedCell from './EnhancedCell'
import RiskLegend from './RiskLegend'
import WhyHotPanel from './WhyHotPanel'
import Badge from '../common/Badge'

interface HeatmapData {
  policy: string
  endpoint: string
  count: number
  totalRequests: number
  trend: number
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  topSources: Array<{ source: string; count: number; percentage: number }>
}

const data: HeatmapData[] = [
  {
    policy: 'Secrets Scanner',
    endpoint: '/intercept',
    count: 289,
    totalRequests: 2034,
    trend: 3.1,
    severity: 'Critical',
    topSources: [
      { source: 'API Keys', count: 179, percentage: 62 },
      { source: 'Tenant A', count: 89, percentage: 31 },
      { source: 'SDK v0.8', count: 21, percentage: 7 },
    ],
  },
  {
    policy: 'Secrets Scanner',
    endpoint: '/evaluate',
    count: 5,
    totalRequests: 1456,
    trend: -1.2,
    severity: 'Low',
    topSources: [],
  },
  {
    policy: 'Prompt Injection',
    endpoint: '/intercept',
    count: 145,
    totalRequests: 2034,
    trend: 2.3,
    severity: 'High',
    topSources: [
      { source: 'User Input', count: 98, percentage: 68 },
      { source: 'Tenant B', count: 47, percentage: 32 },
    ],
  },
  {
    policy: 'Prompt Injection',
    endpoint: '/evaluate',
    count: 67,
    totalRequests: 1456,
    trend: 0.5,
    severity: 'Medium',
    topSources: [],
  },
  {
    policy: 'PII Detection',
    endpoint: '/intercept',
    count: 12,
    totalRequests: 2034,
    trend: -0.8,
    severity: 'Low',
    topSources: [],
  },
  {
    policy: 'PII Detection',
    endpoint: '/evaluate',
    count: 198,
    totalRequests: 1456,
    trend: 1.5,
    severity: 'High',
    topSources: [
      { source: 'Email Addresses', count: 124, percentage: 63 },
      { source: 'Phone Numbers', count: 74, percentage: 37 },
    ],
  },
  {
    policy: 'Toxic Content',
    endpoint: '/intercept',
    count: 23,
    totalRequests: 2034,
    trend: -2.1,
    severity: 'Low',
    topSources: [],
  },
  {
    policy: 'Toxic Content',
    endpoint: '/evaluate',
    count: 156,
    totalRequests: 1456,
    trend: 0.2,
    severity: 'High',
    topSources: [
      { source: 'Hate Speech', count: 89, percentage: 57 },
      { source: 'Profanity', count: 67, percentage: 43 },
    ],
  },
  {
    policy: 'Tool Authorization',
    endpoint: '/intercept',
    count: 87,
    totalRequests: 2034,
    trend: 1.8,
    severity: 'Medium',
    topSources: [],
  },
  {
    policy: 'Tool Authorization',
    endpoint: '/evaluate',
    count: 0,
    totalRequests: 1456,
    trend: 0,
    severity: 'Low',
    topSources: [],
  },
  {
    policy: 'Rate Limit',
    endpoint: '/intercept',
    count: 234,
    totalRequests: 2034,
    trend: -0.5,
    severity: 'High',
    topSources: [
      { source: 'Tenant C', count: 145, percentage: 62 },
      { source: 'Tenant D', count: 89, percentage: 38 },
    ],
  },
  {
    policy: 'Rate Limit',
    endpoint: '/evaluate',
    count: 32,
    totalRequests: 1456,
    trend: 0.1,
    severity: 'Low',
    topSources: [],
  },
]

export default function PolicyEndpointHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  // Sort policies by risk (Critical + rising first)
  const sortedPolicies = Array.from(new Set(data.map(d => d.policy))).sort((a, b) => {
    const aData = data.filter(d => d.policy === a)
    const bData = data.filter(d => d.policy === b)
    const aMax = Math.max(...aData.map(d => d.count))
    const bMax = Math.max(...bData.map(d => d.count))
    const aTrend = aData.reduce((sum, d) => sum + d.trend, 0) / aData.length
    const bTrend = bData.reduce((sum, d) => sum + d.trend, 0) / bData.length
    
    // Critical + rising > High + rising > High + stable > everything else
    const aScore = (aMax > 250 ? 1000 : aMax > 150 ? 500 : aMax > 50 ? 100 : 0) + (aTrend > 0 ? 50 : 0)
    const bScore = (bMax > 250 ? 1000 : bMax > 150 ? 500 : bMax > 50 ? 100 : 0) + (bTrend > 0 ? 50 : 0)
    
    return bScore - aScore
  })

  const endpoints = ['/intercept', '/evaluate']

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

  const handleCellClick = (cell: HeatmapData) => {
    setSelectedCell(cell)
    setShowPanel(true)
  }

  const getPolicyBadge = (policy: string) => {
    const policyData = data.filter(d => d.policy === policy)
    const maxCount = Math.max(...policyData.map(d => d.count))
    const avgTrend = policyData.reduce((sum, d) => sum + d.trend, 0) / policyData.length
    
    if (maxCount > 250 && avgTrend > 0) {
      return <Badge variant="danger" size="sm">🔴 Top Risk</Badge>
    }
    if (maxCount > 150 && avgTrend > 0) {
      return <Badge variant="warning" size="sm">🟧 Rising</Badge>
    }
    if (maxCount > 150) {
      return <Badge variant="warning" size="sm">🟧 High</Badge>
    }
    if (avgTrend < -1) {
      return <Badge variant="success" size="sm">🟩 Improving</Badge>
    }
    return <Badge variant="info" size="sm">🟨 Stable</Badge>
  }

  return (
    <div className="w-full">
      {/* Context Header */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Highlights which guardrails are most active and where enforcement pressure is highest. 
        Click any cell to see detailed analysis and suggested actions.
      </p>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="w-full overflow-x-auto">
            <div className="grid gap-2 min-w-[500px]" style={{ gridTemplateColumns: `200px repeat(${endpoints.length}, 1fr)` }}>
              {/* Header */}
              <div></div>
              {endpoints.map(endpoint => (
                <div key={endpoint} className="text-center font-medium text-sm text-gray-700 dark:text-gray-300 pb-2">
                  {endpoint}
                </div>
              ))}

              {/* Rows */}
              {sortedPolicies.map(policy => (
                <>
                  <div key={`label-${policy}`} className="text-sm text-gray-700 dark:text-gray-300 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{policy}</span>
                    </div>
                    {getPolicyBadge(policy)}
                  </div>
                  {endpoints.map(endpoint => {
                    const cell = data.find(d => d.policy === policy && d.endpoint === endpoint)
                    if (!cell) {
                      return (
                        <div
                          key={`${policy}-${endpoint}`}
                          className="relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 flex items-center justify-center min-h-[80px] bg-gray-50 dark:bg-gray-800"
                        >
                          <span className="text-xs text-gray-400">Gap</span>
                        </div>
                      )
                    }

                    const rate = (cell.count / cell.totalRequests) * 100
                    const riskLevel = getRiskLevel(cell.count, rate)
                    const color = getRiskColor(riskLevel)
                    const intensity = getRiskIntensity(riskLevel)

                    return (
                      <EnhancedCell
                        key={`${policy}-${endpoint}`}
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
        </div>

        {/* Risk Legend */}
        <div className="flex-shrink-0">
          <RiskLegend />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        💡 Cells show: Count (Rate%) with trend indicator. Dashed cells indicate enforcement gaps.
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
            policy: selectedCell.policy,
            endpoint: selectedCell.endpoint,
            triggers: selectedCell.count,
            totalRequests: selectedCell.totalRequests,
            triggerRate: (selectedCell.count / selectedCell.totalRequests) * 100,
            trend: selectedCell.trend,
            topSources: selectedCell.topSources,
            severity: selectedCell.severity,
          }}
        />
      )}
    </div>
  )
}
