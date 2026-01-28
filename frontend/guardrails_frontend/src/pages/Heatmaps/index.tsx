import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import EndpointSeverityHeatmap from '../../components/heatmaps/EndpointSeverityHeatmap'
import PolicyEndpointHeatmap from '../../components/heatmaps/PolicyEndpointHeatmap'
import TimeBasedHeatmap from '../../components/heatmaps/TimeBasedHeatmap'
import CategorySeverityHeatmap from '../../components/heatmaps/CategorySeverityHeatmap'
import RiskScoreSummary from '../../components/heatmaps/RiskScoreSummary'

export default function Heatmaps() {
  const [timeRange, setTimeRange] = useState('24h')

  // Calculate overall risk score (weighted severity × trigger rate)
  // This is a simplified calculation - in production, this would come from the backend
  const riskScore = 72
  const primaryDriver = 'Secrets Scanner (/intercept)'
  const trend: 'increasing' | 'decreasing' | 'stable' = 'increasing'
  const trendPercent = 3.1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Heat Maps
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Risk intelligence and pattern visualization
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {/* Risk Score Summary */}
      <RiskScoreSummary
        score={riskScore}
        primaryDriver={primaryDriver}
        trend={trend}
        trendPercent={trendPercent}
      />

      {/* Heatmaps */}
      <div className="space-y-6">
        {/* Endpoint × Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint × Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <EndpointSeverityHeatmap />
          </CardContent>
        </Card>

        {/* Policy × Endpoint */}
        <Card>
          <CardHeader>
            <CardTitle>Policy × Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <PolicyEndpointHeatmap />
          </CardContent>
        </Card>

        {/* Time-based Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Time-based Activity (24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeBasedHeatmap />
          </CardContent>
        </Card>

        {/* Category × Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Category × Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <CategorySeverityHeatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
