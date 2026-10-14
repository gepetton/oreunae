import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assetChangeLabel, assetSeries, assetUnit, assetValue, detailAssets } from '../src/lib/detail-assets'

test.use({ hasTouch: true })
const tabs = ['indicators', 'domestic', 'overseas', 'pre-ipo', 'crypto']
const members: Record<string, string[]> = {
  indicators: ['wti-spot', 'brent-spot', 'dubai-spot', 'us-treasury-2y', 'us-treasury-5y', 'us-treasury-10y', 'us-treasury-30y', 'demo-sp500', 'demo-nasdaq100', 'demo-kospi', 'demo-dow', 'demo-vix', 'demo-fear-greed', 'demo-buffett', 'demo-us-cpi-yoy', 'demo-us-core-cpi-yoy', 'demo-us-core-pce-yoy', 'demo-us-unemployment', 'demo-us-wage-yoy', 'demo-us-participation', 'demo-us-effr', 'demo-us-sofr', 'demo-bok-policy', 'demo-gold-usdc', 'demo-dollar-index'],
  domestic: ['demo-smsn-usdc', 'demo-sk-hynix', 'demo-hyundai', 'demo-naver'], overseas: ['demo-nvda-usdc', 'demo-aapl-usdc', 'demo-tsla-usdc', 'demo-msft-usdc', 'demo-amzn-usdc'], 'pre-ipo': ['openai-pre-ipo', 'anthropic-pre-ipo', 'demo-spacex-candidate', 'demo-databricks-candidate'], crypto: ['demo-btc-usdc', 'demo-eth-usdc', 'demo-sol-usdc', 'demo-xrp-usdc'],
}

for (const theme of ['light', 'dark']) for (const locale of ['ko', 'en']) {
  test(`home tabs fit, filter and remain accessible: ${theme} ${locale}`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.addInitScript(({ theme, locale }) => {
      localStorage.setItem('oreunae:theme', theme); localStorage.setItem('oreunae:locale', locale)
    }, { theme, locale })
    await page.goto('/markets')
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      for (const tab of tabs) {
        await page.locator(`#home-tab-${tab}`).tap()
        await page.evaluate(() => document.fonts.ready)
        await expect(page.getByRole('tab', { selected: true })).toHaveAttribute('id', `home-tab-${tab}`)
        const ids = await page.getByRole('tabpanel').locator('[data-overview-id]:visible, [data-market]:visible, [data-snapshot-id]:visible').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-overview-id') || node.getAttribute('data-market') || node.getAttribute('data-snapshot-id')))
        expect(ids).toEqual(members[tab])
        await expect(page.locator('.home-market-status')).toContainText(tab === 'indicators' ? locale === 'ko' ? '시장 데이터' : 'Market data' : locale === 'ko' ? '24H 참고가격' : '24H reference prices')
        if (tab === 'indicators') {
          await expect(page.locator('[data-home-section]')).toHaveCount(8)
          await expect(page.locator('.home-section-heading .indicator-toggle')).toHaveCount(3)
          expect(await page.locator('.home-section-heading h2').evaluateAll(headings => headings.every(heading => !heading.querySelector('a, svg')))).toBe(true)
          await expect(page.locator('.indicator-section-card')).toHaveCount(8)
          for (const card of await page.locator('.indicator-section-card').all()) {
            const rows = await card.locator('.macro-tile:visible').all()
            expect(rows.length).toBeGreaterThanOrEqual(2)
            expect(rows.length).toBeLessThanOrEqual(4)
            const first = (await rows[0].boundingBox())!, second = (await rows[1].boundingBox())!
            if (width >= 1024) {
              expect(first.y).toBe(second.y)
              expect(first.x + first.width).toBeLessThan(second.x)
            } else {
              expect(first.x).toBe(second.x)
              expect(first.y + first.height).toBeLessThanOrEqual(second.y + 1)
            }
          }
          expect(await page.locator('.home-indicator-sections').evaluate(node => node.lastElementChild?.classList.contains('home-brand-banner'))).toBe(true)
          await expect(page.locator('.home-perspective, .home-brand-footer')).toHaveCount(0)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        const issues = await page.locator('.home-card-value:visible, .macro-tile-price:visible, .macro-tile-name:visible, .home-tabs button').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent))
        expect(issues, `${tab} ${width}px: no clipped values or tabs`).toEqual([])
        const overlaps = await page.locator('.macro-tile:visible').evaluateAll(nodes => nodes.flatMap(node => {
          const card = node.getBoundingClientRect(), price = node.querySelector('.macro-tile-price')!.getBoundingClientRect()
          const quote = node.querySelector('.macro-tile-quote')!.getBoundingClientRect(), chart = node.querySelector('.home-mini-chart')!.getBoundingClientRect()
          const overlaps = quote.left < chart.right && quote.right > chart.left && quote.top < chart.bottom && quote.bottom > chart.top
          return price.right > card.right || overlaps || chart.right > card.right ? [node.textContent] : []
        }))
        expect(overlaps).toEqual([])
      }
    }
    await page.setViewportSize({ width: 390, height: 844 })
    for (const tab of tabs) {
      await page.locator(`#home-tab-${tab}`).tap()
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(result.violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(',')}`), tab).toEqual([])
    }
    expect(errors).toEqual([])
  })
}

test('tabs support keyboard, deep links, reload, detail back and forward', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto('/markets?tab=pre-ipo')
  await expect(page.getByRole('tab', { selected: true })).toHaveAttribute('id', 'home-tab-pre-ipo')
  await page.reload()
  await page.locator('#home-tab-pre-ipo').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#home-tab-crypto')).toBeFocused()
  await expect(page).toHaveURL(/tab=crypto/)
  await page.keyboard.press('Home')
  await expect(page.locator('#home-tab-indicators')).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('#home-tab-crypto')).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.locator('#home-tab-crypto')).toHaveAttribute('aria-selected', 'true')
  await page.locator('.market-card a').tap()
  await expect(page).toHaveURL(/demo-btc-usdc/)
  await page.goBack()
  await expect(page).toHaveURL(/tab=crypto/)
  await expect(page.locator('#home-tab-crypto')).toHaveAttribute('aria-selected', 'true')
  await page.goForward()
  await expect(page.locator('.asset-detail')).toHaveAttribute('data-market', 'demo-btc-usdc')
  await page.goto('/markets?tab=unknown')
  await expect(page.locator('#home-tab-indicators')).toHaveAttribute('aria-selected', 'true')
  const banner = page.locator('.home-brand-banner')
  await banner.tap()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(banner).toBeFocused()
})

test('snapshot indices preserve point units, synthetic periods, detail routes and saved state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 })
  const indices = detailAssets.filter(asset => asset.index)
  expect(indices.map(asset => assetChangeLabel(asset, 'en'))).toEqual(['+0.62%', '+1.21%', '−0.28%', '+0.84%', '−3.56%', '+1.60 pp', '+5 pt', '+0.23%', '−0.79%'])
  for (const asset of indices) {
    expect(assetSeries(asset).every(point => !point.time)).toBe(true)
    await page.goto('/markets')
    const card = page.locator(`[data-snapshot-id="${asset.id}"]`)
    if (asset.id === 'demo-russell2000') await page.locator('[data-home-section="indices"] .home-section-heading button[aria-expanded="false"]').tap()
    const listUrl = page.url()
    await card.scrollIntoViewIfNeeded()
    const scroll = await page.evaluate(() => scrollY)
    await card.tap()
    await expect(page.getByTestId('quote-price')).toHaveText(`${assetValue(asset, asset.price, 'en')} ${assetUnit(asset, 'en')}`)
    await expect(page.locator('.price-chart')).toHaveAttribute('data-currency', asset.currency)
    await expect(page.locator('.price-chart')).toHaveAttribute('data-period', '1D')
    await page.locator('.mobile-header-save button').tap()
    await page.reload()
    await expect(page.locator('.mobile-header-save button')).toHaveAttribute('aria-pressed', 'true')
    await page.locator('.detail-price-guide').tap()
    if (asset.basis === 'indexBasis') await expect(page.getByRole('dialog')).toContainText('not dollar prices')
    await expect(page.getByRole('dialog')).toContainText('Not provided in this demo')
    await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page.goBack()
    await expect(page).toHaveURL(listUrl)
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll)
  }
  await page.locator('header a[href="/saved"]').tap()
  await page.reload()
  await expect(page.locator('.row-price')).toHaveText(['5,175.27 pt', '18,362.14 pt', '104.21 pt', '2,687.45 pt', '18.42 pt', '186.4%', '64 pts', '39,087.38 pt', '2,074.31 pt'])
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
})

for (const locale of ['ko', 'en']) test(`sticky tabs and ten-character metric prices stay usable: ${locale}`, async ({ page }) => {
  await page.addInitScript(locale => localStorage.setItem('oreunae:locale', locale), locale)
  // Exercise a larger quote through the fixture import, without changing the saved demo.
  await page.route('**/src/data/market-indices.json*', async route => {
    const response = await route.fetch()
    await route.fulfill({ response, body: (await response.text()).replaceAll('18362.14', '123456.78') })
  })
  await page.goto('/markets')
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 700 })
    await page.evaluate(() => document.fonts.ready)
    const price = page.locator('[data-snapshot-id="demo-nasdaq100"] .macro-tile-price')
    await expect(price).toHaveText('123,456.78 pt')
    expect(await price.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    expect(await price.evaluate(el => getComputedStyle(el).whiteSpace)).toBe('nowrap')
    expect(await price.evaluate(el => getComputedStyle(el).fontVariantNumeric)).toContain('tabular-nums')
    const charts = await page.locator('.home-indicator-sections .home-mini-chart').evaluateAll(nodes => nodes.map(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, parent: node.parentElement!.getBoundingClientRect().width })))
    expect(charts.every(chart => width >= 1024
      ? chart.height === 44 && chart.width > 64 && chart.width <= 108
      : chart.height === (width < 375 ? 20 : 22) && chart.width === (width < 375 ? 30 : 52))).toBe(true)
    await page.evaluate(() => window.scrollTo(0, 500))
    await expect.poll(async () => (await page.locator('.home-tabs-sticky').boundingBox())!.y).toBe((await page.locator('header').boundingBox())!.height)
    expect(await page.locator('.home-market-status').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(0)
    const tab = page.locator('#home-tab-overseas')
    expect(await tab.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) })).toBe(true)
    await tab.tap()
    await expect(page.locator('.home-market-status')).toContainText(locale === 'ko' ? '24H 참고가격' : '24H reference prices')
    await page.locator('#home-tab-indicators').tap()
    await expect(page.locator('.home-market-status')).toContainText(locale === 'ko' ? '시장 데이터' : 'Market data')
  }
})
