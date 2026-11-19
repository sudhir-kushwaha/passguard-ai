# PassGuard AI

PassGuard is a browser-based password strength analyzer and credential generator. Password analysis and generation run on the user's device; password values are not sent to a server or persisted by the application.

## Run locally

```sh
npm install
npm run dev
```

Use a current browser with Web Crypto support. Production deployments must use HTTPS for secure randomness, clipboard access, and service workers.

## Features

- Live password analysis using zxcvbn in an on-demand Web Worker, with pattern findings, recommendations, crack-time scenarios, and an estimated score from 0 to 100.
- Configurable random password generation using `crypto.getRandomValues()` and rejection sampling. Each selected character class is guaranteed to appear.
- Configurable passphrases generated from the bundled EFF 7,776-word Diceware list. See [`src/data/README.md`](src/data/README.md) for source and attribution.
- Privacy and security education, a privacy policy, and a production service worker that caches the app shell at install and caches deferred tool assets when first requested. After opening each tool once online, analysis and generation work after an offline reload.

## Scoring notes

The analyzer uses zxcvbn's estimated number of guesses. It calculates estimated guess entropy as `log₂(guesses)` and maps that to a score with `min(100, round(bits / 80 × 100))`. Labels use these score bands: 0–19 Very Weak, 20–39 Weak, 40–59 Fair, 60–79 Strong, 80–100 Very Strong. Crack-time estimates are zxcvbn scenarios, not promises; they vary with attacker speed, hashing, salting and rate limits.

Passphrase entropy is `word count × log₂(7,776)` for independent uniform draws from the bundled EFF list. The default is six words, in line with EFF's general recommendation. Capitalization and separators are formatting choices and do not increase that estimate. Human-selected or edited words do not have the same guarantee.

For context, NIST's current digital identity guidance sets a 15-character minimum for passwords used as a single authentication factor. Sites can have different rules and multi-factor configurations; PassGuard is an estimator, not a compliance checker.

## Privacy and storage

- No password API calls, analytics, or advertising scripts are included.
- Entered and generated secrets stay in page memory until cleared or the tab is closed. PassGuard does not write them to cookies, local storage, session storage, IndexedDB, or logs.
- Clipboard access occurs only after a user presses a copy control. Clear the system clipboard separately if needed.
- The service worker only handles same-origin GET requests for the app shell and static build assets without query strings. It does not cache API requests or form submissions.
- This build does not include a breach database checker. It therefore sends no password-derived value to a breach-checking service.
- The static site host can receive ordinary connection metadata when a browser downloads the site; password values are not included in those requests.

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
```

The Playwright suite builds and serves the production output, then exercises analysis, score disclosure, clearing input, generator settings and validation, category guarantees, passphrase options, copy controls, mobile/tablet overflow, and a real offline reload after warming the deferred assets.

## Security status

`npm audit` currently reports five high-severity dependency entries caused by the same `picomatch@4.0.7` ReDoS advisory, reached through Vite 8 and its `tinyglobby`/`fdir` dependencies. The advisory does not currently list a patched release; `picomatch@4.0.8` was not available in the configured npm registry during verification. Do not force a Vite downgrade: the project intentionally retains Vite 8 compatibility and the React plugin's Vite 8 peer requirement. Recheck the advisory and audit after an upstream patched release is published.

## Production output

`npm run build` writes the static site to `dist/`. Serve that directory from a static host such as Cloudflare Pages or GitHub Pages over HTTPS. Configure the host's project base path before using a non-root GitHub Pages repository URL. No deployment or publishing occurs from this repository's build scripts.
