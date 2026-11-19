const UINT32_RANGE = 0x1_0000_0000

function randomUint32(): number {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure randomness is unavailable. Use a modern browser over HTTPS or localhost.')
  }

  const value = new Uint32Array(1)
  globalThis.crypto.getRandomValues(value)
  return value[0]!
}

/** Uniformly selects an integer in [0, maxExclusive) using rejection sampling. */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError('The random selection range must be between 1 and 2^32.')
  }

  const acceptedRange = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive
  let value: number
  do {
    value = randomUint32()
  } while (value >= acceptedRange)

  return value % maxExclusive
}

export function secureShuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
  }
  return shuffled
}
