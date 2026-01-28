import { format, formatDistance, formatRelative } from 'date-fns'

export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  try {
    return format(new Date(date), formatStr)
  } catch {
    return 'Invalid date'
  }
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm:ss')
}

export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true })
  } catch {
    return 'Unknown'
  }
}

export const formatRelativeDate = (date: string | Date): string => {
  try {
    return formatRelative(new Date(date), new Date())
  } catch {
    return 'Unknown'
  }
}

export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${formatNumber(percentage, 1)}%`
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatJSON = (obj: any, indent = 2): string => {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return String(obj)
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
  if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`
  return `${(milliseconds / 3600000).toFixed(1)}h`
}
