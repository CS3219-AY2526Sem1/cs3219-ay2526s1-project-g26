export const sleep = (ms: number = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
