import { galleryCounts } from './galleryCounts'
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp(label) }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await expect(page.getByRole('listbox')).not.toBeVisible()
}

async function expectIntactCategoryLabels(page: Page) {
  const labels = await page
    .getByRole('group', { name: 'Filter gallery', exact: true })
    .getByRole('button')
    .evaluateAll(buttons =>
      buttons.map(button => {
        const text = [...button.childNodes].find(
          node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        )
        if (!text) return { label: '', intact: false }
        const range = document.createRange()
        range.selectNodeContents(text)
        const rects = [...range.getClientRects()]
        const bounds = button.getBoundingClientRect()
        return {
          label: text.textContent,
          intact:
            rects.length === 1 && rects[0].left >= bounds.left && rects[0].right <= bounds.right,
        }
      }),
    )
  expect(labels.filter(label => !label.intact)).toEqual([])
}

// User-visible contracts: selection, dismissal, focus, validation, and feedback.
test.beforeEach(async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.all)
})

test('catalog search, filters, empty state, and reset focus', async ({ page }) => {
  const filters = page.getByRole('group', { name: 'Filter gallery', exact: true })
  await filters.getByRole('button', { name: `Components ${galleryCounts.components}` }).click()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.components)
  await filters.getByRole('button', { name: `Patterns ${galleryCounts.patterns}` }).click()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.patterns)
  await expect(page.getByRole('article', { name: 'Profile form', exact: true })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Settings', exact: true })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Collection', exact: true })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Workspace shell', exact: true })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: `Components ${galleryCounts.components}` })
    .click()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.components)
  const search = page.getByRole('searchbox', { name: 'Search gallery' })
  await search.fill('dropdown')
  await expect(page.getByRole('article')).toHaveCount(4)
  await search.fill('nothing-matches-this')
  await expect(page.getByText('No matches this time.')).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.all)
  await expect(search).toBeFocused()
  await search.fill('  INDeterminate  ')
  await expect(page.getByRole('article')).toHaveCount(2)
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(search).toBeFocused()
})

test('styled select, mixed checkbox, radio arrows, and textarea validation', async ({ page }) => {
  await choose(page, 'Priority', 'High')
  await expect(page.getByText('Priority set to high.')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Select', exact: true }).getByRole('button', { name: /Access level/ })).toBeDisabled()
  const all = page.getByRole('checkbox', { name: /All updates/ })
  await expect(all).toBeChecked({ indeterminate: true })
  await all.focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('checkbox', { name: 'Weekly summary', exact: true })).toBeChecked()
  await page.keyboard.press('Space')
  await expect(page.getByRole('checkbox', { name: 'Email updates', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Managed by your team' })).toBeDisabled()
  await page.getByRole('radio', { name: /^Daily/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: /^Weekly/ })).toBeChecked()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: /^Daily/ })).toBeChecked()
  const note = page.getByRole('textbox', { name: 'A short note' })
  await note.focus()
  await page.keyboard.press('Tab')
  await expect(note).toHaveAttribute('aria-invalid', 'true')
  await note.fill('A thoughtful detail.')
  await expect(note).not.toHaveAttribute('aria-invalid', 'true')
  await page.getByText('Disable editing', { exact: true }).click()
  await expect(note).toBeDisabled()
})

test('combobox filters, selects by keyboard, handles empty and disabled states', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Assign to' })
  await input.scrollIntoViewIfNeeded()
  await input.click()
  await input.fill('jam')
  await expect(page.getByRole('option', { name: 'Jamie Chen' })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Assigned to Jamie Chen.')).toBeVisible()
  await expect(input).toBeFocused()
  await input.fill('no such person')
  await expect(page.getByText('No matching options.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).not.toBeVisible()
  await page.getByRole('button', { name: 'Show options Assign to' }).click()
  await expect(page.getByRole('option', { name: 'Sam Rivera' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await page.keyboard.press('Escape')
  await choose(page, 'Combobox example state', 'Disabled')
  await expect(input).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Show options Assign to' })).toBeDisabled()
  await choose(page, 'Combobox example state', 'Error')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await choose(page, 'Combobox example state', 'Loading')
  await page.getByRole('button', { name: 'Show options Assign to' }).click()
  await expect(page.getByText('Loading options…')).toBeVisible()
})

test('combobox releases background content when tabbing in either direction', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Assign to' })
  await input.scrollIntoViewIfNeeded()
  await input.click()
  for (const direction of ['Tab', 'Shift+Tab']) {
    await input.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.keyboard.press(direction)
    await expect(page.getByRole('listbox')).not.toBeVisible()
    await expect(
      direction === 'Tab'
        ? page.getByRole('button', { name: /Combobox example state/ })
        : page.getByRole('article', { name: 'Combobox', exact: true }).getByRole('radio', { name: 'Filled', exact: true }),
    ).toBeFocused()
    expect(
      await page.evaluate(() => document.activeElement?.closest('[aria-hidden="true"], [inert]')),
    ).toBeNull()
    await expect(page.getByRole('searchbox', { name: 'Search gallery' })).toBeAttached()
  }
})

test('action menu supports typeahead, disabled actions, Escape, and focus return', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Document actions' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu', { name: 'Document actions' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Share · unavailable' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await page.keyboard.press('d')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Duplicate selected.')).toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu', { name: 'Document actions' })).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('dialog traps focus, submits, cancels, and restores the trigger', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Edit details' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Your details' })
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Your details' }).getByRole('textbox', { name: 'Display name' })).toBeFocused()
  await dialog.getByRole('textbox', { name: 'Display name' }).fill('Robin Lee')
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
  }
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(page.getByText('Display name: Robin Lee')).toBeVisible()
  await trigger.click()
  await dialog.getByRole('textbox', { name: 'Display name' }).fill('Discard this')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.getByText('Display name: Robin Lee')).toBeVisible()
})

test('confirmation starts on cancel and changes only the example on confirm', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Remove draft', exact: true })
  await trigger.click()
  const dialog = page.getByRole('alertdialog', { name: 'Remove this draft?' })
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByText('Your draft is ready.')).toBeVisible()
  await trigger.click()
  await dialog.getByRole('button', { name: 'Remove draft' }).click()
  await expect(page.getByText('Draft removed.')).toBeVisible()
  await page.getByRole('button', { name: 'Restore draft' }).click()
  await expect(trigger).toBeEnabled()
})

test('popover interaction and tooltip dismissal preserve focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Preferences', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Quick preferences' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('switch').uncheck()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.getByText('Updates are off.')).toBeVisible()
  const add = page.getByRole('button', { name: 'Add another item' })
  await page.keyboard.press('Tab')
  await add.focus()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).not.toBeVisible()
  await expect(add).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 item added.')).toBeVisible()
})

test('tabs skip disabled items and accordions expose one panel at a time', async ({ page }) => {
  await page.getByRole('tab', { name: 'Overview' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Activity' })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeFocused()
  const sharing = page.getByRole('button', { name: 'Sharing and access' })
  await sharing.focus()
  await page.keyboard.press('Space')
  await expect(sharing).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: 'The details' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(page.getByRole('button', { name: 'Advanced · unavailable' })).toBeDisabled()
})

test('feedback, progress, skeleton, and notification dismissal work', async ({ page }) => {
  await choose(page, 'Message tone', 'Error')
  await expect(page.getByText('We couldn’t save that')).toBeVisible()
  const progress = page.getByRole('progressbar', { name: 'Upload progress' })
  await expect(progress).toHaveAttribute('aria-valuenow', '40')
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Advance', exact: true }).click()
  await expect(progress).toHaveAttribute('aria-valuenow', '100')
  await expect(page.getByRole('button', { name: 'Advance', exact: true })).toBeDisabled()
  await expect(page.getByRole('progressbar', { name: 'Preparing your files' })).not.toHaveAttribute(
    'aria-valuenow',
  )
  await page.getByRole('button', { name: 'Reveal content' }).click()
  await expect(page.getByText('Profile loaded.')).toBeVisible()
  const notify = page.getByRole('button', { name: 'Show notification' })
  await notify.click()
  const region = page
    .getByRole('region', { name: 'Notifications', exact: true })
    .filter({ has: page.getByRole('button', { name: 'Dismiss notification' }) })
  await expect(region.getByText('Changes saved')).toBeVisible()
  await page.keyboard.press('F6')
  await expect.poll(() => region.evaluate(el => el.contains(document.activeElement))).toBe(true)
  await region.getByRole('button', { name: 'Dismiss notification' }).click()
  await expect(region).not.toBeVisible()
  await expect(notify).toBeFocused()
})

test('wide and narrow views have no overflow or automated accessibility violations', async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await expectIntactCategoryLabels(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 1440 || width === 390) {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    }
  }
})

test('open overlays meet accessibility checks and fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const triggerName of [
    'Normal Priority',
    'Document actions',
    'Show options Assign to',
    'Edit details',
    'Preferences',
  ]) {
    const trigger = page.getByRole('button', { name: triggerName, exact: true })
    await trigger.scrollIntoViewIfNeeded()
    // Anchored comboboxes dismiss on scroll. Finish scrolling before opening.
    await page.evaluate(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.bbb-floating-surface, .bbb-modal').first()).toBeVisible()
    await expect(page.locator('.bbb-floating-surface, .bbb-modal').first()).not.toHaveAttribute(
      'data-entering',
    )
    const scan = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    if (triggerName === 'Show options Assign to') {
      // React Aria temporarily hides the background from virtual-cursor navigation.
      // Tab/Shift+Tab dismissal and background restoration are checked above.
      // https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives
      scan.disableRules(['aria-hidden-focus'])
    }
    const result = await scan.analyze()
    expect(result.violations).toEqual([])
    const surface = page.locator('.bbb-floating-surface, .bbb-modal').first()
    const rect = await surface.boundingBox()
    expect(rect).not.toBeNull()
    expect(rect!.x).toBeGreaterThanOrEqual(0)
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(390)
    await page.keyboard.press('Escape')
    await expect(surface).not.toBeVisible()
    await expect(
      triggerName === 'Show options Assign to'
        ? page.getByRole('combobox', { name: 'Assign to' })
        : trigger,
    ).toBeFocused()
  }
})

test('new controls share brand tokens and respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() =>
    document.querySelector<HTMLElement>('#root > [data-bbb-theme]')!.style.setProperty('--bbb-brand-ember', '#934627'),
  )
  await expect
    .poll(() =>
      page
        .locator('.bbb-checkbox[data-selected] .bbb-checkbox__box')
        .first()
        .evaluate(el => getComputedStyle(el).backgroundColor),
    )
    .toBe('rgb(147, 70, 39)')
  expect(
    await page
      .locator('.color-preview__swatch')
      .last()
      .evaluate(el => getComputedStyle(el).backgroundColor),
  ).toBe('rgb(147, 70, 39)')
  expect(
    await page.locator('.bbb-button__spinner').first().evaluate(el => getComputedStyle(el).animationName),
  ).toBe('none')
  expect(
    await page
      .locator('.bbb-accordion__trigger .bbb-icon')
      .first()
      .evaluate(el => getComputedStyle(el).transitionDuration),
  ).toBe('0s')
  const loadingButton = page.getByRole('button', { name: 'Loading', exact: true })
  await expect(loadingButton).toBeDisabled()
  await expect(loadingButton).toHaveAttribute('aria-busy', 'true')
})

test('select supports keyboard choices, disabled options, focus return, and form values', async ({
  page,
}) => {
  const priority = page.getByRole('button', { name: /Priority/ })
  await priority.focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('option', { name: 'Urgent · unavailable' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).not.toBeVisible()
  await expect(priority).toBeFocused()
  await expect(priority).toHaveText('High')
  expect(
    await page
      .getByRole('form', { name: 'Priority example' })
      .evaluate(form => new FormData(form as HTMLFormElement).get('priority')),
  ).toBe('high')
  await priority.click()
  await page.keyboard.press('l')
  await page.keyboard.press('Enter')
  await expect(priority).toHaveText('Low')
})

test('field focus uses one edge and preserves validation color without moving the layout', async ({
  page,
}) => {
  const field = page.getByRole('textbox', { name: 'Project name', exact: true })
  await field.scrollIntoViewIfNeeded()
  const control = page.locator('.bbb-field__surface').filter({ has: field })
  const initial = await control.boundingBox()
  await field.fill('')
  await page.keyboard.press('Tab')
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await field.focus()
  await field.hover()
  await expect
    .poll(() => control.evaluate(el => getComputedStyle(el).borderColor))
    .toBe('rgb(180, 64, 68)')
  const style = await control.evaluate(el => ({
    outline: getComputedStyle(el).outlineStyle,
    shadow: getComputedStyle(el).boxShadow,
  }))
  expect(style.outline).toBe('none')
  expect(style.shadow).toContain('inset')
  await expect
    .poll(() => control.evaluate(el => getComputedStyle(el).boxShadow))
    .toContain('rgb(180, 64, 68)')
  const focused = await control.boundingBox()
  expect(focused?.width).toBe(initial?.width)
  expect(focused?.height).toBe(initial?.height)
  await field.fill('A considered detail')
  await expect
    .poll(() => control.evaluate(el => getComputedStyle(el).borderColor))
    .toBe('rgb(50, 116, 118)')
  const textarea = page.getByRole('textbox', { name: 'A short note' })
  await textarea.focus()
  await page.keyboard.press('Tab')
  await textarea.focus()
  await expect
    .poll(() => textarea.locator('..').evaluate(el => getComputedStyle(el).borderColor))
    .toBe('rgb(180, 64, 68)')
  expect(await textarea.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none')
})

test('tabs animate between positions, handle rapid changes, and respect reduced motion', async ({
  page,
}) => {
  const tabs = page.getByRole('article', { name: 'Tabs', exact: true }).locator('.bbb-tabs')
  const activity = page.getByRole('tab', { name: 'Activity' })
  await page.getByRole('tab', { name: 'Overview' }).focus()
  // Observe the transition before the key press: a busy runner can finish the
  // animation before a later getAnimations() call reaches the browser.
  await tabs.evaluate(el => {
    el.addEventListener('transitionrun', function observe(event) {
      if (!(event instanceof TransitionEvent) || event.propertyName !== 'translate' ||
          !(event.target instanceof HTMLElement) || !event.target.matches('.bbb-tabs__indicator')) return
      el.setAttribute('data-observed-indicator-motion', 'true')
      el.removeEventListener('transitionrun', observe)
    })
  })
  await page.keyboard.press('ArrowRight')
  await expect(tabs).toHaveAttribute('data-observed-indicator-motion', 'true')
  await tabs.evaluate(async el => {
    await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished))
  })
  const activeRect = await activity.boundingBox()
  const indicatorRect = await activity.locator('.bbb-tabs__indicator').boundingBox()
  expect(indicatorRect?.x).toBeCloseTo(activeRect!.x, 0)
  expect(indicatorRect?.width).toBeCloseTo(activeRect!.width, 0)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await expect(activity).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Activity' })).toBeVisible()
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).not.toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeVisible()
  expect(
    await tabs.evaluate(el =>
      el
        .getAnimations({ subtree: true })
        .some(animation => Number(animation.effect?.getTiming().duration) > 0),
    ),
  ).toBe(false)
})

test('complete form validates, saves selections, and discards later edits', async ({ page }) => {
  const form = page.getByRole('form', { name: 'Personal details' })
  const name = form.getByRole('textbox', { name: 'Full name' })
  const email = form.getByRole('textbox', { name: 'Email address' })
  await name.fill('')
  await email.fill('not-an-email')
  await form.getByRole('button', { name: 'Save profile' }).click()
  await expect(name).toBeFocused()
  await expect(name).toHaveAccessibleDescription('Enter your full name.')
  await expect(email).toHaveAccessibleDescription('Use an email like alex@example.com.')
  await name.fill('Robin Chen')
  await form.getByRole('button', { name: 'Save profile' }).click()
  await expect(email).toBeFocused()
  await email.fill('robin@example.com')
  const team = form.getByRole('combobox', { name: 'Team' })
  await team.fill('eng')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await choose(page, 'Region', 'Europe')
  await form.getByRole('switch').uncheck()
  await form.getByRole('button', { name: 'Save profile' }).click()
  await expect(form.getByRole('status')).toHaveText('Profile saved. Your details are up to date.')
  await expect(form.locator('.bbb-avatar')).toHaveText('RC')
  await name.fill('Unsaved name')
  await choose(page, 'Region', 'Americas')
  await form.getByRole('switch').check()
  await form.getByRole('button', { name: 'Discard changes' }).click()
  await expect(name).toHaveValue('Robin Chen')
  await expect(email).toHaveValue('robin@example.com')
  await expect(team).toHaveValue('Engineering')
  await expect(form.getByRole('button', { name: /Region/ })).toHaveText('Europe')
  await expect(form.getByRole('switch')).not.toBeChecked()
  await expect(form.getByRole('status')).toHaveText('Unsaved changes discarded.')
})

test('field padding activates controls and dropdowns align with the whole surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const form = page.getByRole('form', { name: 'Personal details' })
  const name = form.getByRole('textbox', { name: 'Full name' })
  const nameSurface = form
    .locator('.bbb-field__surface')
    .filter({ has: page.getByRole('textbox', { name: 'Full name' }) })
  await nameSurface.click({ position: { x: 4, y: 4 } })
  await expect(name).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(form.getByRole('textbox', { name: 'Email address' })).toBeFocused()
  const region = form.getByRole('button', { name: /Region/ })
  const regionSurface = form
    .locator('.bbb-field__surface')
    .filter({ has: page.getByRole('button', { name: /Region/ }) })
  await regionSurface.click({ position: { x: 4, y: 4 } })
  await expect(page.getByRole('listbox')).toBeVisible()
  const fieldBounds = await regionSurface.boundingBox()
  const popupBounds = await page.locator('.bbb-select__popover').boundingBox()
  expect(popupBounds!.x).toBeCloseTo(fieldBounds!.x, 0)
  expect(popupBounds!.width).toBeCloseTo(fieldBounds!.width, 0)
  await page.keyboard.press('Escape')
  await expect(region).toBeFocused()
  const disabled = page.getByRole('article', { name: 'Select', exact: true }).getByRole('button', { name: /Access level/ })
  await page
    .getByRole('article', { name: 'Select', exact: true })
    .locator('.bbb-field__surface')
    .filter({ has: page.getByRole('button', { name: /Access level/ }) })
    .click({ position: { x: 4, y: 4 } })
  await expect(page.getByRole('listbox')).not.toBeVisible()
  await expect(disabled).not.toBeFocused()
})

test('filled fields preserve contrast preferences and scale without label overlap', async ({
  page,
}) => {
  await page.getByRole('searchbox', { name: 'Search gallery' }).fill('profile form')
  const form = page.getByRole('form', { name: 'Personal details' })
  const name = form.getByRole('textbox', { name: 'Full name' })
  const surface = form
    .locator('.bbb-field__surface')
    .filter({ has: page.getByRole('textbox', { name: 'Full name' }) })
  await page.emulateMedia({ contrast: 'more', reducedMotion: 'reduce' })
  expect(await surface.evaluate(el => getComputedStyle(el).borderColor)).toBe('rgb(139, 136, 129)')
  await name.focus()
  expect(await surface.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid')
  await page.emulateMedia({ forcedColors: 'active' })
  expect(await surface.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid')
  await page.emulateMedia({ forcedColors: 'none', contrast: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  const labelBounds = await surface.locator('label').boundingBox()
  const inputBounds = await name.boundingBox()
  expect(labelBounds!.y + labelBounds!.height).toBeLessThanOrEqual(inputBounds!.y)
  expect(await form.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})

test('avatars recover from failed images and member overflow restores focus', async ({ page }) => {
  const preview = page.getByRole('article', { name: 'Avatar', exact: true })
  const avatar = preview.getByRole('img', { name: 'Alex Morgan' })
  const upload = preview.getByLabel('Avatar image')
  await upload.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid image'),
  })
  await expect(avatar.locator('img')).toHaveCount(0)
  await expect(avatar).toHaveText('AM')
  await upload.setInputFiles({
    name: 'portrait.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" /></svg>',
    ),
  })
  await expect
    .poll(() => avatar.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBe(48)
  await preview.getByRole('button', { name: 'Remove photo' }).click()
  await expect(preview.getByRole('button', { name: 'Choose photo' })).toBeFocused()
  await expect(avatar.locator('img')).toHaveCount(0)
  const overflow = page
    .getByRole('article', { name: 'Avatar group', exact: true })
    .getByRole('button', { name: 'Show all 5 members' })
  await overflow.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Project collaborators' })
  await expect(dialog.getByRole('listitem')).toHaveCount(5)
  await expect(dialog.getByText('Taylor Park')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(overflow).toBeFocused()
})

test('list rows activate by keyboard and empty states recover with useful focus', async ({
  page,
}) => {
  const rows = page.getByRole('article', { name: 'List row', exact: true })
  await rows.getByRole('button', { name: /Open activity/ }).focus()
  await page.keyboard.press('Space')
  await expect(rows.getByRole('status')).toHaveText('Activity opened in this preview.')
  await expect(rows.getByRole('button', { name: /Archived workspace/ })).toBeDisabled()
  await rows.getByRole('link', { name: 'Jump to row details' }).click()
  await expect(rows.getByRole('status')).toBeFocused()
  const empty = page.getByRole('article', { name: 'Empty state', exact: true })
  await empty.getByRole('button', { name: 'Show error state' }).click()
  await expect(empty.getByRole('button', { name: 'Try again' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(empty.getByRole('heading', { name: 'Your first collection' })).toBeVisible()
  await expect(empty.getByRole('button', { name: 'Reset collection' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(empty.getByRole('button', { name: 'Create collection' })).toBeFocused()
})

test('settings pattern composes preferences and local invitations', async ({ page }) => {
  await page
    .getByRole('group', { name: 'Filter gallery', exact: true })
    .getByRole('button', { name: `Patterns ${galleryCounts.patterns}` })
    .click()
  const settings = page.getByRole('group', { name: 'Workspace settings example' })
  await settings.getByRole('switch', { name: 'Weekly digest' }).check()
  await expect(settings.getByRole('status')).toHaveText('Weekly digest enabled.')
  await settings.getByRole('switch', { name: 'Workspace activity' }).uncheck()
  await expect(settings.getByRole('status')).toHaveText('Workspace activity disabled.')
  const invite = settings.getByRole('button', { name: 'Invite teammate' })
  await invite.click()
  const dialog = page.getByRole('dialog', { name: 'Invite a teammate' })
  await expect(dialog.getByRole('textbox', { name: 'Teammate name' })).toBeFocused()
  await dialog.getByRole('textbox', { name: 'Teammate name' }).fill('Taylor Park')
  await dialog.getByRole('textbox', { name: 'Teammate email' }).fill('invalid')
  await dialog.getByRole('button', { name: 'Add invitation' }).click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Teammate email' }).fill('taylor@example.com')
  await dialog.getByRole('button', { name: 'Add invitation' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(invite).toBeFocused()
  await expect(settings.getByText('No pending invitations')).not.toBeVisible()
  await expect(settings.getByText('Taylor Park', { exact: true })).toBeVisible()
  await expect(settings.getByText('taylor@example.com')).toBeVisible()
  await expect(settings.getByRole('status')).toHaveText(
    'Invitation for Taylor Park added to this preview.',
  )
  await invite.click()
  await dialog.getByRole('textbox', { name: 'Teammate name' }).fill('Discard this')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(settings.getByText('Discard this')).not.toBeVisible()
  await expect(invite).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(await settings.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})

test('links navigate natively and breadcrumbs identify the current location', async ({ page }) => {
  const links = page.getByRole('article', { name: 'Link', exact: true })
  const external = links.getByRole('link', { name: /Visit example.com/ })
  await expect(external).toHaveAttribute('target', '_blank')
  await expect(external).toHaveAttribute('rel', /noopener/)
  await expect(external).toHaveAccessibleName(/opens in a new tab/)
  await links.getByRole('link', { name: 'Read the details' }).focus()
  await page.keyboard.press('Enter')
  await expect(
    links.getByText('A link takes you somewhere. A button performs an action.'),
  ).toBeFocused()
  const crumbs = page.getByRole('navigation', { name: 'Example location' })
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Projects')
  await expect(crumbs.getByRole('link')).toHaveCount(1)
  await crumbs.getByRole('link', { name: 'Workspace' }).click()
  await expect(
    page.getByText('Workspace overview. Your current location stays clear.'),
  ).toBeFocused()
})

test('filter chips restore focus after removal and preserve fixed filters', async ({ page }) => {
  const preview = page.getByRole('article', { name: 'Filter chips', exact: true })
  const filters = preview.getByRole('group', { name: 'Example filters' })
  await filters.getByRole('button', { name: 'Remove Owner: Alex' }).focus()
  await page.keyboard.press('Enter')
  await expect(filters.getByRole('button', { name: 'Remove Status: Active' })).toBeFocused()
  await page.keyboard.press('Space')
  const restore = preview.getByRole('button', { name: 'Restore filters' })
  await expect(restore).toBeFocused()
  await expect(preview.getByRole('button', { name: 'Remove Workspace: Design' })).toBeDisabled()
  await restore.click()
  await filters.getByRole('button', { name: 'Clear filters' }).click()
  await expect(restore).toBeFocused()
  await expect(preview.getByRole('status')).toHaveText('Filters cleared. Workspace stays fixed.')
})

test('pagination handles page boundaries, empty results, and narrow layouts', async ({ page }) => {
  const preview = page.getByRole('article', { name: 'Pagination', exact: true })
  const pagination = preview.getByRole('navigation', { name: 'Example pages' })
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  await pagination.getByRole('button', { name: 'Next page' }).click()
  await expect(pagination.getByText('11–20 of 128 items')).toBeVisible()
  await pagination.getByRole('button', { name: 'Page 13', exact: true }).click()
  await expect(pagination.getByRole('button', { name: 'Page 13', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled()
  await expect(pagination.getByText('121–128 of 128 items')).toBeVisible()
  await preview.getByRole('button', { name: 'Clear results' }).click()
  await expect(pagination.getByText('0 items')).toBeVisible()
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled()
  await preview.getByRole('button', { name: 'Restore results' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await pagination.getByRole('button', { name: 'Next page' }).click()
  await expect(pagination.getByText('Page 2 of 13', { exact: true })).toBeVisible()
  expect(await pagination.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})

test('table sorting and mixed selection preserve row identity and skip unavailable rows', async ({
  page,
}) => {
  const preview = page.getByRole('article', { name: 'Table', exact: true })
  const table = preview.getByRole('table', { name: 'Example members' })
  const selectAll = table.getByRole('checkbox', { name: 'Select all rows on this page' })
  await table.getByRole('checkbox', { name: 'Select Alex Morgan', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(selectAll).toBeChecked({ indeterminate: true })
  await table.getByRole('button', { name: 'Name, sort descending' }).click()
  await expect(table.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
    'aria-sort',
    'descending',
  )
  await expect(table.getByRole('rowheader').first()).toHaveText('Robin Lee')
  await expect(
    table.getByRole('checkbox', { name: 'Select Alex Morgan', exact: true }),
  ).toBeChecked()
  await selectAll.focus()
  await page.keyboard.press('Space')
  await expect(
    table.getByRole('checkbox', { name: 'Select Jamie Chen', exact: true }),
  ).toBeChecked()
  await expect(
    table.getByRole('checkbox', { name: 'Select Robin Lee', exact: true }),
  ).not.toBeChecked()
  await expect(
    table.getByRole('checkbox', { name: 'Select Robin Lee', exact: true }),
  ).toBeDisabled()
  await expect(selectAll).toBeChecked()
  await table.getByRole('button', { name: 'View Alex Morgan' }).click()
  await expect(
    preview.getByText('2 members selected. Alex Morgan has the owner role in this preview.'),
  ).toBeVisible()
  await choose(page, 'Table example state', 'Loading')
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(selectAll).toBeDisabled()
  await expect(table.getByRole('button', { name: /Name, sort/ })).toBeDisabled()
  await choose(page, 'Table example state', 'Empty')
  await expect(preview.getByText('No items to display')).toBeVisible()
  await expect(table).not.toBeVisible()
})

test('collection selection spans pages and bulk archive can be restored per row', async ({
  page,
}) => {
  const collection = page.getByRole('group', { name: 'Project collection example' })
  const table = collection.getByRole('table', { name: 'Projects', exact: true })
  const pagination = collection.getByRole('navigation', { name: 'Project pages' })
  await table.getByRole('checkbox', { name: 'Select Brand refresh', exact: true }).focus()
  await page.keyboard.press('Space')
  await pagination.getByRole('button', { name: 'Next page' }).click()
  await table.getByRole('checkbox', { name: 'Select Mobile experience', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(collection.getByText('2 selected across pages')).toBeVisible()
  await pagination.getByRole('button', { name: 'Previous page' }).click()
  await expect(
    table.getByRole('checkbox', { name: 'Select Brand refresh', exact: true }),
  ).toBeChecked()
  await collection.getByRole('button', { name: 'Archive selected' }).click()
  await expect(collection.getByRole('searchbox', { name: 'Search projects' })).toBeFocused()
  await expect(collection.getByText('2 projects archived in this preview.')).toBeVisible()
  await expect(
    table.getByRole('checkbox', { name: 'Select Brand refresh', exact: true }),
  ).toBeDisabled()
  await table.getByRole('button', { name: 'Actions for Brand refresh' }).click()
  await page.getByRole('menuitem', { name: 'Restore project' }).click()
  await expect(
    table.getByRole('checkbox', { name: 'Select Brand refresh', exact: true }),
  ).toBeEnabled()
  await expect(collection.getByText('Brand refresh restored in this preview.')).toBeVisible()
})

test('collection filters, empty recovery, detail dialogs, row removal, and loading stay usable', async ({
  page,
}) => {
  const collection = page.getByRole('group', { name: 'Project collection example' })
  const search = collection.getByRole('searchbox', { name: 'Search projects' })
  const table = collection.getByRole('table', { name: 'Projects', exact: true })
  await choose(page, 'Project status', 'Active')
  await choose(page, 'Project owner', 'Alex Morgan')
  await search.fill('brand')
  await expect(collection.getByText('1–1 of 1 item')).toBeVisible()
  await collection.getByRole('button', { name: 'Remove Status: Active' }).click()
  await expect(collection.getByRole('button', { name: 'Remove Owner: Alex Morgan' })).toBeFocused()
  await collection.getByRole('button', { name: 'Clear filters' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await search.fill('no matching project')
  await expect(collection.getByRole('heading', { name: 'No projects found' })).toBeVisible()
  await collection.getByRole('button', { name: 'Clear project filters' }).click()
  await expect(search).toBeFocused()
  const detailTrigger = table.getByRole('button', { name: 'Brand refresh', exact: true })
  await detailTrigger.click()
  const details = page.getByRole('dialog', { name: 'Brand refresh', exact: true })
  await expect(details.getByText('Alex Morgan', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(detailTrigger).toBeFocused()
  await choose(page, 'Project status', 'Active')
  await table.getByRole('button', { name: 'Actions for Brand refresh' }).click()
  await page.getByRole('menuitem', { name: 'Archive project' }).click()
  await expect(detailTrigger).not.toBeVisible()
  await expect(search).toBeFocused()
  await collection.getByRole('button', { name: 'Refresh projects' }).click()
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(search).toBeDisabled()
  await expect(table).not.toHaveAttribute('aria-busy', 'true')
  await expect(search).toBeEnabled()
  await expect(collection.getByText('Projects are up to date.')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  const scrollArea = collection.getByRole('region', { name: 'Projects table area' })
  await scrollArea.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => scrollArea.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await collection.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await search.fill('no matching project')
    expect(await collection.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await collection.getByRole('button', { name: 'Clear project filters' }).click()
    await expect(search).toBeFocused()
  }
})

test('sidebar links expose current location, skip unavailable destinations, and preserve focus', async ({
  page,
}) => {
  const preview = page.getByRole('article', { name: 'Sidebar navigation', exact: true })
  const nav = preview.getByRole('navigation', { name: 'Example workspace' })
  await expect(nav.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  const projects = nav.getByRole('link', { name: 'Projects 3' })
  await expect(projects).toHaveAttribute('href', /^#/)
  await projects.focus()
  await page.keyboard.press('Enter')
  await expect(projects).toHaveAttribute('aria-current', 'page')
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  await expect(preview.getByRole('status')).toHaveText('Three projects, ready to explore.')
  await expect(preview.getByRole('status')).toBeFocused()
  const members = nav.getByRole('link', { name: 'Members 4' })
  await members.focus()
  await page.keyboard.press('Tab')
  await expect(nav.getByRole('link', { name: 'Billing Soon' })).not.toBeFocused()
  await expect(nav.getByRole('link', { name: 'Billing Soon' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await members.focus()
  await page.keyboard.press('Enter')
  await expect(members).toHaveAttribute('aria-current', 'page')
})

test('page headers compose navigation, actions, and visible feedback', async ({ page }) => {
  const preview = page.getByRole('article', { name: 'Page header', exact: true })
  await preview.getByRole('link', { name: 'Workspace', exact: true }).click()
  await expect(preview.getByRole('heading', { name: 'Projects', exact: true })).toBeFocused()
  await preview.getByRole('button', { name: 'Follow updates', exact: true }).click()
  const follow = preview.getByRole('button', { name: 'Following updates', exact: true })
  await expect(follow).toHaveAttribute('aria-pressed', 'true')
  await expect(preview.getByRole('status')).toHaveText('Project updates followed in this preview.')
  await follow.click()
  await expect(
    preview.getByRole('button', { name: 'Follow updates', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
})

test('sheets trap focus, validate, save, cancel, and dismiss back to their trigger', async ({
  page,
}) => {
  const preview = page.getByRole('article', { name: 'Sheet', exact: true })
  const trigger = preview.getByRole('button', { name: 'Edit collection' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Collection details', exact: true })
  const name = dialog.getByRole('textbox', { name: 'Collection name' })
  await expect(name).toBeFocused()
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
  }
  await name.fill(' ')
  await dialog.getByRole('button', { name: 'Save collection' }).click()
  await expect(dialog).toBeVisible()
  await expect(name).toBeFocused()
  await name.fill('Launch notes')
  await dialog.getByRole('switch', { name: 'Show in favorites' }).uncheck()
  await dialog.getByRole('button', { name: 'Save collection' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(preview.getByRole('status')).toHaveText('Launch notes saved in this preview.')
  await trigger.click()
  await expect(name).toHaveValue('Launch notes')
  await expect(dialog.getByRole('switch', { name: 'Show in favorites' })).not.toBeChecked()
  await name.fill('Discard me')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(name).toHaveValue('Launch notes')
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.mouse.click(10, 500)
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('workspace navigation and editing work on desktop and in the mobile sheet', async ({
  page,
}) => {
  const workspace = page.getByRole('group', { name: 'Workspace shell example' })
  const navigation = workspace.getByRole('navigation', { name: 'Studio desktop navigation' })
  await navigation.getByRole('link', { name: 'Projects 3' }).click()
  await expect(workspace.getByRole('heading', { name: 'Projects', exact: true })).toBeFocused()
  await expect(workspace.getByRole('heading', { name: 'Project directory' })).toBeVisible()
  await navigation.getByRole('link', { name: 'Members 4' }).click()
  await expect(workspace.getByRole('heading', { name: 'Members', exact: true })).toBeFocused()
  await expect(workspace.getByRole('heading', { name: 'People in your workspace' })).toBeVisible()
  const details = workspace.getByRole('button', { name: 'Workspace details', exact: true })
  await details.click()
  const editor = page.getByRole('dialog', { name: 'Workspace details', exact: true })
  const name = editor.getByRole('textbox', { name: 'Workspace display name' })
  await expect(name).toBeFocused()
  await name.fill(' ')
  await editor.getByRole('button', { name: 'Save workspace' }).click()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toBeFocused()
  await name.fill('North Studio')
  await editor.getByRole('switch', { name: 'Send a weekly workspace summary' }).uncheck()
  await editor.getByRole('button', { name: 'Save workspace' }).click()
  await expect(details).toBeFocused()
  await expect(workspace.getByRole('status')).toHaveText(
    'North Studio workspace saved in this preview.',
  )
  await details.click()
  await expect(name).toHaveValue('North Studio')
  await expect(
    editor.getByRole('switch', { name: 'Send a weekly workspace summary' }),
  ).not.toBeChecked()
  await name.fill('Discard workspace')
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(details).toBeFocused()
  await expect(workspace.getByRole('button', { name: 'North Studio, account and workspaces', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(navigation).not.toBeVisible()
  const menu = workspace.getByRole('button', { name: 'Open workspace navigation' })
  await menu.click()
  const drawer = page.getByRole('dialog', { name: 'Workspace navigation', exact: true })
  await expect(drawer.getByRole('link', { name: 'Members 4' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await drawer.getByRole('link', { name: 'Projects 3' }).click()
  await expect(drawer).not.toBeVisible()
  await expect(workspace.getByRole('heading', { name: 'Projects', exact: true })).toBeFocused()
  await menu.click()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await menu.click()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.keyboard.press('Escape')
  await expect(workspace.getByRole('heading', { name: 'Projects', exact: true })).toBeFocused()
  await workspace.getByRole('button', { name: 'Details for Brand refresh' }).click()
  const project = page.getByRole('dialog', { name: 'Brand refresh', exact: true })
  await expect(project.getByText('Alex Morgan', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(workspace.getByRole('button', { name: 'Details for Brand refresh' })).toBeFocused()
})

test('gallery reflows at enlarged text and sheets keep actions reachable on small screens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await expectIntactCategoryLabels(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(
      await page
        .locator('.gallery-card__preview')
        .evaluateAll(elements =>
          elements.filter(el => el.scrollWidth > el.clientWidth).map(el => el.className),
        ),
    ).toEqual([])
    const workspace = page.getByRole('group', { name: 'Workspace shell example' })
    expect(await workspace.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  }
  const trigger = page
    .getByRole('article', { name: 'Sheet', exact: true })
    .getByRole('button', { name: 'Edit collection' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Collection details', exact: true })
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  expect(
    await page.locator('.bbb-modal--sheet').evaluate(el => getComputedStyle(el).animationDuration),
  ).toBe('0s')
  const save = dialog.getByRole('button', { name: 'Save collection' })
  const bounds = await save.boundingBox()
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844)
  await dialog.getByRole('textbox', { name: 'Collection name' }).fill('Larger text')
  await save.click()
  await expect(trigger).toBeFocused()
})

test('workspace icon rail stays navigable and keeps its state through mobile navigation', async ({
  page,
}) => {
  const workspace = page.getByRole('group', { name: 'Workspace shell example' })
  const navigation = workspace.getByRole('navigation', { name: 'Studio desktop navigation' })
  const collapse = workspace.getByRole('button', { name: 'Collapse sidebar', exact: true })
  const expand = workspace.getByRole('button', { name: 'Expand sidebar', exact: true })
  const content = workspace.locator('.workspace-shell__main')
  await navigation.getByRole('link', { name: 'Projects 3' }).click()
  const expandedWidth = (await content.boundingBox())!.width
  await expect(collapse).toHaveAttribute('aria-expanded', 'true')
  const controlledId = await collapse.getAttribute('aria-controls')
  expect(controlledId).toBeTruthy()
  await collapse.focus()
  await page.keyboard.press('Enter')
  await expect(expand).toBeFocused()
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  await expect(expand).toHaveAttribute('aria-controls', controlledId!)
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Projects 3' })).toHaveAttribute('aria-current', 'page')
  await expect.poll(async () => (await content.boundingBox())!.width).toBeGreaterThan(expandedWidth)
  await page.keyboard.press('Tab')
  await expect(workspace.getByRole('button', { name: 'Studio, account and workspaces', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  const overview = navigation.getByRole('link', { name: 'Overview', exact: true })
  await expect(overview).toBeFocused()
  await expect(page.getByRole('tooltip', { name: 'Overview', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).not.toBeVisible()
  await page.keyboard.press('Enter')
  await expect(workspace.getByRole('heading', { name: 'Overview', exact: true })).toBeFocused()
  await navigation.getByRole('link', { name: 'Projects 3' }).focus()
  await page.keyboard.press('Enter')
  await expect(workspace.getByRole('heading', { name: 'Projects', exact: true })).toBeFocused()
  const disabled = navigation.getByRole('link', { name: 'Billing Soon', exact: true })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await workspace.getByRole('heading', { name: 'Projects', exact: true }).hover()
  await disabled.hover()
  await expect(page.getByRole('tooltip', { name: 'Billing · Soon · Unavailable', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await navigation.getByRole('link', { name: 'Members 4' }).focus()
  await page.keyboard.press('Tab')
  await expect(workspace.getByRole('button', { name: 'Help & resources', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(workspace.getByRole('link', { name: 'Studio', exact: true })).toBeFocused()
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(scan.violations).toEqual([])
  await expand.focus()
  await page.keyboard.press('Space')
  await expect(collapse).toBeFocused()
  await expect(navigation.getByRole('link', { name: 'Projects 3' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect
    .poll(async () => Math.abs((await content.boundingBox())!.width - expandedWidth))
    .toBeLessThan(1)
  await collapse.click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(expand).not.toBeVisible()
  const menu = workspace.getByRole('button', { name: 'Open workspace navigation' })
  await menu.click()
  const sheet = page.getByRole('dialog', { name: 'Workspace navigation', exact: true })
  await sheet.getByRole('link', { name: 'Members 4' }).click()
  await expect(sheet).not.toBeVisible()
  await expect(workspace.getByRole('heading', { name: 'Members', exact: true })).toBeFocused()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(expand).toBeVisible()
  await expect(navigation).toBeVisible()
  await expand.click()
  await expect(collapse).toBeFocused()
  await expect(navigation.getByRole('link', { name: 'Members 4' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await workspace.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s')
  await collapse.click()
  await expect(expand).toBeFocused()
  await expand.click()
  await expect(collapse).toBeFocused()
})

test('Gallery icon rail preserves navigation, category sync, search, and mobile focus return', async ({
  page,
}) => {
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  const topbar = page.locator('.gallery-topbar')
  const collapse = topbar.getByRole('button', { name: 'Collapse sidebar', exact: true })
  const expand = topbar.getByRole('button', { name: 'Expand sidebar', exact: true })
  const main = page.getByRole('main')
  const filters = page.getByRole('group', { name: 'Filter gallery', exact: true })
  const search = page.getByRole('searchbox', { name: 'Search gallery' })

  await navigation.getByRole('link', { name: `Foundations ${galleryCounts.foundations}` }).focus()
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.foundations)
  await expect(filters.getByRole('button', { name: `Foundations ${galleryCounts.foundations}` })).toHaveAttribute('aria-pressed', 'true')
  await search.fill('BBB palette')
  await expect(page.getByRole('article')).toHaveCount(1)
  const workspace = page.locator('.gallery-workspace')
  const previousWidth = (await workspace.boundingBox())!.width
  await collapse.focus()
  await page.keyboard.press('Space')
  await expect(expand).toBeFocused()
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  await expect(navigation).toBeVisible()
  await expect.poll(async () => (await workspace.boundingBox())!.width).toBeGreaterThan(previousWidth)
  await page.keyboard.press('Tab')
  await expect(topbar.getByRole('button', { name: /Color mode:/ })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(topbar.getByRole('button', { name: 'Appearance', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(navigation.getByRole('link', { name: 'Get started', exact: true })).toBeFocused()
  await expect(page.getByRole('tooltip', { name: 'Get started', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Tab')
  await expect(navigation.getByRole('link', { name: 'Gallery', exact: true })).toBeFocused()
  await expect(page.getByRole('tooltip', { name: 'Gallery', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  await navigation.getByRole('link', { name: `Foundations ${galleryCounts.foundations}` }).click()
  await expect(main).toBeFocused()
  await expect(search).toHaveValue('BBB palette')
  await expect(page.getByRole('article')).toHaveCount(1)
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(scan.violations).toEqual([])
  await expand.focus()
  await page.keyboard.press('Enter')
  await expect(collapse).toBeFocused()
  await expect(navigation.getByRole('link', { name: `Foundations ${galleryCounts.foundations}` })).toHaveAttribute('aria-current', 'page')
  await expect.poll(async () => Math.abs((await workspace.boundingBox())!.width - previousWidth)).toBeLessThan(1)
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await filters.getByRole('button', { name: `Components ${galleryCounts.components}`, exact: true }).click()
  await expect(navigation.getByRole('link', { name: `Components ${galleryCounts.components}` })).toHaveAttribute('aria-current', 'page')

  await collapse.click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(expand).not.toBeVisible()
  const menu = topbar.getByRole('button', { name: 'Open gallery navigation' })
  await menu.click()
  const sheet = page.getByRole('dialog', { name: 'Gallery navigation', exact: true })
  await expect(sheet.getByRole('link', { name: `Components ${galleryCounts.components}` })).toHaveAttribute('aria-current', 'page')
  await page.keyboard.press('Escape')
  await expect(sheet).not.toBeVisible()
  await expect(menu).toBeFocused()
  await menu.click()
  await sheet.getByRole('link', { name: `Patterns ${galleryCounts.patterns}` }).click()
  await expect(sheet).not.toBeVisible()
  await expect(main).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(galleryCounts.patterns)
  await menu.click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await sheet.getByRole('button', { name: 'Close sheet' }).click()
  await expect(main).toBeFocused()
  await expect(expand).toBeVisible()
  await expand.click()
  await expect(collapse).toBeFocused()
  await expect(navigation.getByRole('link', { name: `Patterns ${galleryCounts.patterns}` })).toHaveAttribute('aria-current', 'page')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await workspace.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s')
})

test('Gallery navigation fits narrow screens with enlarged text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    const menu = page.getByRole('button', { name: 'Open gallery navigation' })
    await menu.click()
    const sheet = page.getByRole('dialog', { name: 'Gallery navigation', exact: true })
    expect(await sheet.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    const wrappedLabels = await sheet.locator('.bbb-sidebar-navigation__label').evaluateAll(labels =>
      labels.filter(label => {
        const range = document.createRange()
        range.selectNodeContents(label)
        return range.getClientRects().length !== 1
      }).map(label => label.textContent),
    )
    expect(wrappedLabels).toEqual([])
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
    await sheet.getByRole('link', { name: `Patterns ${galleryCounts.patterns}` }).click()
    await expect(sheet).not.toBeVisible()
    await expect(page.getByRole('main')).toBeFocused()
    await expect(page.getByRole('article')).toHaveCount(galleryCounts.patterns)
    await expectIntactCategoryLabels(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('sidebar expansion keeps icons and text geometry stable through reveals and reversals', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // Slow the shared timing, then inspect actual CSS transitions at exact frames.
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('#root > [data-bbb-theme]')!.style.setProperty('--bbb-duration-medium', '1000ms')
    document.querySelector<HTMLElement>('#root > [data-bbb-theme]')!.style.setProperty('--bbb-duration-fast', '600ms')
  })
  for (const selector of ['.gallery-sidebar', '.workspace-shell:not(:has([data-dropdown])) .workspace-shell__sidebar', '.workspace-shell:has([data-dropdown]) .workspace-shell__sidebar']) {
    const sidebar = page.locator(selector)
    const toggle = selector === '.gallery-sidebar' ? page.locator('.gallery-topbar .bbb-sidebar-toggle') : sidebar.locator('xpath=ancestor::*[contains(@class, "workspace-shell") and not(contains(@class, "__"))]').locator('.bbb-sidebar-toggle')
    const originalLink = await sidebar.getByRole('link').filter({ has: page.locator('svg') }).first().elementHandle()
    const inspectFrame = (progress: number) => sidebar.evaluate((element, fraction) => {
      const layout = element.closest('.workspace-shell') ?? element
      const adjacent = element.matches('.gallery-sidebar') ? element.nextElementSibling : null
      const animations = new Set([
        ...element.getAnimations({ subtree: true }),
        ...layout.getAnimations(),
        ...(adjacent?.getAnimations() ?? []),
      ])
      for (const animation of animations) {
        animation.pause()
        animation.currentTime = fraction * 1000
        if (fraction === 1) animation.finish()
      }
      const bounds = element.getBoundingClientRect()
      return {
        width: bounds.width,
        icons: [...element.querySelectorAll('.bbb-sidebar-navigation__item > svg')].filter(icon => icon.getClientRects().length).map(icon => {
          const rect = icon.getBoundingClientRect()
          return { x: rect.x - bounds.x, y: rect.y - bounds.y }
        }),
        labels: [...element.querySelectorAll('.bbb-sidebar-navigation__label')].map(label => {
          const range = document.createRange()
          range.selectNodeContents(label)
          const rect = label.getBoundingClientRect()
          return { width: rect.width, height: rect.height, lines: range.getClientRects().length }
        }),
        opacity: Number(getComputedStyle(element.querySelector('.bbb-sidebar-navigation__copy')!).opacity),
      }
    }, progress)
    const expanded = await inspectFrame(1)
    await toggle.focus()
    await page.keyboard.press('Enter')
    const compact = await inspectFrame(1)
    expect(compact.width).toBeLessThan(expanded.width)
    expect(compact.icons).toEqual(expanded.icons)
    expect(compact.labels).toEqual(expanded.labels)
    expect(compact.opacity).toBe(0)

    await page.keyboard.press('Enter')
    const opening = await inspectFrame(0.2)
    expect(opening.width).toBeGreaterThan(compact.width)
    expect(opening.width).toBeLessThan(expanded.width)
    expect(opening.opacity).toBe(0)
    const revealing = await inspectFrame(0.6)
    expect(revealing.opacity).toBeGreaterThan(0)
    expect(revealing.opacity).toBeLessThan(1)
    expect(revealing.icons).toEqual(expanded.icons)
    expect(revealing.labels).toEqual(expanded.labels)
    expect(await originalLink!.evaluate(link => link.isConnected)).toBe(true)

    // Reverse before the reveal finishes, then reopen without losing focus.
    await page.keyboard.press('Enter')
    await inspectFrame(0.1)
    await page.keyboard.press('Enter')
    const reopened = await inspectFrame(1)
    expect(reopened.width).toBe(expanded.width)
    expect(reopened.icons).toEqual(expanded.icons)
    expect(reopened.labels).toEqual(expanded.labels)
    expect(reopened.opacity).toBe(1)
    await expect(toggle).toBeFocused()
  }
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('#root > [data-bbb-theme]')!.style.removeProperty('--bbb-duration-medium')
    document.querySelector<HTMLElement>('#root > [data-bbb-theme]')!.style.removeProperty('--bbb-duration-fast')
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const sidebar = page.locator('.gallery-sidebar')
  await page.locator('.gallery-topbar').getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar.locator('.bbb-sidebar-navigation__copy').first()).toHaveCSS('opacity', '0')
  await page.locator('.gallery-topbar').getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(sidebar.locator('.bbb-sidebar-navigation__copy').first()).toHaveCSS('opacity', '1')
})
