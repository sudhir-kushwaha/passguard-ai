# PassGuard AI - Development Instructions

You are the lead developer of PassGuard AI.

## Design
- Follow .agents/skills/anti-ai-design/SKILL.md.
- Build a premium, distinctive cybersecurity website.
- Use dark charcoal backgrounds and restrained lime accents.
- Avoid generic AI-generated layouts.
- Support mobile, tablet and desktop.

## Technology
- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- zxcvbn
- Web Crypto API
- Playwright

## Features
1. Password strength analyzer.
2. Security score from 0-100.
3. Entropy estimation.
4. Weakness detection.
5. Password improvement recommendations.
6. Secure password generator.
7. Customizable password settings.
8. Random passphrase generator.
9. Optional Have I Been Pwned breach checker.
10. Cybersecurity education.
11. Privacy policy.
12. PWA and offline support.

## Security
- Never transmit or store entered passwords.
- Never log passwords.
- Never use Math.random() for cryptographic randomness.
- Use crypto.getRandomValues().
- Keep core analysis entirely in the browser.
- Explain optional breach-checking data transmission.

## Performance
- Optimize for low-powered computers.
- Keep dependencies minimal.
- Avoid unnecessary animations.
- Optimize production bundle size.
- Support modern browsers.

## Deployment
- Prepare static production build.
- Prepare GitHub and Cloudflare Pages deployment.
- Configure SEO, sitemap.xml and robots.txt.
- Include deployment documentation.

## Development rules
- Build all requested features, not just a landing page.
- Test every interactive feature.
- Run production builds.
- Fix errors.
- Investigate npm vulnerabilities.
- Never deploy without user approval.
- Report incomplete functionality honestly.
