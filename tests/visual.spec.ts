import { expect, test, type Page } from '@playwright/test'

async function example(page: Page, name: string) {
  await page.getByRole('searchbox', { name: 'Search gallery' }).fill(name)
  const card = page.getByRole('article', { name, exact: true })
  await card.scrollIntoViewIfNeeded()
  await page.getByRole('searchbox', { name: 'Search gallery' }).blur()
  await page.evaluate(() => document.fonts.ready)
  return card.locator('.gallery-card__preview')
}
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-22T12:00:00Z'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/gallery')
})

for (const [mode, width] of [['light', 1440], ['dark', 390]] as const) {
  test(`get started guide ${mode} ${width}`, async ({ page }) => {
    await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/getting-started')
    await expect(page.getByRole('heading', { name: 'Get started', exact: true })).toBeVisible()
    if (width === 390) {
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      await page.getByRole('heading', { name: 'Initialize BBB', exact: true }).evaluate(heading => heading.scrollIntoView())
    }
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`get-started-${mode}-${width}.png`, { stylePath: [] })
  })
}

for (const [brand, mode, density, width] of [
  ['bbb', 'light', 'comfortable', 1440], ['bbb', 'dark', 'compact', 390],
  ['studio', 'light', 'compact', 1440], ['studio', 'dark', 'comfortable', 390],
] as const) {
  test(`fields and sliders ${brand} ${mode} ${density} ${width}`, async ({ page }) => {
    await page.evaluate(preset => localStorage.setItem('bbb-gallery-appearance', JSON.stringify(preset)), { brand, mode, density })
    await page.reload()
    await page.setViewportSize({ width, height: 1000 })
    await expect(await example(page, 'Password field')).toHaveScreenshot(`${brand}-${mode}-password.png`)
    await expect(await example(page, 'Slider')).toHaveScreenshot(`${brand}-${mode}-slider.png`)
  })
}

test('compact calendar and table details', async ({ page }) => {
  await example(page, 'Date picker')
  await page.getByRole('button', { name: 'Calendar Due date' }).click()
  await expect(page.locator('.bbb-floating-surface')).toHaveScreenshot('calendar.png')
  await page.keyboard.press('Escape')
  const table = await example(page, 'Advanced table')
  await page.getByRole('button', { name: 'Expand Brand refresh' }).click()
  await expect(table).toHaveScreenshot('advanced-table.png')
})

test('compact command overlay', async ({ page }) => {
  await example(page, 'Command palette')
  await page.getByRole('button', { name: 'Open commands' }).click()
  await expect(page.locator('.bbb-dialog')).toHaveScreenshot('command-palette.png')
})

for (const mode of ['light', 'dark'] as const) {
  for (const variant of ['outlined', 'subtle', 'plain']) test(`field styles ${variant} ${mode}`, async ({ page }) => {
    await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
    await page.reload()
    const preview = await example(page, 'Field styles')
    await preview.getByRole('radiogroup', { name: 'Field style' }).getByText(variant, { exact: false }).click()
    await page.getByRole('searchbox', { name: 'Search gallery' }).focus()
    await page.getByRole('searchbox', { name: 'Search gallery' }).blur()
    await page.mouse.move(0, 0)
    await expect(preview).toHaveScreenshot(`field-styles-${variant}-${mode}.png`)
    await page.setViewportSize({ width: 390, height: 1000 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expect(preview).toHaveScreenshot(`field-styles-${variant}-${mode}-enlarged.png`)
  })
  test(`compact search field ${mode}`, async ({ page }) => {
    await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
    await page.reload()
    const preview = await example(page, 'Search field')
    await expect(preview).toHaveScreenshot(`search-field-${mode}.png`)
    await page.setViewportSize({ width: 390, height: 1000 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expect(preview).toHaveScreenshot(`search-field-${mode}-enlarged.png`)
  })
}

test('Arabic layout and enlarged field text', async ({ page }) => {
  const preview = await example(page, 'Internationalization')
  await page.getByRole('button', { name: /Preview language/ }).click()
  await page.getByRole('option', { name: 'العربية · مصر', exact: true }).click()
  await expect(preview).toHaveScreenshot('arabic.png')
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expect(await example(page, 'Password field')).toHaveScreenshot('password-enlarged.png')
})

test('brand workspace and consumer-defined identity', async ({ page }) => {
  const workspace = await example(page, 'Brand workspace')
  await expect(workspace.getByRole('button', { name: 'Save preset', exact: true })).toBeEnabled()
  await expect(workspace).toHaveScreenshot('brand-workspace.png')
  await page.getByRole('button', { name: /Starter brand/ }).click()
  await page.getByRole('option', { name: 'Fieldnotes', exact: true }).click()
  await expect(workspace.locator('.brand-sample')).toHaveScreenshot('fieldnotes-light.png')
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.getByRole('button', { name: /Brand preview mode/ }).click()
  await page.getByRole('option', { name: 'Dark', exact: true }).click()
  await expect(workspace.locator('.brand-sample')).toHaveScreenshot('fieldnotes-dark-mobile.png')
})

for (const mode of ['light', 'dark'] as const) test(`theme switcher ${mode}`, async ({ page }) => {
  await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
  await page.reload()
  await expect(await example(page, 'Theme switcher')).toHaveScreenshot(`theme-switcher-${mode}.png`)
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expect(await example(page, 'Theme switcher')).toHaveScreenshot(`theme-switcher-${mode}-enlarged.png`)
})

for (const mode of ['light', 'dark'] as const) test(`product utilities ${mode}`, async ({ page }) => {
  await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode, brand: 'bbb', density: 'comfortable' })), mode)
  await page.reload()
  await expect(await example(page, 'Split pane')).toHaveScreenshot(`split-pane-${mode}.png`)
  await example(page, 'Notification center')
  await page.getByRole('article', { name: 'Notification center' }).getByRole('button', { name: 'Notifications, 1 unread' }).click()
  await expect(page.locator('.bbb-popover')).toHaveScreenshot(`notification-center-${mode}.png`)
  await page.keyboard.press('Escape')
})
