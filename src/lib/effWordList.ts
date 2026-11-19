import wordListText from '../data/eff_large_wordlist.txt?raw'

// EFF lines have the form `dice-code<TAB>word`; only the words are used.
export const EFF_WORD_LIST: readonly string[] = wordListText
  .trim()
  .split(/\r?\n/)
  .map((line) => line.split(/\s+/).at(-1)!)

export const EFF_WORD_LIST_SIZE = EFF_WORD_LIST.length
