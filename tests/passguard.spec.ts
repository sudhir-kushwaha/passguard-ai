import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let clipboardValue = ''
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => { clipboardValue = value },
        readText: async () => clipboardValue,
      },
    })
  })
  await page.goto('/')
})

test('analyzes locally, explains the score, and clears the entered value', async ({ page }) => {
  const value = 'password123'
  const requestedUrls: string[] = []
  page.on('request', (request) => requestedUrls.push(request.url()))

  await page.locator('#password-entry').fill(value)
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', /\d+/)
  await expect(page.getByText('Very Weak', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Is Your Password Safe?' })).toBeVisible()
  const strengthPanel = page.locator('.strength-panel')
  await expect(strengthPanel.getByText('Scoring method')).toHaveCount(0)
  await expect(strengthPanel.getByText('A guide to how difficult this password may be to guess.')).toHaveCount(0)
  const scoringMethod = page.locator('.score-note + .method-details')
  await expect(scoringMethod.locator('summary')).toHaveText('Scoring method')
  await expect(scoringMethod.locator('p')).toBeHidden()
  await scoringMethod.locator('summary').click()
  await expect(scoringMethod.locator('p')).toHaveText('We check your password for common words, predictable patterns and combinations that may be easier to guess. Based on these checks, we give your password a score from 0 to 100. A higher score means it may be harder to guess. This is an estimate, not a guarantee.')
  await scoringMethod.locator('summary').click()
  await expect(scoringMethod.locator('p')).toBeHidden()
  await expect(page.getByText(/How long might it take to guess/)).toBeVisible()
  for (const label of ['Online Hacker Attack', 'Stolen Password Attack', 'Lightning-Fast Cracking']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(page.getByText('Bits show how hard your password is to guess. Higher bits mean stronger protection.')).toBeVisible()
  const desktopResultStyles = await page.locator('.crack-item strong').evaluateAll((results) => results.map((result) => {
    const style = getComputedStyle(result)
    return { fontSize: Number.parseFloat(style.fontSize), fontWeight: style.fontWeight, color: style.color }
  }))
  expect(desktopResultStyles).toHaveLength(3)
  for (const style of desktopResultStyles) {
    expect(style.fontSize).toBeGreaterThanOrEqual(18)
    expect(style.fontSize).toBeLessThanOrEqual(20)
    expect(style.fontWeight).toBe('600')
    expect(style.color).toBe('rgb(200, 243, 106)')
  }
  await page.setViewportSize({ width: 390, height: 900 })
  const mobileResultSizes = await page.locator('.crack-item strong').evaluateAll((results) => results.map((result) => Number.parseFloat(getComputedStyle(result).fontSize)))
  expect(mobileResultSizes).toHaveLength(3)
  for (const size of mobileResultSizes) expect(size).toBeGreaterThanOrEqual(16)
  await expect(page.locator('.caveat')).toHaveCount(0)
  await expect(page.getByText('Guessing Difficulty')).toBeVisible()
  await page.getByRole('button', { name: 'What do bits mean?' }).click()
  await expect(page.getByRole('tooltip')).toContainText('Bits measure how difficult a password is to guess')
  await expect(page.getByText('Things that make it easier to guess')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Make it longer' })).toBeVisible()
  await expect(page.getByText('Tiger!River#Cloud92')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Use a unique password for every account' })).toBeVisible()
  await expect(page.locator('#password-entry')).toHaveValue(value)
  await expect(page.getByText('Readout')).toHaveCount(0)
  await expect(page.getByText('What the model sees')).toHaveCount(0)

  const input = page.locator('#password-entry')
  await expect(input).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(input).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Hide password' }).click()
  await page.getByRole('button', { name: 'Remove password' }).first().click()
  await expect(input).toHaveValue('')
  await expect(page.getByText('Awaiting input')).toBeVisible()

  expect(requestedUrls.every((url) => !url.includes(value))).toBe(true)
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

test('does not display the estimated guess count for analyzed passwords', async ({ page }) => {
  const input = page.locator('#password-entry')

  for (const password of ['password123', 'correct horse battery staple', 'Tr0ub4dor&3']) {
    await input.fill(password)
    await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', /\d+/)
    await expect(page.locator('.crack-item')).toHaveCount(3)
    await expect(page.locator('.entropy-line')).not.toContainText(/About .* guesses/)
  }
})

test('generates the configured length with every selected category and excludes ambiguous characters', async ({ page }) => {
  await page.locator('#password-length').fill('16')
  await page.getByRole('button', { name: 'Create my password' }).click()

  const output = page.locator('#generated-password')
  await page.getByRole('button', { name: 'Show generated password' }).click()
  const password = await output.inputValue()
  expect(password).toHaveLength(16)
  expect(password).toMatch(/[A-Z]/)
  expect(password).toMatch(/[a-z]/)
  expect(password).toMatch(/[0-9]/)
  expect([...password].some((character) => '!#$%&()*+,-./:;=?@[]^_{|}~'.includes(character))).toBe(true)
  expect(password).not.toMatch(/[Il1O0]/)

  await page.getByRole('button', { name: 'Remove password' }).click()
  await expect(output).toHaveValue('')
})

test('validates an empty character selection and too-short selected-category length', async ({ page }) => {
  for (const name of ['Uppercase', 'Lowercase', 'Numbers', 'Symbols']) {
    await page.locator('.category-grid .toggle-row').filter({ hasText: name }).click()
  }
  await page.getByRole('button', { name: 'Create my password' }).click()
  await expect(page.getByRole('alert')).toContainText('Select at least one character type')

  for (const name of ['Uppercase', 'Lowercase', 'Numbers', 'Symbols']) {
    await page.locator('.category-grid .toggle-row').filter({ hasText: name }).click()
  }
  await page.locator('#password-length').fill('3')
  await page.getByRole('button', { name: 'Create my password' }).click()
  await expect(page.getByRole('alert')).toContainText('between 8 and 128')
})

test('generates a configurable EFF passphrase and copies it on request', async ({ page }) => {
  await page.getByLabel('How many words?').selectOption('6')
  await page.getByLabel('Between each word').fill(':')
  await page.locator('.phrase-capitalize').click()
  await page.getByRole('button', { name: 'Create my passphrase' }).click()

  const output = page.locator('#generated-passphrase')
  await expect(output).not.toHaveValue('')
  const phrase = await output.inputValue()
  const words = phrase.split(':')
  expect(words).toHaveLength(6)
  expect(words.every((word) => /^[A-Z]/.test(word))).toBe(true)
  await expect(page.getByText(/Bits show how difficult your passphrase may be to guess/)).toBeVisible()
  await expect(page.getByText(/Six words are recommended for most everyday uses/)).toBeVisible()
  const sixWordStrength = await page.locator('.entropy-note strong').textContent()
  await expect(page.getByText('EFF suggests')).toHaveCount(0)
  await expect(page.getByText('EFF word list bundled with attribution')).toHaveCount(0)
  await page.getByLabel('How many words?').selectOption('3')
  await expect(page.getByText('3 words are easier to remember, but less secure.')).toBeVisible()
  expect(await page.locator('.entropy-note strong').textContent()).not.toBe(sixWordStrength)
  await page.getByLabel('How many words?').selectOption('6')
  await expect(page.getByText(/Six words are recommended for most everyday uses/)).toBeVisible()

  await page.getByRole('button', { name: 'Copy passphrase' }).click()
  await expect(page.getByText(/Copied to clipboard/)).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(phrase)
  await page.getByRole('button', { name: 'Remove passphrase' }).click()
  await expect(output).toHaveValue('')
})

test('copies generated passwords through the user-initiated clipboard action', async ({ page }) => {
  await page.getByRole('button', { name: 'Create my password' }).click()
  const output = page.locator('#generated-password')
  const password = await output.inputValue()
  await page.getByRole('button', { name: 'Copy password' }).click()
  await expect(page.getByText(/Copied to clipboard/)).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(password)
})

test('reflows for mobile and tablet without horizontal overflow', async ({ page }) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    await expect(page.getByRole('heading', { name: 'Create a Strong Password' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Create a Password You Can Remember' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Make it longer' })).toBeVisible()
    await expect(page.getByText("Your generated passwords stay here while this page is open. Clear them when you're done, especially on shared devices.")).toBeVisible()
    await expect(page.getByText('WEB CRYPTO API')).toHaveCount(0)
  }
})

test('shows the privacy disclosures and security copy across desktop, tablet and mobile', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your passwords stay yours.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'We never ask you to trust us with your passwords.' })).toBeVisible()
  await expect(page.getByText('Check, create and protect your passwords. Everything happens right in your browser.')).toBeVisible()
  for (const title of ['Your device, your control', 'No password uploads', "Your passwords aren't stored", 'No tracking scripts']) {
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
  }
  await expect(page.getByText('A quick note about your privacy')).toBeVisible()
  await expect(page.getByText(/the hosting provider may receive basic connection information/i)).toBeVisible()
  await expect(page.getByText(/browser extensions or malware on your device may still affect your privacy/i)).toBeVisible()
  await expect(page.getByText('Strong passwords start here.')).toBeVisible()
  await expect(page.getByText('Smart habits keep every account better protected.')).toBeVisible()
  await expect(page.getByText('Security. Privacy. Simplicity.')).toBeVisible()
  expect(await page.locator('.privacy-overline').evaluate((label) => getComputedStyle(label).fontWeight)).toBe('800')

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const layout = await page.locator('.privacy-grid').evaluate((grid) => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.columns).toBe(width <= 620 ? 1 : 2)
    expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth)
    await expect(page.locator('.privacy-point')).toHaveCount(4)
    await expect(page.getByRole('heading', { name: 'Is Your Password Safe?' })).toBeVisible()
    await expect(page.locator('.local-stamp')).toHaveCount(0)
    await expect(page.getByText('Private analysis on your device')).toHaveCount(0)
  }

  await page.locator('.footer-meta a[href="#privacy"]').click()
  await expect(page).toHaveURL(/#privacy$/)
  await page.locator('.closing-note > a[href="#top"]').click()
  await expect(page).toHaveURL(/#top$/)
})

test('presents the simplified security education copy and preserves its generator link', async ({ page }) => {
  await expect(page.getByText('SECURITY, MADE SIMPLE')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Small habits. Stronger protection.' })).toBeVisible()
  await expect(page.getByText("Better password habits don't have to be complicated. A few smart choices can make a real difference.")).toBeVisible()
  const lessons = [
    ['Longer passwords are harder to guess', 'Choose long, unique passwords or passphrases. Avoid predictable patterns like replacing letters with symbols or adding 123.'],
    ['Give every account its own password', 'Never reuse passwords. If one account is compromised, unique passwords help protect your other accounts.'],
    ['A password score is a helpful guide', 'It estimates how difficult your password may be to guess. It cannot guarantee complete protection.'],
  ]
  for (const [heading, description] of lessons) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.getByText(description)).toBeVisible()
  }
  await expect(page.getByText('Make password security easier.')).toBeVisible()
  await expect(page.getByText(/PassGuard itself does not store or manage your credentials/)).toBeVisible()

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const layout = await page.locator('.education-layout').evaluate((element) => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.columns).toBe(width <= 620 ? 1 : 2)
    expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth)
    await expect(page.locator('.lesson-row')).toHaveCount(3)
  }

  await page.getByRole('link', { name: 'Create a unique password' }).click()
  await expect(page).toHaveURL(/#generators$/)
})

test('uses the supplied password lock artwork across the site and brand icon metadata', async ({ page }) => {
  const logos = page.locator('img[src="/passguard-lock.png"]')
  await expect(logos).toHaveCount(3)
  const logoStates = await logos.evaluateAll((images) => images.map((image) => ({
    complete: (image as HTMLImageElement).complete,
    width: (image as HTMLImageElement).naturalWidth,
  })))
  expect(logoStates).toEqual([
    { complete: true, width: 930 },
    { complete: true, width: 930 },
    { complete: true, width: 930 },
  ])
  const outsideCircleAlpha = await logos.first().evaluate((image) => {
    const logo = image as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = logo.naturalWidth
    canvas.height = logo.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context is unavailable')
    context.drawImage(logo, 0, 0)
    return context.getImageData(0, 0, 1, 1).data[3]
  })
  expect(outsideCircleAlpha).toBe(0)

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('.hero-logo')).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  }

  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="16x16"]')).toHaveAttribute('href', '/favicon-16.png')
  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="32x32"]')).toHaveAttribute('href', '/favicon-32.png')
  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="48x48"]')).toHaveAttribute('href', '/favicon-48.png')
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/passguard-mark.svg')
  await expect(page.locator('link[rel="shortcut icon"]')).toHaveAttribute('href', '/favicon.ico')
  await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveAttribute('href', '/apple-touch-icon.png')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', '/og-passguard.png')

  for (const path of ['/favicon-16.png', '/favicon-32.png', '/favicon-48.png', '/favicon.ico', '/apple-touch-icon.png', '/icons/passguard-192.png', '/icons/passguard-512.png', '/og-passguard.png']) {
    const response = await page.request.get(path)
    expect(response.ok(), `${path} should be served`).toBe(true)
  }
  const manifestResponse = await page.request.get('/manifest.webmanifest')
  const manifest = await manifestResponse.json() as { icons: Array<{ src: string; sizes: string }> }
  expect(manifest.icons).toEqual([
    { src: '/icons/passguard-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/passguard-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ])
})

test('production service worker supports a genuine offline reload and local analysis', async ({ page }) => {
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker?.controller))).toBe(true)
  const passwordInput = page.locator('#password-entry')
  await passwordInput.fill('password123')
  await expect(page.getByText('Very Weak', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Remove password' }).first().click()
  await page.getByRole('button', { name: 'Create my passphrase' }).click()
  await expect(page.locator('#generated-passphrase')).not.toHaveValue('')

  const cachedAssets = await page.evaluate(async () => {
    const cache = await caches.open('passguard-shell-v1')
    return (await cache.keys()).map((request) => new URL(request.url).pathname)
  })
  expect(cachedAssets).toContain('/')
  expect(cachedAssets.some((path) => path.endsWith('.css'))).toBe(true)
  expect(cachedAssets.some((path) => path.includes('passwordAnalyzer.worker'))).toBe(true)
  expect(cachedAssets.some((path) => path.includes('effWordList'))).toBe(true)

  await page.context().setOffline(true)
  try {
    await page.reload()
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill('password123')
    await expect(page.getByText('Very Weak', { exact: true })).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Create my passphrase' }).click()
    await expect(page.locator('#generated-passphrase')).not.toHaveValue('', { timeout: 15_000 })
  } finally {
    await page.context().setOffline(false)
  }
})
