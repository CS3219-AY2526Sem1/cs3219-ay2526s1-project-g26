export const ensureArray = <T = unknown>(
  value: T | T[] | string | undefined
): T[] => {
  if (value == null) return []

  if (Array.isArray(value)) return value

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [value as unknown as T]
    }
  }

  return [value]
}
