import { secureRandomInt } from './secureRandom'

export const EFF_WORD_LIST_SIZE = 7_776

export interface PassphraseOptions {
  words: number
  separator: string
  capitalize: boolean
  wordList: readonly string[]
}

export function generatePassphrase(options: PassphraseOptions): string {
  if (!Number.isInteger(options.words) || options.words < 3 || options.words > 12) {
    throw new RangeError('Choose between 3 and 12 words.')
  }
  if (options.wordList.length < 2 || options.wordList.some((word) => word.length === 0)) {
    throw new Error('The bundled word list is unavailable.')
  }
  if (options.separator.length > 8 || /[\r\n]/.test(options.separator)) {
    throw new Error('Use a separator of up to 8 characters on one line.')
  }

  const words = Array.from({ length: options.words }, () => {
    const word = options.wordList[secureRandomInt(options.wordList.length)]!
    return options.capitalize ? word[0]!.toUpperCase() + word.slice(1) : word
  })

  return words.join(options.separator)
}

export function passphraseEntropyBits(wordCount: number, wordListSize: number): number {
  return wordCount * Math.log2(wordListSize)
}
