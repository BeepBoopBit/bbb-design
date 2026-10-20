import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Gallery exposes actual source, dependent files, setup, and a complete download', async ({ page }) => {
  await page.goto('/gallery?item=button')
  const card = page.getByRole('article', { name: 'Button', exact: true })
  await card.getByRole('button', { name: 'View code' }).click()
  const source = card.getByRole('region', { name: 'Component source', exact: true })
  await expect(source).toContainText('export function Button')
  const select = card.getByRole('button', { name: /Source file/ })
  await select.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('option', { name: /Button.css.*components\/Button\/Button.css/ }).click()
  await expect(select).toBeFocused()
  await expect(source).toContainText('.bbb-button')
  await expect(source).toContainText('var(--bbb-control-height)')
  await card.locator('summary', { hasText: 'Setup and dependencies' }).click()
  await expect(card.getByRole('region', { name: 'Copy with the local CLI' })).toContainText('npm run cli -- add button')
  await expect(card.getByRole('region', { name: 'Install dependencies' })).toContainText('react-aria-components')
  await expect(card.getByRole('region', { name: 'Required styles' })).toContainText('./bbb/foundations/styles.css')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    card.getByRole('link', { name: 'Download source bundle' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^bbb-button-.+\.json$/)
  const stream = await download.createReadStream()
  let json = ''
  for await (const chunk of stream!) json += chunk.toString()
  const bundle = JSON.parse(json)
  expect(bundle.name).toBe('button')
  expect(bundle.files.some((file: { target: string }) => file.target.endsWith('/LICENSE'))).toBe(true)
  expect(bundle.files.some((file: { target: string }) => file.target.endsWith('/foundations/styles.css'))).toBe(true)
  expect(bundle.files.some((file: { target: string }) => file.target.endsWith('/baseline.css'))).toBe(false)
  expect((await new AxeBuilder({ page }).include('.gallery-card__example-details').analyze()).violations).toEqual([])
})

test('failed source loading offers retry and restores keyboard focus after recovery', async ({ page }) => {
  await page.route('**/r/manifest.json', route => route.abort())
  await page.goto('/gallery?item=dialog')
  await page.getByRole('button', { name: 'View code' }).click()
  const retry = page.getByRole('button', { name: 'Try source files again' })
  await expect(retry).toBeVisible()
  await page.unroute('**/r/manifest.json')
  await retry.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Component source', exact: true })).toContainText('ModalDialog')
  await expect(page.getByRole('button', { name: /Source file/ })).toBeFocused()
})

for (const mode of ['light', 'dark']) {
  test(`source browsing reflows with enlarged text in ${mode}`, async ({ page }) => {
    await page.addInitScript(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
    await page.goto('/gallery?item=dialog')
    await page.getByRole('button', { name: 'View code' }).click()
    await expect(page.getByRole('region', { name: 'Component source', exact: true })).toBeVisible()
    await page.locator('summary', { hasText: 'Setup and dependencies' }).click()
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.evaluate(width => { document.documentElement.style.fontSize = width === 1440 ? '' : '200%' }, width)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const select = page.getByRole('button', { name: /Source file/ })
      await select.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('End')
      await page.keyboard.press('Enter')
      await expect(select).toBeFocused()
      await expect(page.getByRole('region', { name: 'Component source', exact: true })).toBeVisible()
      await expect(page.getByRole('region', { name: 'Copy with the local CLI' })).toBeVisible()
      if (test.info().project.name === 'chromium') await page.screenshot({ path: test.info().outputPath(`cli-setup-${mode}-${width}.png`), fullPage: true })
    }
  })
}
