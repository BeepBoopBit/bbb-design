import { expect, test, type Locator } from '@playwright/test'

async function expectBalancedTrack(slider: Locator) {
  const geometry = await slider.evaluate(element => {
    const track = element.querySelector('.bbb-slider__track')!
    const fill = element.querySelector('.bbb-slider__fill')!.getBoundingClientRect()
    const thumbs = [...element.querySelectorAll('.bbb-slider__thumb')].map(thumb =>
      thumb.getBoundingClientRect(),
    )
    const trackBox = track.getBoundingClientRect()
    return {
      fillHeight: fill.height,
      railHeight: parseFloat(getComputedStyle(track, '::before').height),
      thumbHeight: thumbs[0].height,
      fillCenter: fill.y + fill.height / 2,
      thumbCenter: thumbs[0].y + thumbs[0].height / 2,
      start: fill.x,
      end: fill.right,
      expectedStart: thumbs.length > 1 ? thumbs[0].x + thumbs[0].width / 2 : trackBox.x,
      expectedEnd: thumbs.at(-1)!.x + thumbs.at(-1)!.width / 2,
    }
  })
  expect(geometry.fillHeight).toBe(geometry.railHeight)
  expect(geometry.thumbHeight).toBeGreaterThan(geometry.fillHeight)
  expect(geometry.fillCenter).toBeCloseTo(geometry.thumbCenter, 0)
  expect(geometry.start).toBeCloseTo(geometry.expectedStart, 0)
  expect(geometry.end).toBeCloseTo(geometry.expectedEnd, 0)
}

for (const width of [1440, 390, 320]) {
  test(`calendar columns stay compact at ${width}px, including enlarged text`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/gallery')
    for (const fontSize of ['100%', '200%']) {
      await page.evaluate(size => { document.documentElement.style.fontSize = size }, fontSize)
      for (const name of ['Date picker', 'Date range picker']) {
        await page.getByRole('searchbox', { name: 'Search gallery' }).fill(name)
        const card = page.getByRole('article', { name, exact: true })
        const trigger = card.getByRole('button', { name: /^Calendar / })
        // Focus alone does not wait for scrolling after the text-size change.
        await trigger.scrollIntoViewIfNeeded()
        await trigger.focus()
        await expect(trigger).toBeInViewport({ ratio: 1 })
        await page.keyboard.press('Enter')
        const popup = page.locator('.bbb-dropdown-surface')
        await expect(popup).toBeVisible()
        await expect(popup).not.toHaveAttribute('data-entering')
        const focusedDay = popup.locator('.bbb-calendar__day[data-focused]')
        await expect(focusedDay).toBeInViewport()
        const geometry = await popup.evaluate(element => {
          const box = element.getBoundingClientRect()
          const calendar = element.querySelector('.bbb-calendar')!
          const grid = calendar.querySelector('.bbb-calendar__grid')!.getBoundingClientRect()
          const day = calendar.querySelector('.bbb-calendar__day')!.getBoundingClientRect()
          const style = getComputedStyle(calendar)
          const border = parseFloat(getComputedStyle(element).borderLeftWidth)
          return {
            left: box.left, right: box.right, width: box.width,
            gridWidth: grid.width, dayWidth: day.width,
            naturalWidth: 7 * day.width + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 2 * border,
          }
        })
        expect(geometry.gridWidth).toBeCloseTo(7 * geometry.dayWidth, 0)
        expect(geometry.width).toBeLessThanOrEqual(geometry.naturalWidth)
        expect(geometry.left).toBeGreaterThanOrEqual(0)
        expect(geometry.right).toBeLessThanOrEqual(width)
        await page.keyboard.press('ArrowRight')
        await expect(focusedDay).toBeInViewport()
        await page.keyboard.press('Escape')
        await expect(trigger).toBeFocused()
        await expect(popup).toBeHidden()
      }
    }
  })
}

for (const width of [1440, 390, 320]) {
  test(`slider fills follow their handles when dragged or customized at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/gallery')
    await page.getByRole('searchbox', { name: 'Search gallery' }).fill('Slider')
    const card = page.getByRole('article', { name: 'Slider', exact: true })
    const slider = card.locator('.bbb-slider').first()
    const input = slider.getByRole('slider')
    await input.focus()
    await expectBalancedTrack(slider)
    await page.keyboard.press('Home')
    await expect(input).toHaveValue('0')
    await expectBalancedTrack(slider)
    await page.keyboard.press('End')
    await expect(input).toHaveValue('100')
    await expectBalancedTrack(slider)
    const track = (await slider.locator('.bbb-slider__track').boundingBox())!
    const thumb = (await slider.locator('.bbb-slider__thumb').boundingBox())!
    // Begin within the larger hit area, just outside the visible handle.
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y - 3)
    await page.mouse.down()
    await page.mouse.move(track.x + track.width / 2, track.y + track.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(input).toHaveValue('50')
    await page.mouse.move(track.x + track.width / 2, track.y + track.height / 2)
    await page.mouse.down()
    await page.mouse.move(track.x + track.width * 0.523, track.y + track.height / 2, { steps: 4 })
    await page.mouse.up()
    const pointerValue = Number(await input.inputValue())
    expect(pointerValue).toBeGreaterThan(51)
    expect(pointerValue).toBeLessThan(54)
    await input.press('ArrowRight')
    expect(Number(await input.inputValue())).toBeCloseTo(pointerValue + 5, 2)
    await input.press('ArrowLeft')
    expect(Number(await input.inputValue())).toBeCloseTo(pointerValue, 2)
    await input.press('Home')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('5')
    await input.press('ArrowDown')
    await expect(input).toHaveValue('0')

    await expectBalancedTrack(slider)
    await slider.evaluate(element => {
      const root = element as HTMLElement
      root.style.setProperty('--bbb-slider-track-height', '10px')
      root.style.setProperty('--bbb-slider-thumb-size', '32px')
    })
    await expect(slider.locator('.bbb-slider__fill')).toHaveCSS('height', '10px')
    await expect(slider.locator('.bbb-slider__thumb')).toHaveCSS('width', '32px')
    await expectBalancedTrack(slider)
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expectBalancedTrack(slider)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(card.getByRole('slider', { name: 'Managed volume' })).toBeDisabled()

    const range = page.getByRole('article', { name: 'Range slider', exact: true }).locator('.bbb-slider')
    await expectBalancedTrack(range)
    await range.getByRole('slider', { name: /Minimum price/ }).focus()
    await page.keyboard.press('ArrowRight')
    await expectBalancedTrack(range)
    await range.getByRole('slider', { name: /Maximum price/ }).focus()
    await page.keyboard.press('ArrowLeft')
    await expectBalancedTrack(range)
  })
}

for (const mode of ['light', 'dark']) {
  test(`slider lift settles and respects reduced motion in ${mode}`, async ({ page }) => {
    await page.goto('/gallery')
    await page.evaluate(mode => localStorage.setItem('bbb-gallery-appearance', JSON.stringify({ mode })), mode)
    await page.reload()
    await page.getByRole('searchbox', { name: 'Search gallery' }).fill('Slider')
    const slider = page.getByRole('article', { name: 'Slider', exact: true }).locator('.bbb-slider').first()
    const thumb = slider.locator('.bbb-slider__thumb')
    const restingShadow = await thumb.evaluate(element => getComputedStyle(element).boxShadow)
    await thumb.hover()
    await page.mouse.down()
    await expect(thumb).toHaveCSS('scale', '1.08')
    await expectBalancedTrack(slider)
    const dragShadow = await thumb.evaluate(element => {
      const probe = document.createElement('span')
      probe.style.boxShadow = 'var(--bbb-slider-shadow-drag)'
      element.append(probe)
      const shadow = getComputedStyle(probe).boxShadow
      probe.remove()
      return shadow
    })
    await expect(thumb).toHaveCSS('box-shadow', dragShadow)
    await page.mouse.up()
    await expect(thumb).toHaveCSS('scale', 'none')
    await page.mouse.move(0, 0)
    await expect(thumb).toHaveCSS('box-shadow', restingShadow)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await thumb.hover()
    await page.mouse.down()
    await expect(thumb).toHaveCSS('scale', 'none')
    await expect(thumb).toHaveCSS('transition-duration', '0s, 0s, 0s')
    await page.mouse.up()
  })
}
