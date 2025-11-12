/**
 * This file was originally authored by ahooks under the MIT license.
 * Modified and imported by Wu Zengfu <https://github.com/wuzengfu>.
 *
 * Original Source: https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useAsyncEffect/index.ts
 *
 * MIT License
 *
 * Copyright (c) 2019-present ahooks
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
