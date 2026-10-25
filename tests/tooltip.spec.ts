import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const brand of ['bbb', 'studio']) {
  for (const mode of ['light', 'dark']) {
    test(`tooltips retain readable colors in ${brand} ${mode} regardless of stylesheet order`, async ({ page }) => {
      await page.addInitScript(appearance => {
        localStorage.setItem('bbb-gallery-appearance', JSON.stringify(appearance))
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.fontSize = innerWidth < 400 ? '200%' : ''
        })
      }, { brand, mode, density: 'comfortable' })
      const trigger = page.getByRole('button', { name: 'Add another item', exact: true })
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await page.goto('/gallery?item=tooltip')
        // Packed consumers can load the theme baseline after component styles.
        await page.addStyleTag({ content: '.bbb-theme { color: var(--bbb-color-text); }' })
        await page.getByRole('heading', { name: 'Tooltip', level: 1, exact: true }).hover()
        await trigger.hover()
        const tooltip = page.getByRole('tooltip', { name: 'Add another item', exact: true })
        await expect(tooltip).toBeVisible()
        await expect(tooltip).toHaveAttribute('data-bbb-brand', brand)
        await expect(tooltip).toHaveAttribute('data-bbb-mode', mode)
        const colors = await tooltip.evaluate(element => {
          const actual = getComputedStyle(element)
          const probe = document.createElement('span')
          probe.style.color = 'var(--bbb-color-surface)'
          probe.style.backgroundColor = 'var(--bbb-color-text)'
          element.append(probe)
          const expected = getComputedStyle(probe)
          const result = {
            foreground: actual.color, background: actual.backgroundColor,
            expectedForeground: expected.color, expectedBackground: expected.backgroundColor,
          }
          probe.remove()
          return result
        })
        expect(colors.foreground).toBe(colors.expectedForeground)
        expect(colors.background).toBe(colors.expectedBackground)
        expect((await new AxeBuilder({ page }).include('[role="tooltip"]').analyze()).violations).toEqual([])
        const bounds = (await tooltip.boundingBox())!
        expect(bounds.x).toBeGreaterThanOrEqual(0)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
        if (width === 1440) await page.screenshot({ path: test.info().outputPath('tooltip.png') })
        await page.keyboard.press('Escape')
        await expect(tooltip).toHaveCount(0)
        if (width === 1440) {
          await page.keyboard.press('Tab')
          await trigger.focus()
          await expect(tooltip).toBeVisible()
          await page.keyboard.press('Escape')
          await expect(trigger).toBeFocused()
        }
      }
    })
  }
}
