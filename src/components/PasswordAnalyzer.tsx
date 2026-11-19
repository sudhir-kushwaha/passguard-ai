import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, Info, RotateCcw, Shield, X } from 'lucide-react'
import type { PasswordAnalysis } from '../lib/passwordAnalysis'
import { Recommendations } from './Recommendations'
import { StrengthMeter } from './StrengthMeter'

export function PasswordAnalyzer() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [error, setError] = useState('')
  const [showBitsInfo, setShowBitsInfo] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const latestRequestRef = useRef(0)
  const loading = Boolean(password && !analysis && !error)

  useEffect(() => {
    if (!password) {
      latestRequestRef.current += 1
      workerRef.current?.terminate()
      workerRef.current = null
      return
    }

    const requestId = ++latestRequestRef.current
    const timer = window.setTimeout(() => {
      try {
        if (!workerRef.current) {
          const worker = new Worker(new URL('../workers/passwordAnalyzer.worker.ts', import.meta.url), { type: 'module' })
          worker.addEventListener('message', (event: MessageEvent<{ requestId: number; analysis?: PasswordAnalysis; error?: string }>) => {
            if (event.data.requestId !== latestRequestRef.current) return
            if (event.data.analysis) {
              setAnalysis(event.data.analysis)
              setError('')
            } else {
              setError('The local analysis engine could not score this value. Try editing it or refreshing the page.')
            }
          })
          worker.addEventListener('error', (event) => {
            event.preventDefault()
            worker.terminate()
            workerRef.current = null
            if (latestRequestRef.current > 0) {
              setError('The local analysis engine could not be loaded. Try refreshing this page.')
            }
          })
          workerRef.current = worker
        }
        workerRef.current.postMessage({ requestId, password })
      } catch {
        setError('The local analysis engine could not be started. Use a modern browser and try again.')
      }
    }, 100)

    return () => {
      window.clearTimeout(timer)
    }
  }, [password])

  useEffect(() => () => workerRef.current?.terminate(), [])

  return (
    <section id="analyzer" className="analyzer-section" aria-labelledby="analyzer-title">
      <div className="section-kicker analyzer-kicker"><span>PASSWORD ANALYZER</span><span className="kicker-rule" /></div>
      <div className="analyzer-heading">
        <div>
          <h2 id="analyzer-title">Is Your Password Safe?</h2>
          <p>Check how strong your password is and find out how to make it safer.</p>
        </div>
      </div>

      <div className="analyzer-shell">
        <div className="analyzer-workspace">
          <label htmlFor="password-entry" className="field-label">Enter your password <span>Not sent or saved</span></label>
          <div className="password-entry-wrap">
            <input
              id="password-entry"
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(event) => { setAnalysis(null); setError(''); setPassword(event.target.value) }}
              autoComplete="new-password"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Type or paste a password to analyze"
              aria-describedby="privacy-inline"
            />
            {password && <button className="icon-button clear-button" type="button" onClick={() => { setPassword(''); setAnalysis(null); setError(''); setVisible(false) }} aria-label="Remove password"><X size={17} /></button>}
            <button className="icon-button reveal-button" type="button" onClick={() => setVisible((shown) => !shown)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p id="privacy-inline" className="input-caption"><Shield size={13} /> Your password stays on this device and is never saved.</p>

          <StrengthMeter analysis={analysis} loading={loading} />
          {error && <p className="inline-error" role="alert">{error}</p>}

          {analysis ? (
            <>
              <div className="analysis-divider" />
              <div className="estimate-heading"><h3>How long might it take to guess?</h3><span>ROUGH ESTIMATES</span></div>
              <div className="crack-grid">
                {analysis.crackTimes.map((scenario) => (
                  <div className="crack-item" key={scenario.label}>
                    <span>{scenario.label}</span>
                    <strong>{scenario.estimate}</strong>
                  </div>
                ))}
              </div>
              <div className="entropy-line">
                <span className="entropy-label-group">
                  <span>Guessing Difficulty</span>
                  <span className="bits-help">
                    <button
                      className="bits-help-trigger"
                      type="button"
                      aria-label="What do bits mean?"
                      aria-expanded={showBitsInfo}
                      aria-describedby={showBitsInfo ? 'bits-tooltip' : undefined}
                      onClick={() => setShowBitsInfo((shown) => !shown)}
                    ><Info size={15} aria-hidden="true" /></button>
                    {showBitsInfo && <span id="bits-tooltip" className="bits-tooltip" role="tooltip">Bits measure how difficult a password is to guess. A higher number generally means a stronger password.</span>}
                  </span>
                </span>
                <strong>{analysis.entropyBits.toFixed(1)} bits</strong>
              </div>
              <p className="entropy-caption">Bits show how hard your password is to guess. Higher bits mean stronger protection.</p>
            </>
          ) : (
            <div className="analyzer-empty"><div className="empty-mark"><RotateCcw size={18} /></div><p>Enter a password to see how it holds up.<br />Your result updates as you type.</p></div>
          )}
          {loading && <p className="quiet-copy analyzer-status" role="status">Checking privately on this device…</p>}
          <div className="recommendations-area">
            <h3 className="recommendations-heading">What could make it safer?</h3>
            <Recommendations weaknesses={analysis?.weaknesses ?? []} recommendations={analysis?.recommendations ?? []} />
            <div className="practical-examples" aria-label="Examples of stronger password choices">
              <article className="password-example">
                <h4>Make it longer</h4>
                <p><span>Weak</span><code>Tiger123</code></p>
                <p><span>Stronger</span><code>Tiger!River#Cloud92</code></p>
                <small>Longer passwords generally take more guesses to crack.</small>
              </article>
              <article className="password-example">
                <h4>Avoid common words and patterns</h4>
                <p><span>Weak</span><code>Password123</code></p>
                <p><span>Stronger</span><span className="example-copy">Use unrelated words, numbers and symbols in an unpredictable combination.</span></p>
                <small>Common words and patterns are easier to guess.</small>
              </article>
              <article className="password-example">
                <h4>Mix different character types</h4>
                <p><span>Weak</span><code>sunshine2026</code></p>
                <p><span>Stronger</span><code>S7!mQ9#vL2@p</code></p>
                <small>Mixing uppercase, lowercase, numbers and symbols can make guessing harder.</small>
              </article>
              <article className="password-example">
                <h4>Use a unique password for every account</h4>
                <p><span>Weak</span><span className="example-copy">Reusing one password for email, banking and social media.</span></p>
                <p><span>Stronger</span><span className="example-copy">Create a different password for every account.</span></p>
                <small>If one account is compromised, the others stay protected from password reuse.</small>
              </article>
            </div>
          </div>
          <div className="score-note"><span className="note-mark">i</span><p><strong>How we score it.</strong> We estimate how many guesses common patterns might take. Scores are a guide, not a guarantee.</p></div>
          <details className="method-details">
            <summary>Scoring method</summary>
            <p>We check your password for common words, predictable patterns and combinations that may be easier to guess. Based on these checks, we give your password a score from 0 to 100. A higher score means it may be harder to guess. This is an estimate, not a guarantee.</p>
          </details>
        </div>
      </div>
    </section>
  )
}
