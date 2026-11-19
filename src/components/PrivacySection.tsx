import { Fingerprint, HardDrive, Network, Trash2 } from 'lucide-react'

const privacyPoints = [
  { icon: <HardDrive size={17} />, title: 'Your device, your control', body: 'Your passwords are processed on your device, not uploaded to our servers.' },
  { icon: <Network size={17} />, title: 'No password uploads', body: "We don't send your passwords anywhere for analysis or generation." },
  { icon: <Trash2 size={17} />, title: "Your passwords aren't stored", body: "PassGuard doesn't save your passwords. They stay temporarily in your browser while you use the tool." },
  { icon: <Fingerprint size={17} />, title: 'No tracking scripts', body: 'No third-party analytics or advertising scripts are included.' },
]

export function PrivacySection() {
  return (
    <section id="privacy" className="privacy-section" aria-labelledby="privacy-title">
      <div className="section-kicker"><span>OUR PRIVACY POLICY</span><span className="kicker-rule" /></div>
      <div className="privacy-heading">
        <div><span className="privacy-overline">PROMISE</span><h2 id="privacy-title">Your passwords stay yours.</h2></div>
        <div className="privacy-copy">
          <h3>We never ask you to trust us with your passwords.</h3>
          <p>Check, create and protect your passwords. Everything happens right in your browser.</p>
        </div>
      </div>
      <div className="privacy-grid">
        {privacyPoints.map((point) => (
          <article className="privacy-point" key={point.title}>
            <span className="privacy-icon" aria-hidden="true">{point.icon}</span>
            <div><h3>{point.title}</h3><p>{point.body}</p></div>
          </article>
        ))}
      </div>
      <div className="privacy-footnote">
        <strong>A quick note about your privacy</strong>
        <p>When you visit this website, the hosting provider may receive basic connection information. But the passwords you enter or generate are not sent to it.</p>
        <p>Your browser extensions or malware on your device may still affect your privacy.</p>
      </div>
    </section>
  )
}
