import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/icons.html')
})

test('Lucide icons retain named controls, shared tokens, and RTL behavior', async ({ page }) => {
  const canonical = page.getByRole('button', { name: 'Close', exact: true }).locator('svg')
  const legacy = page.getByRole('button', { name: 'Close with legacy name' }).locator('svg')
  expect(await canonical.innerHTML()).toEqual(await legacy.innerHTML())
  for (const icon of [canonical, legacy, page.getByTestId('rtl-canonical').locator('svg')]) {
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    await expect(icon).toHaveAttribute('focusable', 'false')
    await expect(icon).toHaveCSS('width', '24px')
    await expect(icon).toHaveCSS('height', '24px')
    await expect(icon).toHaveCSS('stroke-width', '3px')
  }
  await expect(page.getByTestId('rtl-canonical').locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)')
  await expect(page.getByTestId('rtl-alias').locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)')
  await expect(page.getByTestId('rtl-neutral').locator('svg')).toHaveCSS('transform', 'none')
  await page.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close with legacy name' })).toBeFocused()
})

test('nested artwork overrides replace Lucide paths through either icon name', async ({ page }) => {
  for (const id of ['parent-canonical', 'parent-alias']) {
    const icon = page.getByTestId(id).locator('svg')
    await expect(icon.locator('circle')).toHaveCount(1)
    await expect(icon.locator('path')).toHaveCount(0)
  }
  for (const id of ['child-canonical', 'child-alias']) {
    const icon = page.getByTestId(id).locator('svg')
    await expect(icon.locator('path')).toHaveCount(1)
    await expect(icon.locator('path')).toHaveAttribute('d', 'M4 12h16')
    await expect(icon.locator('circle')).toHaveCount(0)
  }
  for (const id of ['inherited-canonical', 'inherited-alias']) {
    const icon = page.getByTestId(id).locator('svg')
    await expect(icon.locator('rect')).toHaveCount(1)
    await expect(icon.locator('path')).toHaveCount(0)
  }
})
