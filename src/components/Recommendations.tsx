import { ArrowUpRight, Check, CircleAlert, Lightbulb } from 'lucide-react'

interface RecommendationsProps {
  weaknesses: string[]
  recommendations: string[]
}

function explainRecommendation(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('15 or more characters') || lower.includes('longer keyboard pattern')) {
    return 'Make it longer: Add more characters to make guessing harder.'
  }
  if (lower.includes('common password') || lower.includes('easy to guess') || lower.includes('names and surnames')) {
    return "Avoid common words: Don't use your name, birthday, or predictable words."
  }
  if (lower.includes('another word') || lower.includes('few words') || lower.includes('uncommon words')) {
    return 'Use random combinations: Mix unrelated words, numbers, and symbols.'
  }
  if (lower.includes('capitalization') || lower.includes('all-uppercase') || lower.includes('substitution') || lower.includes('reversed words')) {
    return 'Use random combinations: Mix unrelated words, numbers, and symbols instead of predictable changes.'
  }
  if (lower.includes('repeated') || lower.includes('sequence') || lower.includes('year') || lower.includes('date')) {
    return 'Avoid predictable patterns: Skip repeated characters, sequences, and dates.'
  }
  if (lower.includes('unique') || lower.includes('password manager')) {
    return 'Use a unique password: Never reuse the same password across different accounts.'
  }
  return message
}

export function Recommendations({ weaknesses, recommendations }: RecommendationsProps) {
  if (weaknesses.length === 0 && recommendations.length === 0) {
    return <p className="empty-guidance">Enter a password to see what’s working and what you can improve.</p>
  }

  return (
    <div className="insight-columns">
      <section aria-labelledby="weakness-heading">
        <h3 id="weakness-heading" className="subsection-title"><CircleAlert size={15} /> Things that make it easier to guess</h3>
        {weaknesses.length ? (
          <ul className="insight-list weakness-list">
            {weaknesses.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="quiet-copy"><Check size={14} /> No easy-to-spot patterns found</p>
        )}
      </section>
      <section aria-labelledby="recommendation-heading">
        <h3 id="recommendation-heading" className="subsection-title"><Lightbulb size={15} /> Try these improvements</h3>
        {recommendations.length ? (
          <ul className="insight-list recommendation-list">
            {recommendations.map((item) => {
              const explanation = explainRecommendation(item)
              const colon = explanation.indexOf(':')
              return (
                <li key={item}>
                  {colon > 0 ? <><strong>{explanation.slice(0, colon + 1)}</strong>{explanation.slice(colon + 1)}</> : explanation}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="quiet-copy"><Check size={14} /> Use it for one account only</p>
        )}
      </section>
    </div>
  )
}
