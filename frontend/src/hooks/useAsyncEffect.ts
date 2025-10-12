// Referenced from ahooks GitHub repo
// Source: https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useAsyncEffect/index.ts
// Imported by: Wu Zengfu
// License: MIT

import type { DependencyList } from 'react'
import { useEffect } from 'react'

function isAsyncGenerator(
  val: AsyncGenerator<void, void, void> | Promise<void>
): val is AsyncGenerator<void, void, void> {
  return (
    val !== null &&
    typeof val === 'object' &&
    Symbol.asyncIterator in val &&
    typeof val[Symbol.asyncIterator] === 'function'
  )
}

function useAsyncEffect(
  effect: () => AsyncGenerator<void, void, void> | Promise<void>,
  deps?: DependencyList
) {
  useEffect(() => {
    const e = effect()
    let cancelled = false

    async function execute() {
      if (isAsyncGenerator(e)) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const result = await e.next()
          if (result.done || cancelled) {
            break
          }
        }
      } else {
        await e
      }
    }

    execute()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export default useAsyncEffect
