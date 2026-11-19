import { useState } from 'react'
import { Check, Copy, Dices, Eye, EyeOff, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { generatePassword, type PasswordOptions } from '../lib/passwordGenerator'

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
}

const CATEGORY_OPTIONS: Array<{ key: keyof Pick<PasswordOptions, 'uppercase' | 'lowercase' | 'numbers' | 'symbols'>; label: string; sample: string }> = [
  { key: 'uppercase', label: 'Uppercase', sample: 'A–Z' },
  { key: 'lowercase', label: 'Lowercase', sample: 'a–z' },
  { key: 'numbers', label: 'Numbers', sample: '0–9' },
  { key: 'symbols', label: 'Symbols', sample: '!@#' },
]

async function copyText(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable. Copy the selected text manually.')
  await navigator.clipboard.writeText(value)
}

export function PasswordGenerator() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [lengthValue, setLengthValue] = useState(String(DEFAULT_OPTIONS.length))
  const [generated, setGenerated] = useState('')
  const [visible, setVisible] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  function generate() {
    setFeedback('')
    setError('')
    try {
      const length = Number(lengthValue)
      const next = generatePassword({ ...options, length })
      setGenerated(next)
      setVisible(false)
    } catch (reason) {
      setGenerated('')
      setError(reason instanceof Error ? reason.message : 'Could not generate a password.')
    }
  }

  async function copy() {
    if (!generated) return
    try {
      await copyText(generated)
      setFeedback('Copied to clipboard. Clear it when you are done.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not copy to clipboard.')
    }
  }

  return (
    <section className="generator-card password-generator" aria-labelledby="password-generator-title">
      <div className="tool-heading">
        <div className="tool-icon"><Dices size={19} /></div>
        <div><span className="eyebrow">A FRESH SECRET FOR EVERY ACCOUNT</span><h3 id="password-generator-title">Create a Strong Password</h3></div>
      </div>
      <p className="tool-description">Get a random, hard-to-guess password in seconds.</p>

      <div className="generated-field-group">
        <label htmlFor="generated-password" className="field-label">Your new password</label>
        <div className="generated-field">
          <input id="generated-password" value={generated} type={visible ? 'text' : 'password'} readOnly placeholder="Your password appears here" autoComplete="off" aria-label="Generated password" />
          {generated && <button className="icon-button" type="button" onClick={() => setVisible((shown) => !shown)} aria-label={visible ? 'Hide generated password' : 'Show generated password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
          <button className="icon-button" type="button" onClick={() => void copy()} disabled={!generated} aria-label="Copy password"><Copy size={16} /></button>
          <button className="icon-button" type="button" onClick={() => { setGenerated(''); setFeedback(''); setVisible(false) }} disabled={!generated} aria-label="Remove password"><Trash2 size={16} /></button>
        </div>
        <div className="feedback-slot" aria-live="polite">{feedback && <span><Check size={13} /> {feedback}</span>}</div>
      </div>

      <div className="length-row">
        <label className="field-label" htmlFor="password-length">Password length</label>
        <div className="length-control"><input id="password-length" type="number" inputMode="numeric" min={8} max={128} value={lengthValue} onChange={(event) => setLengthValue(event.target.value)} /><span>characters</span></div>
      </div>

      <fieldset className="category-fieldset">
        <legend className="field-label">What should it include?</legend>
        <div className="category-grid">
          {CATEGORY_OPTIONS.map(({ key, label, sample }) => (
            <label className="toggle-row" key={key}>
              <input type="checkbox" checked={options[key]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))} />
              <span className="toggle-control" aria-hidden="true" />
              <span className="toggle-label">{label}<small>{sample}</small></span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="toggle-row ambiguous-toggle">
        <input type="checkbox" checked={options.excludeAmbiguous} onChange={(event) => setOptions((current) => ({ ...current, excludeAmbiguous: event.target.checked }))} />
        <span className="toggle-control" aria-hidden="true" />
        <span className="toggle-label">Avoid confusing characters<small>Removes I, l, 1, O and 0</small></span>
      </label>

      {error && <p className="inline-error" role="alert">{error}</p>}
      <button className="action-button primary-action" type="button" onClick={generate}><RefreshCw size={16} /> Create my password</button>
      <p className="tool-assurance"><ShieldCheck size={13} /> Generated locally. Nothing is saved.</p>
    </section>
  )
}
