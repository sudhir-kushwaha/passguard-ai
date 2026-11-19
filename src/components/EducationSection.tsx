import { ArrowDownRight, BookOpenCheck, Fingerprint, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react'

const lessons = [
  {
    icon: <KeyRound size={17} />,
    title: 'Longer passwords are harder to guess',
    body: 'Choose long, unique passwords or passphrases. Avoid predictable patterns like replacing letters with symbols or adding 123.',
  },
  {
    icon: <RefreshCw size={17} />,
    title: 'Give every account its own password',
    body: 'Never reuse passwords. If one account is compromised, unique passwords help protect your other accounts.',
  },
  {
    icon: <Fingerprint size={17} />,
    title: 'A password score is a helpful guide',
    body: 'It estimates how difficult your password may be to guess. It cannot guarantee complete protection.',
  },
]

export function EducationSection() {
  return (
    <section id="learn" className="education-section" aria-labelledby="learn-title">
      <div className="section-kicker"><span>SECURITY, MADE SIMPLE</span><span className="kicker-rule" /></div>
      <div className="education-layout">
        <div className="education-lead">
          <BookOpenCheck size={21} aria-hidden="true" />
          <h2 id="learn-title">Small habits.<br /><em>Stronger protection.</em></h2>
          <p>Better password habits don't have to be complicated. A few smart choices can make a real difference.</p>
          <a href="#generators" className="text-link">Create a unique password <ArrowDownRight size={15} /></a>
        </div>
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <article className="lesson-row" key={lesson.title}>
              <span className="lesson-icon" aria-hidden="true">{lesson.icon}</span>
              <div><h3>{lesson.title}</h3><p>{lesson.body}</p></div>
            </article>
          ))}
        </div>
      </div>
      <div className="password-manager-note"><ShieldAlert size={18} /><p><strong>Make password security easier.</strong> A password manager helps you create, save and fill unique passwords without having to remember them all. PassGuard itself does not store or manage your credentials.</p></div>
    </section>
  )
}
