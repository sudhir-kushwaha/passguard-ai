import { ArrowDown, ArrowUpRight, Check, LockKeyhole, ScanEye } from 'lucide-react'
import { EducationSection } from './components/EducationSection'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { PasswordAnalyzer } from './components/PasswordAnalyzer'
import { PasswordGenerator } from './components/PasswordGenerator'
import { PassphraseGenerator } from './components/PassphraseGenerator'
import { PrivacySection } from './components/PrivacySection'
import './App.css'

function App() {
  return (
    <div id="top" className="app-shell">
      <Header />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker"><span className="status-dot" /> YOUR PASSWORD. YOUR PRIVACY.</p>
            <h1 id="hero-title">Create Strong Passwords.<br /><em>Stay Safe Online.</em></h1>
            <p className="hero-lede">Check your password, create a secure new one, or make an easy-to-remember passphrase. Everything happens right on your device.</p>
            <div className="hero-actions">
              <a className="hero-action hero-action-primary" href="#analyzer">Check My Password <ArrowDown size={16} /></a>
              <a className="hero-action" href="#password-generator-title">Create a Password</a>
              <a className="hero-action" href="#passphrase-generator-title">Make a Passphrase</a>
            </div>
          </div>
          <div className="hero-aside" aria-label="Privacy summary">
            <div className="hero-art" aria-hidden="true">
              <img className="hero-logo" src="/passguard-lock.png" alt="" />
            </div>
            <div className="hero-proof">
              <div><LockKeyhole size={14} /><span>Nothing leaves this browser</span></div>
              <div><Check size={14} /><span>No account. No tracking. No upload.</span></div>
            </div>
          </div>
          <div className="hero-index"><a href="#generators">EXPLORE PASSGUARD</a></div>
        </section>

        <PasswordAnalyzer />

        <section id="generators" className="generators-section" aria-labelledby="generators-title">
          <div className="section-kicker"><span>MAKE SOMETHING STRONGER</span><span className="kicker-rule" /></div>
          <div className="generator-intro">
            <div><h2 id="generators-title">Create a password that’s yours.</h2><p>Make a unique password or a phrase that’s easier to remember. Save it in your password manager.</p></div>
          </div>
          <div className="generator-layout">
            <PasswordGenerator />
            <PassphraseGenerator />
          </div>
          <p className="generator-warning"><LockKeyhole size={14} /> Your generated passwords stay here while this page is open. Clear them when you're done, especially on shared devices.</p>
        </section>

        <EducationSection />
        <PrivacySection />

        <section className="closing-note" aria-label="Password safety reminder">
          <span className="closing-mark"><ScanEye size={20} /></span>
          <p><strong>Strong passwords start here.</strong><span>Smart habits keep every account better protected.</span></p>
          <a href="#top" aria-label="Back to the top"><ArrowUpRight size={17} /></a>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
