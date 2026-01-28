import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface EnhancedCellProps {
  count: number
  rate: number
  trend: number
  severity?: string
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function EnhancedCell({
  count,
  rate,
  trend,
  severity,
  onClick,
  className = '',
  style,
}: EnhancedCellProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <ArrowUp className="w-3 h-3 text-danger-600" />
    if (trend < 0) return <ArrowDown className="w-3 h-3 text-success-600" />
    return <Minus className="w-3 h-3 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend > 0) return 'text-danger-600'
    if (trend < 0) return 'text-success-600'
    return 'text-gray-500'
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group min-h-[80px] ${className}`}
      style={style}
    >
      {/* Main Count */}
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">
          {count.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {rate.toFixed(1)}%
        </div>
      </div>

      {/* Trend Indicator */}
      <div className={`flex items-center gap-1 mt-1 text-xs ${getTrendColor()}`}>
        {getTrendIcon()}
        <span className="font-medium">
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
        </span>
      </div>

      {/* Severity Badge (if provided) */}
      {severity && (
        <div className="mt-1">
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              severity === 'Critical' || severity === 'High'
                ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-300'
                : severity === 'Medium'
                ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            }`}
          >
            {severity}
          </span>
        </div>
      )}
    </div>
  )
}
