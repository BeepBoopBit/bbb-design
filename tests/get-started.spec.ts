import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the guide renders canonical Markdown with copyable examples and a matching download', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => {
      (window as unknown as { copiedGuideText: string }).copiedGuideText = text
    } } })
  })
  await page.goto('/getting-started')
  await expect(page).toHaveTitle('Get started · BBB design system')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Get started')
  const guide = page.getByRole('article', { name: 'Get started guide' })
  await expect(guide).toContainText('It does not create the app.')
  if (test.info().project.name === 'chromium') await page.screenshot({ path: test.info().outputPath('get-started-overview.png'), fullPage: false })
  const commands = guide.locator('.bbb-code-block').filter({ hasText: 'npm create vite@latest' })
  await commands.getByRole('button', { name: 'Copy', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(commands.getByRole('button', { name: 'Copied', exact: true })).toBeFocused()
  expect(await page.evaluate(() => (window as unknown as { copiedGuideText: string }).copiedGuideText))
    .toBe('npm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install')
  const setup = guide.locator('.bbb-code-block').filter({ hasText: 'npx @beepboopbit/ui@latest init --dry-run' })
  await setup.getByRole('button', { name: 'Copy', exact: true }).click()
  expect(await page.evaluate(() => (window as unknown as { copiedGuideText: string }).copiedGuideText))
    .toBe('npx @beepboopbit/ui@latest init --dry-run\nnpx @beepboopbit/ui@latest init')
  await expect(guide.getByRole('region', { name: 'React example' }).filter({ hasText: 'export default function App()' })).toContainText('ThemeProvider')
  const ids = await guide.locator('h2').evaluateAll(headings => headings.map(heading => `#${heading.id}`))
  expect(await page.getByRole('navigation', { name: 'On this page' }).getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(ids)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download guide', exact: true }).click(),
  ])
  expect(download.suggestedFilename()).toBe('BBB-adoption.md')
  const stream = await download.createReadStream()
  let content = ''
  for await (const chunk of stream!) content += chunk.toString()
  expect(content).toBe(await readFile('docs/ADOPTION.md', 'utf8'))
  for (const link of await guide.locator('a[download]').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))) {
    // Vite can inline smaller Markdown downloads as data URLs in production.
    const response = await page.evaluate(async url => {
      const download = await fetch(url)
      return { ok: download.ok, content: await download.text() }
    }, link)
    expect(response.ok).toBe(true)
    expect(response.content).toMatch(/^#/)
  }
})

test('sidebar route changes preserve the shell, appearance, and browser history', async ({ page }) => {
  await page.goto('/gallery?category=components&q=button')
  await page.locator('.gallery-appearance-controls').getByRole('button', { name: /Color mode/ }).click()
  const mode = await page.locator('#root > [data-bbb-theme]').getAttribute('data-bbb-mode')
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click()
  const guideLink = navigation.getByRole('link', { name: 'Get started', exact: true })
  await guideLink.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/getting-started$/)
  await expect(page.getByRole('heading', { name: 'Get started', exact: true })).toBeVisible()
  await expect(guideLink).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.locator('.gallery-shell')).toHaveAttribute('data-sidebar-collapsed', 'true')
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', mode!)
  await page.goBack()
  await expect(page.getByRole('searchbox', { name: 'Search gallery' })).toHaveValue('button')
  await expect(page).toHaveURL(/category=components&q=button/)
  await page.goForward()
  await expect(page.getByRole('article', { name: 'Get started guide' })).toBeVisible()
  await navigation.getByRole('link', { name: /Components/ }).click()
  await expect(page).toHaveURL(/\/gallery\?category=components/)
  await expect(page.getByRole('searchbox', { name: 'Search gallery' })).toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
})

test('section bookmarks survive reloads and remain below the sticky header', async ({ page }) => {
  await page.goto('/getting-started#use-your-first-component')
  const target = page.getByRole('heading', { name: 'Use your first component', exact: true })
  await expect(target).toBeFocused()
  await expect(target).toBeInViewport()
  await page.reload()
  await expect(target).toBeInViewport()
  const contents = page.getByRole('navigation', { name: 'On this page' })
  await contents.getByRole('link', { name: 'Create an app', exact: true }).click()
  await expect(page).toHaveURL(/#create-an-app$/)
  const heading = page.getByRole('heading', { name: 'Create an app', exact: true })
  await expect(heading).toBeInViewport()
  const bounds = await heading.boundingBox()
  const header = await page.locator('.gallery-topbar').boundingBox()
  expect(bounds!.y).toBeGreaterThanOrEqual(header!.y + header!.height)
})

test('mobile navigation reaches the guide, dismisses by keyboard, and survives resizing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.goto('/gallery?item=button')
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const sheet = page.getByRole('dialog', { name: 'Browse BBB', exact: true })
  await sheet.getByRole('link', { name: 'Get started', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(sheet).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Get started', exact: true })).toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
  await trigger.click()
  await expect(sheet.getByRole('link', { name: 'Get started', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.keyboard.press('Escape')
  await expect(sheet).not.toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
})

for (const mode of ['light', 'dark']) test(`the guide reflows at 200% text in ${mode} and keeps its section links accessible`, async ({ page }) => {
  await page.addInitScript(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ brand: 'bbb', mode, density: 'comfortable' })), mode)
  await page.goto('/getting-started')
  await expect(page.getByRole('article', { name: 'Get started guide' })).toBeVisible()
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(width => { document.documentElement.style.fontSize = width === 1440 ? '' : '200%' }, width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const contents = page.getByRole('navigation', { name: 'On this page' })
    if (await contents.locator('details').getAttribute('open') === null) await contents.locator('summary').click()
    await contents.getByRole('link', { name: 'Initialize BBB', exact: true }).focus()
    await page.keyboard.press('Enter')
    const heading = page.getByRole('heading', { name: 'Initialize BBB', exact: true })
    await expect(heading).toBeInViewport()
    const bounds = await heading.boundingBox()
    const header = await page.locator('.gallery-topbar').boundingBox()
    expect(bounds!.y).toBeGreaterThanOrEqual(header!.y + header!.height)
    if (test.info().project.name === 'chromium') await page.screenshot({ path: test.info().outputPath(`get-started-${mode}-${width}.png`), fullPage: false })
  }
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
})
