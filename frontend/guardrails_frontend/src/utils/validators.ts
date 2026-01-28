export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

export const validateNumber = (value: any): boolean => {
  return !isNaN(Number(value))
}

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

export const validateJSON = (text: string): boolean => {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

export const validateYAML = (text: string): boolean => {
  // Basic YAML validation - can be enhanced with a proper YAML parser
  if (!text.trim()) return false
  
  // Check for basic YAML structure
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.trim().startsWith('#')) continue // Comment
    if (!line.trim()) continue // Empty line
    
    // Basic indentation check
    const currentIndent = line.search(/\S/)
    if (currentIndent !== -1 && currentIndent % 2 !== 0) return false
  }
  
  return true
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export const validatePolicyName = (name: string): ValidationResult => {
  const errors: string[] = []
  
  if (!validateRequired(name)) {
    errors.push('Policy name is required')
  }
  
  if (!validateMinLength(name, 3)) {
    errors.push('Policy name must be at least 3 characters')
  }
  
  if (!validateMaxLength(name, 100)) {
    errors.push('Policy name must be less than 100 characters')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateConfidence = (confidence: number): ValidationResult => {
  const errors: string[] = []
  
  if (!validateNumber(confidence)) {
    errors.push('Confidence must be a number')
  }
  
  if (!validateRange(confidence, 0, 1)) {
    errors.push('Confidence must be between 0 and 1')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
