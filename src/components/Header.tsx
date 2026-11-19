import { ArrowUpRight } from 'lucide-react'

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="PassGuard AI home">
        <span className="brand-mark" aria-hidden="true"><img src="/passguard-lock.png" alt="" /></span>
        <span className="brand-name">passguard<span>.ai</span></span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        <a href="#analyzer">Analyzer</a>
        <a href="#generators">Generators</a>
        <a href="#learn">Learn</a>
      </nav>
      <a className="privacy-link" href="#privacy"><span className="status-dot" /> Privacy first <ArrowUpRight size={14} /></a>
    </header>
  )
}
