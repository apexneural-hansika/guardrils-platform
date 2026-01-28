import Badge from '../common/Badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RiskScoreSummaryProps {
  score: number
  primaryDriver: string
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercent?: number
}

export default function RiskScoreSummary({
  score,
  primaryDriver,
  trend,
  trendPercent = 0,
}: RiskScoreSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'danger'
    if (score >= 50) return 'warning'
    return 'success'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-danger-600" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-success-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return 'text-danger-600'
      case 'decreasing':
        return 'text-success-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Risk Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
              <span className="text-lg text-gray-500 dark:text-gray-400">/ 100</span>
              <Badge variant={getScoreColor(score) as any} size="sm">
                {score >= 75 ? 'Critical' : score >= 50 ? 'High' : 'Low'}
              </Badge>
            </div>
          </div>
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primary Driver</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{primaryDriver}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Improving' : 'Stable'}
            {trendPercent !== 0 && ` ${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  )
}
