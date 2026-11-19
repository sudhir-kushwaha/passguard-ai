import { useState } from 'react'
import { Check, Copy, KeyRound, RefreshCw, Trash2 } from 'lucide-react'
import { EFF_WORD_LIST_SIZE, generatePassphrase, passphraseEntropyBits } from '../lib/passphraseGenerator'

export function PassphraseGenerator() {
  const [wordCount, setWordCount] = useState(6)
  const [separator, setSeparator] = useState('-')
  const [capitalize, setCapitalize] = useState(false)
  const [generated, setGenerated] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    setFeedback('')
    setError('')
    setLoading(true)
    try {
      const { EFF_WORD_LIST } = await import('../lib/effWordList')
      if (EFF_WORD_LIST.length !== EFF_WORD_LIST_SIZE) throw new Error('The bundled word list did not pass its integrity check.')
      setGenerated(generatePassphrase({ words: wordCount, separator, capitalize, wordList: EFF_WORD_LIST }))
    } catch (reason) {
      setGenerated('')
      setError(reason instanceof Error ? reason.message : 'Could not generate a passphrase.')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    if (!generated) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable. Copy the selected text manually.')
      await navigator.clipboard.writeText(generated)
      setFeedback('Copied to clipboard. Clear it when you are done.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not copy to clipboard.')
    }
  }

  const entropy = passphraseEntropyBits(wordCount, EFF_WORD_LIST_SIZE)
  const wordCountGuidance = wordCount === 3
    ? '3 words are easier to remember, but less secure.'
    : wordCount === 4
      ? '4 words provide better protection.'
      : wordCount === 5
        ? '5 words provide stronger protection.'
        : wordCount === 6
          ? 'Six words are recommended for most everyday uses and provide stronger protection than three.'
          : `${wordCount} words make your passphrase even harder to guess.`

  return (
    <section className="generator-card passphrase-generator" aria-labelledby="passphrase-generator-title">
      <div className="tool-heading">
        <div className="tool-icon word-icon"><KeyRound size={19} /></div>
        <div><span className="eyebrow">EASY TO REMEMBER, HARDER TO GUESS</span><h3 id="passphrase-generator-title">Create a Password You Can Remember</h3></div>
      </div>
      <p className="tool-description">Combine random words to create a strong password that's easier to remember and type. More words make it harder to guess.</p>

      <div className="generated-field-group">
        <label htmlFor="generated-passphrase" className="field-label">Your new passphrase</label>
        <div className="generated-field passphrase-output">
          <input id="generated-passphrase" value={generated} readOnly placeholder="Your passphrase appears here" autoComplete="off" aria-label="Generated passphrase" />
          <button className="icon-button" type="button" onClick={() => void copy()} disabled={!generated} aria-label="Copy passphrase"><Copy size={16} /></button>
          <button className="icon-button" type="button" onClick={() => { setGenerated(''); setFeedback('') }} disabled={!generated} aria-label="Remove passphrase"><Trash2 size={16} /></button>
        </div>
        <div className="feedback-slot" aria-live="polite">{feedback && <span><Check size={13} /> {feedback}</span>}</div>
      </div>

      <div className="phrase-options">
        <label className="option-field" htmlFor="word-count"><span className="field-label">How many words?</span>
          <select id="word-count" value={wordCount} onChange={(event) => setWordCount(Number(event.target.value))}>
            {Array.from({ length: 10 }, (_, index) => index + 3).map((count) => <option key={count} value={count}>{count} words</option>)}
          </select>
        </label>
        <label className="option-field" htmlFor="word-separator"><span className="field-label">Between each word</span>
          <input id="word-separator" type="text" value={separator} maxLength={8} onChange={(event) => setSeparator(event.target.value.replace(/[\r\n]/g, ''))} aria-describedby="separator-hint" />
          <small id="separator-hint">Any short separator</small>
        </label>
      </div>
      <label className="toggle-row phrase-capitalize">
        <input type="checkbox" checked={capitalize} onChange={(event) => setCapitalize(event.target.checked)} />
        <span className="toggle-control" aria-hidden="true" />
        <span className="toggle-label">Capitalize each word<small>Formatting does not add entropy</small></span>
      </label>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button className="action-button secondary-action" type="button" onClick={() => void generate()} disabled={loading} aria-busy={loading}><RefreshCw size={16} /> {loading ? 'Preparing words…' : 'Create my passphrase'}</button>
      <div className="entropy-note">
        <span>Estimated security strength</span><strong>{entropy.toFixed(1)} bits</strong>
        <small className="bits-explanation">Bits show how difficult your passphrase may be to guess. Higher bits generally mean better protection.</small>
        <small className="word-count-guidance" aria-live="polite">More randomly chosen words make your passphrase harder to guess. {wordCountGuidance}</small>
      </div>
    </section>
  )
}
