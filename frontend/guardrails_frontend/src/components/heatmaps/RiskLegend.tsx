interface RiskThreshold {
  label: string
  min: number
  max: number
  color: string
  icon: string
}

interface RiskLegendProps {
  thresholds?: RiskThreshold[]
  title?: string
}

const defaultThresholds: RiskThreshold[] = [
  { label: 'Low Risk', min: 0, max: 50, color: '#3b82f6', icon: '🟦' },
  { label: 'Elevated', min: 51, max: 150, color: '#eab308', icon: '🟨' },
  { label: 'High Risk', min: 151, max: 250, color: '#f97316', icon: '🟧' },
  { label: 'Critical', min: 251, max: Infinity, color: '#ef4444', icon: '🟥' },
]

export default function RiskLegend({ thresholds = defaultThresholds, title = 'Risk Levels' }: RiskLegendProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
      <div className="space-y-1.5">
        {thresholds.map((threshold) => (
          <div key={threshold.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded border-2"
              style={{
                backgroundColor: `${threshold.color}40`,
                borderColor: threshold.color,
              }}
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{threshold.label}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-auto">
              {threshold.max === Infinity ? `${threshold.min}+` : `${threshold.min}–${threshold.max}`}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        Thresholds configurable per organization
      </p>
    </div>
  )
}
