import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function workspace(page: Page) {
  await page.goto('/gallery')
  await page.getByRole('searchbox', { name: 'Search gallery' }).fill('Brand workspace')
  return page.getByRole('article', { name: 'Brand workspace', exact: true })
}
async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp(label) }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await expect(page.locator('.bbb-select__popover')).toBeHidden()
}

test('brand contracts reject incomplete, misspelled, circular and unsafe values; exports retain references', async ({ page }) => {
  await page.goto('/gallery')
  const result = await page.evaluate(async () => {
    // Vite serves the same public helpers that the library exports.
    const { bbbBrand, studioBrand, createBrand } = await import('/src/foundations/brands.ts')
    const { validateBrand, serializeBrand, parseBrand, brandToCSS } = await import('/src/foundations/brandValidation.ts')
    const { exampleBrands } = await import('/src/pages/Gallery/branding/exampleBrands.ts')
    const { checkBrandContrast } = await import('/src/foundations/brandContrast.ts')
    const custom = createBrand({ id: 'consumer', name: 'Consumer', extends: studioBrand, tokens: { '--bbb-button-radius': 'var(--bbb-radius-full)' } })
    const cases = [
      { ...custom, schemaVersion: 2 },
      { ...custom, modes: { light: custom.modes.light } },
      { ...custom, modes: { ...custom.modes, dark: {} } },
      { ...custom, tokens: { '--bbb-colour-accent': 'red' } },
      { ...custom, tokens: { '--bbb-button-radius': 'var(--bbb-missing)' } },
      { ...custom, tokens: { '--bbb-radius-md': 'var(--bbb-radius-lg)', '--bbb-radius-lg': 'var(--bbb-radius-md)' } },
      { ...custom, tokens: { '--bbb-font-sans': 'serif; color: red' } },
      { ...custom, tokens: { '--bbb-button-radius': 'not-a-length' } },
      { ...custom, logo: { type: 'image', light: 'javascript:alert(1)', label: 'Unsafe' } },
    ]
    return {
      defaults: [bbbBrand, studioBrand, custom].map(brand => validateBrand(brand)),
      rejected: cases.map(brand => validateBrand(brand).length > 0),
      roundtrip: parseBrand(serializeBrand(custom)), css: brandToCSS(custom),
      contrast: exampleBrands.map(brand => ({ id: brand.id, checks: checkBrandContrast(brand) })),
    }
  })
  expect(result.defaults).toEqual([[], [], []])
  expect(result.rejected.every(Boolean)).toBe(true)
  expect(result.roundtrip.tokens['--bbb-button-radius']).toBe('var(--bbb-radius-full)')
  expect(result.css).toContain('[data-bbb-brand="consumer"][data-bbb-mode="dark"]')
  expect(result.css).toContain('--bbb-button-radius: var(--bbb-radius-full)')
  for (const brand of result.contrast) {
    expect(brand.checks).toHaveLength(38)
    expect(brand.checks.every(check => check.pass), brand.id).toBe(true)
  }
})

test('each brand reaches navigation, fields, tables, menus and modal logos in both modes', async ({ page }) => {
  const card = await workspace(page)
  for (const [name, id] of [['BBB', 'bbb'], ['Studio', 'studio'], ['Fieldnotes', 'fieldnotes']]) {
    await choose(page, 'Starter brand', name)
    await expect(card.getByRole('button', { name: 'Save preset', exact: true })).toBeEnabled()
    for (const mode of ['Light', 'Dark']) {
      await choose(page, 'Brand preview mode', mode)
      const sample = card.locator('.brand-sample')
      await expect(sample).toHaveAttribute('data-bbb-brand', id)
      await expect(sample).toHaveAttribute('data-bbb-mode', mode.toLowerCase())
      await expect(sample.getByRole('img', { name, exact: true })).toBeVisible()
      await sample.getByRole('button', { name: /Preview project access/ }).click()
      await expect(page.locator('.bbb-dropdown-surface')).toHaveAttribute('data-bbb-brand', id)
      await page.keyboard.press('Escape')
      await expect(page.locator('.bbb-select__popover')).toBeHidden()
      await sample.getByRole('button', { name: 'Preview dialog' }).click()
      const overlay = page.locator('.bbb-modal-overlay')
      await expect(overlay).toHaveAttribute('data-bbb-brand', id)
      await expect(overlay).toHaveAttribute('data-bbb-mode', mode.toLowerCase())
      await expect(overlay.getByRole('img', { name, exact: true })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(sample.getByRole('button', { name: 'Preview dialog' })).toBeFocused()
      await expect(overlay).toBeHidden()
    }
    await card.getByRole('link', { name: 'Projects', exact: true }).click()
    await expect(card.getByRole('table', { name: 'Brand preview projects' })).toBeVisible()
    await card.getByRole('link', { name: 'Overview', exact: true }).click()
  }
})

test('workspace blocks failing contrast, persists a preset, and round-trips JSON and CSS', async ({ page }) => {
  const card = await workspace(page)
  await card.getByRole('tab', { name: 'Tokens', exact: true }).click()
  await card.getByRole('textbox', { name: 'Token value' }).fill('white')
  await card.getByRole('button', { name: 'Apply token' }).click()
  await expect(card.getByRole('button', { name: 'Save preset', exact: true })).toBeDisabled()
  await expect(card.getByText(/contrast pairings? need attention/)).toBeVisible()
  await card.getByRole('textbox', { name: 'Token value' }).fill('var(--bbb-not-a-token)')
  await card.getByRole('button', { name: 'Apply token' }).click()
  await expect(card.getByRole('textbox', { name: 'Token value' })).toHaveAttribute('aria-invalid', 'true')
  await card.getByRole('button', { name: 'Reset changes' }).click()
  await card.getByRole('tab', { name: 'Identity', exact: true }).click()
  await card.getByRole('textbox', { name: 'Brand name', exact: true }).fill('My studio')
  await card.getByRole('textbox', { name: 'Brand ID', exact: true }).fill('my-studio')
  await card.getByRole('textbox', { name: 'Wordmark text', exact: true }).fill('my studio')
  await card.getByRole('button', { name: 'Save preset', exact: true }).click()
  await expect(card.getByText('My studio is saved on this device.')).toBeVisible()
  const jsonDownload = page.waitForEvent('download')
  await card.getByRole('button', { name: 'Export JSON' }).click()
  const download = await jsonDownload
  expect(download.suggestedFilename()).toBe('my-studio.brand.json')
  let json = ''
  for await (const chunk of (await download.createReadStream())!) json += chunk.toString()
  expect(JSON.parse(json).logo.text).toBe('my studio')
  const cssDownload = page.waitForEvent('download')
  await card.getByRole('button', { name: 'Export CSS' }).click()
  let css = ''
  for await (const chunk of (await (await cssDownload).createReadStream())!) css += chunk.toString()
  expect(css).toContain('[data-bbb-mode="light"]')
  expect(css).toContain('[data-bbb-mode="dark"]')
  await page.reload()
  await page.getByRole('searchbox', { name: 'Search gallery' }).fill('Brand workspace')
  await expect(card.getByRole('textbox', { name: 'Brand name', exact: true })).toHaveValue('My studio')
  await choose(page, 'Starter brand', 'Studio')
  await card.getByRole('tab', { name: 'Import', exact: true }).click()
  await card.getByRole('textbox', { name: 'Import brand JSON' }).fill('{"schemaVersion":99}')
  await card.getByRole('button', { name: 'Import preset', exact: true }).click()
  await expect(card.getByRole('textbox', { name: 'Import brand JSON' })).toHaveAttribute('aria-invalid', 'true')
  await expect(card.locator('.brand-sample')).toHaveAttribute('data-bbb-brand', 'studio')
  await card.getByRole('textbox', { name: 'Import brand JSON' }).fill(json)
  await card.getByRole('button', { name: 'Import preset', exact: true }).click()
  await expect(card.locator('.brand-sample')).toHaveAttribute('data-bbb-brand', 'my-studio')
})

test('nested modes resolve from the preset, explicit brands isolate overrides, and system mode stays live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/tests/fixtures/brands.html')
  const parent = page.getByTestId('parent')
  await expect(parent).toHaveAttribute('data-bbb-mode', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(parent).toHaveAttribute('data-bbb-mode', 'dark')
  const light = page.getByTestId('light-child')
  await expect(light).toHaveAttribute('data-bbb-mode', 'light')
  const accent = (selector: string) => page.locator(selector).evaluate(element => getComputedStyle(element).getPropertyValue('--bbb-color-accent').trim())
  expect(await accent('[data-testid="parent"]')).not.toBe(await accent('[data-testid="light-child"]'))
  await expect(light.getByRole('button', { name: 'Inherited shape' })).toHaveCSS('border-radius', '999px')
  await expect(page.getByTestId('other-brand').getByRole('button', { name: 'Independent shape' })).not.toHaveCSS('border-radius', '999px')
  await light.getByRole('button', { name: 'Open nested dialog' }).click()
  await expect(page.locator('.bbb-modal-overlay')).toHaveAttribute('data-bbb-mode', 'light')
  await expect(page.locator('.bbb-modal-overlay')).toHaveAttribute('data-bbb-brand', 'consumer')
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(parent).toHaveCSS('--bbb-duration-fast', '0ms')
})

test('image logos follow the color mode and exported CSS works on a static boundary', async ({ page }) => {
  await page.route('**/brand-test-*.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><text y="24">Example</text></svg>' }))
  const card = await workspace(page)
  const json = await page.evaluate(async () => {
    const { createBrand, studioBrand } = await import('/src/foundations/brands.ts')
    const { serializeBrand, brandToCSS } = await import('/src/foundations/brandValidation.ts')
    const brand = createBrand({ id: 'asset-brand', name: 'Asset brand', extends: studioBrand,
      logo: { type: 'image', light: '/brand-test-light.svg', dark: '/brand-test-dark.svg', label: 'Asset brand' } })
    const style = document.createElement('style'); style.textContent = brandToCSS(brand); document.head.append(style)
    const probe = document.createElement('div'); probe.className = 'bbb-theme'; probe.dataset.bbbTheme = ''; probe.dataset.bbbBrand = brand.id; probe.dataset.bbbMode = 'dark'; probe.id = 'exported-brand-check'; document.body.append(probe)
    return serializeBrand(brand)
  })
  await card.getByRole('tab', { name: 'Import', exact: true }).click()
  await card.getByRole('textbox', { name: 'Import brand JSON' }).fill(json)
  await card.getByRole('button', { name: 'Import preset', exact: true }).click()
  await expect(card.locator('.brand-sample img')).toHaveAttribute('src', '/brand-test-light.svg')
  await choose(page, 'Brand preview mode', 'Dark')
  await expect(card.locator('.brand-sample img')).toHaveAttribute('src', '/brand-test-dark.svg')
  const colors = await page.evaluate(() => ['#exported-brand-check', '.brand-sample'].map(selector => getComputedStyle(document.querySelector(selector)!).getPropertyValue('--bbb-color-accent').trim()))
  expect(colors[0]).toBe(colors[1])
})

for (const mode of ['Light', 'Dark']) test(`brand workspace stays accessible at narrow widths and enlarged text in ${mode}`, async ({ page }) => {
  const card = await workspace(page)
  await choose(page, 'Starter brand', 'Fieldnotes')
  await choose(page, 'Brand preview mode', mode)
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    const logo = card.locator('.brand-sample .bbb-brand-logo')
    await expect.poll(() => logo.evaluate(element => element.querySelector('.bbb-brand-logo__wordmark')!.getBoundingClientRect().right - element.getBoundingClientRect().right)).toBeLessThanOrEqual(1)
    await card.getByRole('link', { name: 'Projects', exact: true }).click()
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
    await card.getByRole('link', { name: 'Overview', exact: true }).click()
  }
})


test('brand workspace follows Gallery mode until a preview mode is selected', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  const card = await workspace(page)
  const sample = card.locator('.brand-sample')
  await expect(sample).toHaveAttribute('data-bbb-mode', 'dark')
  const darkBackground = await sample.evaluate(element => getComputedStyle(element).backgroundColor)
  const toggle = page.locator('.gallery-appearance-controls').getByRole('button', { name: /Color mode:/ })
  await toggle.click()
  await expect(sample).toHaveAttribute('data-bbb-mode', 'light')
  expect(await sample.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(darkBackground)
  await toggle.click()
  await expect(sample).toHaveAttribute('data-bbb-mode', 'dark')
  await choose(page, 'Brand preview mode', 'Light')
  await expect(sample).toHaveAttribute('data-bbb-mode', 'light')
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', 'dark')
})
