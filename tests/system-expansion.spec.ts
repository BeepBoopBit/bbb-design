import { galleryCounts } from './galleryCounts'
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function example(page: Page, query: string, name = query) {
  await page.getByRole('searchbox', { name: 'Search gallery' }).fill(query)
  return page.getByRole('article', { name, exact: true })
}
async function choose(page: Page, label: string, option: string) {
  const scope = label === 'Color mode' || label === 'Interface density' ? page.getByRole('dialog', { name: 'Gallery appearance' }) : page
  await scope.getByRole('button', { name: new RegExp(label) }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}
test.beforeEach(async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.all)
})

test('appearance persists, scoped brands reach portals, and CSS exports contain the active theme', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Appearance', exact: true }).click()
  await choose(page, 'Color mode', 'Dark')
  await choose(page, 'Interface density', 'Compact')
  await page.getByRole('button', { name: 'Close popover' }).click()
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', 'dark')
  const themes = await example(page, 'Themes', 'Themes')
  const studio = themes.getByRole('group', { name: 'Studio theme preview' })
  await studio.getByRole('button', { name: 'New idea' }).click()
  const dialog = page.getByRole('dialog', { name: 'Studio theme details' })
  await expect(dialog).toBeVisible()
  const boundary = page.locator('.bbb-modal-overlay')
  await expect(boundary).toHaveAttribute('data-bbb-brand', 'studio')
  await expect(boundary).toHaveAttribute('data-bbb-mode', 'dark')
  await expect(boundary).toHaveAttribute('data-bbb-density', 'compact')
  await page.keyboard.press('Escape')
  await expect(studio.getByRole('button', { name: 'New idea' })).toBeFocused()
  const downloadPromise = page.waitForEvent('download')
  await studio.getByRole('button', { name: 'Export Studio CSS' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('studio-theme.css')
  const stream = await download.createReadStream()
  let css = ''
  for await (const chunk of stream!) css += chunk.toString()
  expect(css).toContain('--bbb-color-accent:')
  expect(css).toContain('--bbb-button-radius:')
  await page.reload()
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', 'dark')
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute(
    'data-bbb-density',
    'compact',
  )
})

for (const brand of ['bbb', 'studio'])
  for (const mode of ['light', 'dark']) {
    test(`${brand} ${mode} passes live contrast and page accessibility checks`, async ({
      page,
    }) => {
      test.setTimeout(60000)
      await page.evaluate(
        ({ brand, mode }) =>
          localStorage.setItem(
            'bbb-gallery-appearance',
            JSON.stringify({ brand, mode, density: 'comfortable' }),
          ),
        { brand, mode },
      )
      await page.reload()
      await expect(page.locator('.system-contrast [data-pass]')).toHaveCount(8)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
    })
  }

test('number fields honor bounds and currency formatting with keyboard stepping', async ({
  page,
}) => {
  const card = await example(page, 'Number field')
  const seats = card.getByRole('textbox', { name: 'Seats', exact: true })
  await seats.focus()
  await page.keyboard.press('ArrowUp')
  await expect(seats).toHaveValue('4')
  await seats.fill('10')
  await page.keyboard.press('Tab')
  await expect(card.getByRole('button', { name: /Increase Seats/ })).toBeDisabled()
  await seats.focus()
  await page.keyboard.press('ArrowDown')
  await expect(seats).toHaveValue('9')
  await expect(card.getByRole('textbox', { name: 'Monthly budget', exact: true })).toHaveValue(
    '$250.00',
  )
  await choose(page, 'Number field example state', 'Disabled')
  await expect(seats).toBeDisabled()
})

test('date and time segments, calendar selection and range selection work by keyboard', async ({
  page,
}) => {
  const date = await example(page, 'Date picker')
  await date.getByRole('button', { name: 'Calendar Due date' }).click()
  await expect(page.locator('.bbb-calendar')).toBeVisible()
  await page.locator('.bbb-calendar__day').filter({ hasText: /^12$/ }).click()
  await expect(date.getByRole('status')).toContainText('-12.')
  await expect(page.locator('.bbb-floating-surface')).not.toBeVisible()
  await expect(date.getByRole('button', { name: 'Calendar Due date' })).toBeFocused()
  const day = date.getByRole('spinbutton', { name: 'day, Due date' })
  await day.focus()
  await page.keyboard.press('ArrowUp')
  await expect(day).toHaveAttribute('aria-valuenow', '13')
  const range = await example(page, 'Date range picker')
  await range.getByRole('button', { name: 'Calendar Travel dates' }).click()
  await page.locator('.bbb-calendar__day').filter({ hasText: /^10$/ }).click()
  await page.locator('.bbb-calendar__day').filter({ hasText: /^14$/ }).click()
  await expect(range.getByRole('status')).toContainText(/-10 to .*-14/)
  const time = await example(page, 'Time picker')
  const minute = time.getByRole('spinbutton', { name: /minute/ })
  await minute.focus()
  await page.keyboard.press('ArrowUp')
  await expect(minute).toHaveAttribute('aria-valuenow', '31')
})

test('multi-select keeps selections open, skips unavailable options and restores trigger focus', async ({
  page,
}) => {
  const card = await example(page, 'Multi-select')
  const trigger = card.getByRole('button', { name: /Project disciplines/ })
  await trigger.focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
  await page.getByRole('option', { name: /Engineering/ }).click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(page.getByRole('option', { name: /Operations/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(card.getByRole('status')).toHaveText('2 disciplines selected.')
})

test('tags reject duplicates and return focus after the final keyboard removal', async ({
  page,
}) => {
  const card = await example(page, 'Tag entry')
  const input = card.getByRole('textbox', { name: 'Keywords' })
  await input.fill('Thoughtful')
  await input.press('Enter')
  await expect(card.getByRole('button', { name: 'Remove Thoughtful' })).toBeVisible()
  await input.fill('thoughtful')
  await input.press('Enter')
  await expect(card.getByRole('status')).toHaveText('thoughtful is already added.')
  for (const tag of ['Craft', 'Clarity', 'Thoughtful']) {
    const remove = card.getByRole('button', { name: `Remove ${tag}` })
    await remove.focus()
    await page.keyboard.press('Enter')
  }
  await expect(input).toBeFocused()
  await expect(card.locator('input[type="hidden"]')).toHaveCount(0)
})

test('upload rejects unsupported files, reports failure, retries, completes and removes', async ({
  page,
}) => {
  const card = await example(page, 'File upload')
  const input = card.locator('input[type="file"]')
  await input.setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Notes'),
  })
  await expect(card.getByRole('alert')).toContainText('not supported')
  await card.getByRole('checkbox', { name: 'Simulate upload failure' }).focus()
  await page.keyboard.press('Space')
  await input.setInputFiles({
    name: 'brief.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 example'),
  })
  await expect(card.getByRole('button', { name: 'Retry' })).toBeVisible()
  await card.getByRole('checkbox', { name: 'Simulate upload failure' }).focus()
  await page.keyboard.press('Space')
  await card.getByRole('button', { name: 'Retry' }).click()
  await expect(card.getByRole('status')).toContainText('1 complete')
  await card.getByRole('button', { name: 'Remove brief.pdf' }).click()
  await expect(card.getByRole('button', { name: 'Choose files' })).toBeFocused()
  await expect(card.getByRole('status')).toContainText('0 files')
})

test('sliders clamp values and segmented controls skip disabled options', async ({ page }) => {
  const slider = await example(page, 'Slider', 'Slider')
  const volume = slider.getByRole('slider', { name: 'Volume', exact: true })
  await volume.focus()
  await page.keyboard.press('End')
  await expect(volume).toHaveValue('100')
  await page.keyboard.press('ArrowLeft')
  await expect(volume).toHaveValue('95')
  const range = page.getByRole('article', { name: 'Range slider', exact: true })
  const minimum = range.getByRole('slider', { name: /Minimum price/ })
  await minimum.focus()
  await page.keyboard.press('End')
  await expect(minimum).toHaveValue('80')
  const segments = await example(page, 'Segmented control')
  const unavailable = segments.locator('.bbb-filters__option').filter({ hasText: 'Year' })
  const resting = await unavailable.evaluate(element => getComputedStyle(element).backgroundColor)
  await unavailable.hover()
  await expect(unavailable).toHaveCSS('background-color', resting)
  const week = segments.getByRole('radio', { name: 'Week' })
  await week.focus()
  await page.keyboard.press('ArrowRight')
  await expect(segments.getByRole('radio', { name: 'Month' })).toBeChecked()
  await page.keyboard.press('ArrowRight')
  await expect(segments.getByRole('radio', { name: 'Day' })).toBeChecked()
})

test('authentication recovery validates code and completes the local reset', async ({ page }) => {
  const card = await example(page, 'Authentication')
  await card.getByRole('button', { name: 'Forgot password?' }).click()
  await card.getByRole('button', { name: 'Continue to verification' }).click()
  await expect(card.getByRole('textbox', { name: 'Account email' })).toBeFocused()
  await card.getByRole('textbox', { name: 'Account email' }).fill('alex@example.com')
  await card.getByRole('button', { name: 'Continue to verification' }).click()
  await card.getByRole('textbox', { name: 'Verification code' }).fill('111111')
  await card.getByRole('button', { name: 'Verify code' }).click()
  await expect(card.getByRole('alert')).toContainText('doesn’t match')
  await card.getByRole('textbox', { name: 'Verification code' }).fill('123456')
  await card.getByRole('button', { name: 'Verify code' }).click()
  await card.getByLabel('New password', { exact: true }).fill('example-password')
  await card.getByRole('button', { name: 'Save password' }).click()
  await expect(card.getByRole('heading', { name: 'You’re all set' })).toBeFocused()
})

test('onboarding preserves edits while moving backward and completes', async ({ page }) => {
  const card = await example(page, 'Onboarding')
  await card.getByRole('textbox', { name: 'Workspace name' }).fill('Little studio')
  await card.getByRole('button', { name: 'Continue' }).click()
  await card.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(card.getByRole('textbox', { name: 'Workspace name' })).toHaveValue('Little studio')
  await card.getByRole('button', { name: 'Continue' }).click()
  await card.getByRole('button', { name: 'Continue' }).click()
  await card.getByRole('button', { name: 'Create workspace' }).click()
  await expect(card.getByText('Little studio is ready')).toBeVisible()
})

test('multi-step errors focus a summary, preserved data survives a failed save and retry', async ({
  page,
}) => {
  const card = await example(page, 'Multi-step form')
  await card.getByRole('button', { name: 'Continue' }).click()
  await expect(card.getByRole('alert')).toBeFocused()
  await card.getByRole('link', { name: 'Enter your name.' }).click()
  await expect(card.getByRole('textbox', { name: 'Contact name' })).toBeFocused()
  await card.getByRole('textbox', { name: 'Contact name' }).fill('Alex')
  await card.getByRole('textbox', { name: 'Contact email' }).fill('alex@example.com')
  await card.getByRole('button', { name: 'Continue' }).click()
  await card.getByRole('button', { name: 'Continue' }).click()
  await card.getByRole('checkbox', { name: 'Simulate a save failure' }).focus()
  await page.keyboard.press('Space')
  await card.getByRole('button', { name: 'Save reservation' }).click()
  await expect(card.getByRole('alert')).toContainText('couldn’t save')
  await card.getByRole('checkbox', { name: 'Simulate a save failure' }).focus()
  await page.keyboard.press('Space')
  await card.getByRole('button', { name: 'Save reservation' }).click()
  await expect(card.getByRole('heading', { name: 'Reservation complete' })).toBeFocused()
})

test('unsaved changes can be kept, discarded or saved; recovery restores a useful focus', async ({
  page,
}) => {
  const card = await example(page, 'Unsaved changes')
  await card.getByRole('button', { name: 'Edit meeting' }).click()
  await card.getByRole('textbox', { name: 'Meeting title' }).fill('New meeting')
  await card.getByRole('button', { name: 'Cancel editing' }).click()
  const confirm = page.getByRole('alertdialog', { name: 'Discard your changes?' })
  await confirm.getByRole('button', { name: 'Keep editing' }).click()
  await expect(card.getByRole('textbox', { name: 'Meeting title' })).toHaveValue('New meeting')
  await card.getByRole('button', { name: 'Cancel editing' }).click()
  await confirm.getByRole('button', { name: 'Discard changes' }).click()
  await expect(card.getByRole('heading', { name: 'Design review' })).toBeVisible()
  await card.getByRole('button', { name: 'Edit meeting' }).click()
  await card.getByRole('textbox', { name: 'Meeting title' }).fill('Saved meeting')
  await card.getByRole('button', { name: 'Save meeting' }).click()
  await expect(card.getByRole('heading', { name: 'Saved meeting' })).toBeVisible()
  const recovery = await example(page, 'Page recovery')
  await recovery.getByRole('button', { name: 'Try again' }).click()
  await expect(recovery.getByRole('heading', { name: 'Welcome to your workspace' })).toBeFocused()
})

test('new examples reflow at 200% text and narrow widths with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const card = await example(page, 'Date picker')
    await card.getByRole('button', { name: 'Calendar Due date' }).click()
    const surface = page.locator('.bbb-floating-surface')
    await expect(surface).toBeVisible()
    const bounds = await surface.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    await page.keyboard.press('Escape')
    await page.getByRole('searchbox', { name: 'Search gallery' }).fill('')
  }
})

test('system mode responds to OS changes and token overrides reach a scoped dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Appearance', exact: true }).click()
  await choose(page, 'Color mode', 'System')
  await page.getByRole('button', { name: 'Close popover' }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('#root > [data-bbb-theme]')).toHaveAttribute('data-bbb-mode', 'light')
  const card = await example(page, 'Themes', 'Themes')
  await card.getByRole('switch', { name: 'Pill-shaped action buttons' }).check()
  const studio = card.getByRole('group', { name: 'Studio theme preview' })
  await studio.getByRole('button', { name: 'New idea' }).click()
  const overlay = page.locator('.bbb-modal-overlay')
  expect(await overlay.evaluate(element => getComputedStyle(element).getPropertyValue('--bbb-button-radius').trim())).toBe('999px')
})

test('new calendars and multi-select retain contrast and keyboard dismissal in dark mobile overlays', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ brand: 'studio', mode: 'dark' })))
  await page.reload()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const name of ['Date picker', 'Date range picker', 'Multi-select']) {
    const card = await example(page, name)
    const trigger = card.getByRole('button', { name: name === 'Multi-select' ? /Project disciplines/ : /^Calendar / })
    await trigger.focus(); await page.keyboard.press('Enter')
    const surface = page.locator('.bbb-floating-surface')
    await expect(surface).toBeVisible()
    await expect(surface).not.toHaveAttribute('data-entering')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused()
  }
})

test('changing recovery state cancels the previous simulated request', async ({ page }) => {
  const card = await example(page, 'Page recovery')
  await choose(page, 'Page state example', 'Loading')
  await choose(page, 'Page state example', 'No access')
  await expect(card.getByRole('heading', { name: 'This space is private' })).toBeVisible()
  // Let the canceled request's original deadline pass.
  await page.waitForTimeout(800)
  await expect(card.getByRole('heading', { name: 'This space is private' })).toBeVisible()
})
