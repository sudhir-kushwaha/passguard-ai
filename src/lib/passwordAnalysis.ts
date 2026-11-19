import type zxcvbn from 'zxcvbn'

export type ZxcvbnResult = zxcvbn.ZXCVBNResult

export const STRENGTH_LABELS = [
  'Very Weak',
  'Weak',
  'Fair',
  'Strong',
  'Very Strong',
] as const

export type StrengthLabel = (typeof STRENGTH_LABELS)[number]

export interface PasswordAnalysis {
  score: number
  strength: StrengthLabel
  entropyBits: number
  guesses: number
  crackTimes: Array<{ label: string; estimate: string }>
  weaknesses: string[]
  recommendations: string[]
}

const PATTERN_LABELS: Record<string, string> = {
  dictionary: 'Uses a common word or phrase that attackers may try',
  spatial: 'Uses an easy-to-guess keyboard pattern',
  repeat: 'Repeats characters or a pattern',
  sequence: 'Uses a predictable sequence, like abc or 123',
  date: 'Includes a date that may be easy to guess',
  regex: 'Includes a predictable year or number pattern',
  context: 'Includes a word linked to personal information',
}

export function analyzePassword(password: string, result: ZxcvbnResult): PasswordAnalysis {
  const entropyBits = Math.max(0, Math.log2(Math.max(1, result.guesses)))
  // Score is estimated guess entropy on a transparent 0–80 bit scale, capped at 100.
  const score = Math.max(0, Math.min(100, Math.round((entropyBits / 80) * 100)))
  const strengthIndex = score < 20 ? 0 : score < 40 ? 1 : score < 60 ? 2 : score < 80 ? 3 : 4

  const weaknesses = Array.from(
    new Set(
      result.sequence
        .map((match) => PATTERN_LABELS[match.pattern])
        .filter((label): label is string => Boolean(label)),
    ),
  )

  const recommendations: string[] = []
  if (Array.from(password).length < 15) {
    recommendations.push('For a password used as the only factor, aim for 15 or more characters; longer is fine.')
  }
  if (result.feedback.warning) recommendations.push(result.feedback.warning)
  recommendations.push(...result.feedback.suggestions)
  if (result.score <= 2) {
    recommendations.push('Choose a new, unique password rather than modifying this one.')
  }
  if (password.length >= 14 && result.score >= 3 && recommendations.length === 0) {
    recommendations.push('Keep it unique to this account and store it in a password manager.')
  }

  return {
    score,
    strength: STRENGTH_LABELS[strengthIndex]!,
    entropyBits,
    guesses: result.guesses,
    crackTimes: [
      {
        label: 'Online Hacker Attack',
        estimate: String(result.crack_times_display.online_throttling_100_per_hour),
      },
      {
        label: 'Stolen Password Attack',
        estimate: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
      },
      {
        label: 'Lightning-Fast Cracking',
        estimate: String(result.crack_times_display.offline_fast_hashing_1e10_per_second),
      },
    ],
    weaknesses,
    recommendations: Array.from(new Set(recommendations)),
  }
}
