export const ensureArray = (value: any): any[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  }
  return [value]
}
