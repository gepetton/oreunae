import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { markets, formatMarketPrice, currencyUnit, marketCurrency } from '../src/lib/market-data'

test.use({ hasTouch: true })

for (const locale of ['ko', 'en'] as const) for (const theme of ['light', 'dark']) {
  test(`reference detail fits full prices, themed charts and readable content: ${locale} ${theme}`, async ({ page }) => {
    await page.addInitScript(({ locale, theme }) => {
      localStorage.setItem('oreunae:locale', locale)
      localStorage.setItem('oreunae:theme', theme)
    }, { locale, theme })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      for (const market of markets) {
        await page.goto(`/markets/${market.id}`)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(market.name[locale])
        await expect(page.locator('.detail-market-pair')).toHaveText(`${market.symbol}/USDC`)
        await expect(page.getByTestId('quote-price')).toHaveText(`${formatMarketPrice(market, market.price, locale)} ${currencyUnit(marketCurrency(market), locale)}`)
        await expect(page.locator('.detail-stats > div')).toHaveCount(4)
        await expect(page.locator('.detail-back')).toBeVisible()
        await expect(page.locator('.bottom-nav, .sidebar')).toHaveCount(0)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        const issues = await page.locator('[data-testid="quote-price"], .detail-stats dd, .detail-related-card strong').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent))
        expect(issues, `${market.symbol} ${width}px`).toEqual([])
        const bounds = (await page.getByTestId('quote-price').boundingBox())!
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      }
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/markets/demo-nvda-usdc')
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(accessibility.violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(', ')}`)).toEqual([])
    expect(errors).toEqual([])
  })
}

test('detail keeps essential content, price sheet and related navigation with in-app back', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/markets')
  await page.getByRole('tab', { name: 'US', exact: true }).tap()
  await page.locator('.market-card[data-market="demo-nvda-usdc"] a').tap()
  await expect(page.locator('.detail-section-nav, .detail-news-row, .detail-discussion-card, .save-full')).toHaveCount(0)
  await expect(page.locator('.detail-related-card')).toHaveCount(3)
  await page.locator('.detail-price-guide').tap()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('NVDA / USDC')
  await expect(dialog).toContainText('1 USDC = 0.9998 USD')
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(accessibility.violations.map(item => item.id)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  await expect(page.locator('.detail-price-guide')).toBeFocused()
  await page.locator('.detail-back').tap()
  await expect(page).toHaveURL(/tab=overseas/)
  await page.getByRole('tab', { name: 'US', exact: true }).tap()
  await page.locator('.market-card[data-market="demo-nvda-usdc"] a').tap()
  await page.getByRole('button', { name: '1Y', exact: true }).tap()
  await page.locator('.detail-related-card').filter({ hasText: 'Apple' }).tap()
  await expect(page).toHaveURL(/demo-aapl-usdc$/)
  await expect(page.getByRole('button', { name: '1D', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('detail share supports copying or selecting its current URL and missing prices stay hidden', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  // Non-secure LAN access on mobile may have no Clipboard API: retain manual selection.
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }))
  await page.goto('/markets/demo-smsn-usdc')
  await page.getByRole('button', { name: 'Share asset', exact: true }).tap()
  await expect(page.getByLabel('Page link', { exact: true })).toHaveValue(/\/markets\/demo-smsn-usdc$/)
  await page.getByRole('button', { name: 'Copy link', exact: true }).tap()
  const input = page.getByLabel('Page link', { exact: true })
  await expect(input).toBeFocused()
  expect(await input.evaluate(node => (node as HTMLInputElement).selectionEnd)).toBe((await input.inputValue()).length)
  await expect(page.getByRole('status')).toHaveText('You can also select and copy the link above.')
  await page.keyboard.press('Escape')
  for (const state of ['error', 'loading', 'unavailable', 'stale']) {
    await page.goto('/settings')
    await page.locator('#data-state').selectOption(state)
    await page.getByRole('link', { name: 'Open Markets' }).tap()
    await page.getByRole('tab', { name: 'Korea', exact: true }).tap()
    await page.locator('.market-card[data-market="demo-smsn-usdc"] a').tap()
    await expect(page.locator('.detail-stats dd')).toHaveCount(4)
    if (state === 'stale') {
      await expect(page.getByTestId('quote-price')).toBeVisible()
      await expect(page.locator('.state-notice')).toBeVisible()
    } else {
      await expect(page.getByTestId('quote-price')).toHaveCount(0)
      await expect(page.locator('.price-chart, .detail-related-card .sparkline')).toHaveCount(0)
      await expect(page.locator('.detail-stats dd').first()).toHaveText('—')
      if (state !== 'loading') {
        await page.getByRole('button', { name: 'Retry', exact: true }).tap()
        await expect(page.getByTestId('quote-price')).toBeVisible()
      }
    }
  }
})
