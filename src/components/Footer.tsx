import { ArrowUpRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark" aria-hidden="true"><img src="/passguard-lock.png" alt="" /></span>
        <span className="brand-name">passguard<span>.ai</span></span>
      </a>
      <p>Security. Privacy. Simplicity.</p>
      <div className="footer-meta"><a href="#privacy">Privacy policy <ArrowUpRight size={13} /></a><span>Built for the browser · 2026</span></div>
    </footer>
  )
}
