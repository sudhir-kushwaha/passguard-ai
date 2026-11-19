import { ShieldCheck } from 'lucide-react'
import type { PasswordAnalysis } from '../lib/passwordAnalysis'

interface StrengthMeterProps {
  analysis: PasswordAnalysis | null
  loading: boolean
}

export function StrengthMeter({ analysis, loading }: StrengthMeterProps) {
  const score = analysis?.score ?? 0
  const level = analysis?.strength.toLowerCase().replace(' ', '-') ?? 'empty'

  return (
    <section className={`strength-panel strength-${level}`} aria-label="Strength result">
      <div className="meter-topline">
        <span className="eyebrow">PASSWORD STRENGTH</span>
        <ShieldCheck aria-hidden="true" size={18} />
      </div>
      <div className="score-row">
        <strong className="score-number">{analysis ? score : '—'}</strong>
        <span className="score-denom">/100</span>
        <span className="strength-label" aria-live="polite">
          {loading ? 'Checking…' : analysis?.strength ?? 'Awaiting input'}
        </span>
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-label="Estimated password security score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-valuetext={analysis ? `${score} out of 100, ${analysis.strength}` : 'No password entered'}
      >
        <span className="meter-fill" style={{ width: `${score}%` }} />
      </div>
    </section>
  )
}
