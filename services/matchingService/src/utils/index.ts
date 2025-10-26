export const fillPrefixZeros = (num: number, length: number): string => {
  const n = num.toString()
  if (n.length > length) {
    return '9'.repeat(length)
  }
  return String(n).padStart(length, '0')
}
