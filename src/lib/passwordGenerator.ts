import { secureRandomInt, secureShuffle } from './secureRandom'

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const AMBIGUOUS = new Set('Il1O0')
const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!#$%&()*+,-./:;=?@[]^_{|}~',
} satisfies Record<string, string>

export function generatePassword(options: PasswordOptions): string {
  if (!Number.isInteger(options.length) || options.length < 8 || options.length > 128) {
    throw new RangeError('Password length must be between 8 and 128 characters.')
  }

  const chosenSets = (Object.keys(CHARACTER_SETS) as (keyof typeof CHARACTER_SETS)[])
    .filter((category) => options[category])
    .map((category) => {
      const characters = Array.from(CHARACTER_SETS[category]).filter(
        (character) => !options.excludeAmbiguous || !AMBIGUOUS.has(character),
      )
      if (characters.length === 0) throw new Error('A selected character category is empty.')
      return characters
    })

  if (chosenSets.length === 0) {
    throw new Error('Select at least one character type.')
  }
  if (options.length < chosenSets.length) {
    throw new Error('Length must be at least the number of selected character types.')
  }

  const allCharacters = chosenSets.flat()
  const password = chosenSets.map((characters) => characters[secureRandomInt(characters.length)]!)
  while (password.length < options.length) {
    password.push(allCharacters[secureRandomInt(allCharacters.length)]!)
  }

  return secureShuffle(password).join('')
}
