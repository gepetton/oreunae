import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { change24h, convertPrice, currencyUnit, formatChange, formatMarketPrice, marketCurrency, markets, priceDirection, seriesFor, macroIndicators } from '../src/lib/market-data'
import { indicators, overviewChange, overviewChangeLabel, overviewPrice, preIpo } from '../src/lib/home-overview'

const screenshotRoot = process.env.OREUNAE_SCREENSHOTS
test('previous brand preferences migrate once without replacing existing preferences', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('offbell:locale', 'ko')
    localStorage.setItem('offbell:theme', 'dark')
    localStorage.setItem('offbell:saved', '["demo-smsn-usdc"]')
    localStorage.setItem('oreunae:locale', 'en')
    sessionStorage.setItem('offbell:expanded-indicators', '["oil"]')
  })
  await page.goto('/markets')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await page.evaluate(() => ({
    saved: localStorage.getItem('oreunae:saved'),
    oldSaved: localStorage.getItem('offbell:saved'),
    oldTheme: localStorage.getItem('offbell:theme'),
    oldSections: sessionStorage.getItem('offbell:expanded-indicators'),
  }))).toEqual({ saved: '["demo-smsn-usdc"]', oldSaved: null, oldTheme: null, oldSections: null })
})

async function boot(page: Page, locale = 'en', theme = 'light') {
  await page.addInitScript(({ locale, theme }) => { localStorage.setItem('oreunae:locale', locale); localStorage.setItem('oreunae:theme', theme) }, { locale, theme })
  await page.goto('/markets')
  await page.evaluate(() => document.fonts.ready)
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test('fixture arithmetic and chart ranges retain the native unit and actual history', () => {
  expect(formatChange({ ...markets[0], price: markets[0].prev24h }, 'ko')).toBe('0.00%')
  expect(priceDirection(0)).toBe('flat')
  for (const market of markets.slice(0, 4)) {
    expect(change24h(market)).toBe({ SMSN: 2.34, NVDA: 1.28, BTC: -.42, GOLD: .63 }[market.symbol])
    expect(market.quote).toBe('USDC')
    for (const [period, expected] of [['1H', 13], ['24H', 289], ['1W', 8], ['1M', 31], ['1Y', 366]] as const) {
      const points = seriesFor(market.id, period)
      expect(points).toHaveLength(expected)
      expect(points.at(-1)?.value).toBe(market.price)
    }
  }
})

test('instrument currencies convert sample prices without changing native fixtures', () => {
  const [smsn, nvda, btc, gold] = markets
  expect(markets.slice(0, 4).map(marketCurrency)).toEqual(['KRW', 'USD', 'USD', 'USD'])
  expect(smsn.price).toBe('1248.60')
  expect(convertPrice(smsn, smsn.price)).toBe('1716825')
  expect(convertPrice(nvda, nvda.price)).toBe('182.36352')
  for (const locale of ['en', 'ko'] as const) {
    expect(formatMarketPrice(smsn, smsn.price, locale)).toBe('1,716,825')
    expect(formatMarketPrice(smsn, smsn.high24h, locale)).toBe('1,738,275')
    expect(formatMarketPrice(smsn, smsn.low24h, locale)).toBe('1,675,850')
    expect(formatMarketPrice(nvda, nvda.price, locale)).toBe('182.36')
    expect(formatMarketPrice(btc, btc.price, locale)).toBe('64,267.14')
    expect(formatMarketPrice(gold, gold.price, locale)).toBe('2,480.00')
    expect(currencyUnit('USD', locale)).toBe('USD')
  }
  expect(formatMarketPrice(smsn, seriesFor(smsn.id, '1Y')[0].value, 'en')).toBe('1,356,286')
  expect(change24h(smsn)).toBe(2.34)
})

test('currency follows the instrument through language changes, chart, stats and saved rows', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 })
  for (const locale of ['ko', 'en']) {
    await page.goto('/markets')
    await page.locator('.locale-select select').selectOption(locale)
    await page.goto('/markets/demo-smsn-usdc')
    await expect(page.getByTestId('quote-price')).toHaveText(locale === 'ko' ? '1,716,825 원' : '1,716,825 KRW')
    await expect(page.locator('.detail-stats')).toContainText('1,738,275')
    await expect(page.locator('.detail-stats')).toContainText('1,675,850')
    await expect(page.locator('.price-chart')).toHaveAttribute('data-currency', 'KRW')
    await expect(page.locator('.price-chart .chart-grid')).toHaveCount(3)
    await page.getByRole('slider').focus()
    await page.keyboard.press('End')
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', /1,716,825 (KRW|원)/)
    await page.locator('.detail-price-guide').click()
    await expect(page.locator('.detail-dialog .provenance')).toContainText('1,248.60 USDC')
    await expect(page.locator('.detail-dialog .provenance')).toContainText('1 USDC = 1,375')
    for (const [id, price] of [['nvda', '182.36'], ['btc', '64,267.14'], ['gold', '2,480.00']]) {
      await page.goto(`/markets/demo-${id}-usdc`)
      await expect(page.getByTestId('quote-price')).toHaveText(`${price} USD`)
      await expect(page.locator('.price-chart')).toHaveAttribute('data-currency', 'USD')
      await page.locator('.detail-price-guide').click()
      await expect(page.locator('.detail-dialog .provenance')).toContainText('1 USDC = 0.9998 USD')
      await page.keyboard.press('Escape')
    }
  }
  for (const id of ['smsn', 'nvda']) {
    await page.goto(`/markets/demo-${id}-usdc`)
    await page.locator('.desktop-save button').click()
  }
  await page.goto('/saved')
  await expect(page.locator('.saved-list .row-price[data-currency="KRW"]')).toHaveText('₩1,716,825')
  await expect(page.locator('.saved-list .row-price[data-currency="USD"]')).toHaveText('$182.36')
})

for (const width of [390, 1440]) for (const theme of ['light', 'dark']) for (const locale of ['en', 'ko']) {
  test(`visual and accessibility ${width} ${theme} ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1050 })
    const errors: string[] = [], external: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5174') && !request.url().startsWith('data:')) external.push(request.url()) })
    await boot(page, locale, theme)
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(18)
    await expect(page.getByTestId('snapshot-price').filter({ visible: true }).first()).toHaveText('5,175.27 pt')
    await expect(page.locator('.macro-tile[data-snapshot-id] .home-card-change').first()).toHaveText('+0.62%')
    await expect(page.locator('.home-route .sparkline:visible')).toHaveCount(25)
    await expect(page.locator('.home-route .price-chart')).toHaveCount(0)
    const colors = await page.locator('.macro-tile[data-snapshot-id]').evaluateAll(cards => cards.map(card =>
      getComputedStyle(card.querySelector('.home-card-change')!).color,
    ))
    const up = colors[0].match(/[\d.]+/g)!.map(Number)
    const down = colors[5].match(/[\d.]+/g)!.map(Number)
    expect(up[0]).toBeGreaterThan(up[2])
    expect(down[2]).toBeGreaterThan(down[0])
    const fonts = await page.evaluate(() => [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family))
    // Compact home cards use the locale's body font; unused fonts stay unloaded.
    expect(fonts).toEqual(expect.arrayContaining(locale === 'ko' ? ['Pretendard'] : ['Geist Sans']))
    await noOverflow(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)).toEqual([])
    if (screenshotRoot) await page.screenshot({ path: `${screenshotRoot}/markets-${width}-${theme}-${locale}.png`, fullPage: true })
    await page.goto('/markets/demo-smsn-usdc')
    await expect(page.locator('.price-chart')).toBeVisible()
    await noOverflow(page)
    if (screenshotRoot) await page.screenshot({ path: `${screenshotRoot}/detail-${width}-${theme}-${locale}.png`, fullPage: true })
    expect(errors).toEqual([])
    expect(external).toEqual([])
  })
}

test('home snapshot is independent of saved preferences and Saved stays in the header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 })
  await boot(page)
  const cards = page.locator('.macro-tile[data-snapshot-id]:visible')
  await expect(cards).toHaveCount(18)
  await expect(cards.locator('.macro-tile-name')).toHaveText(['S&P 500', 'Nasdaq 100', 'KOSPI', 'Dow Jones', 'VIX volatility', 'Fear & Greed', 'Buffett ratio', 'US CPI', 'Core CPI', 'Core PCE', 'US unemployment', 'US hourly earnings', 'US participation', 'Effective Fed funds', 'SOFR', 'Bank of Korea', 'Gold', 'Dollar index'])
  const saved = page.locator('header').getByRole('link', { name: 'Saved', exact: true })
  const savedBounds = await saved.boundingBox(), localeBounds = await page.locator('.locale-select').boundingBox()
  expect(savedBounds!.x + savedBounds!.width).toBeLessThanOrEqual(localeBounds!.x)
  await page.evaluate(() => localStorage.setItem('oreunae:saved', JSON.stringify(['demo-btc-usdc'])))
  await page.reload()
  await expect(cards.locator('.macro-tile-name')).toHaveText(['S&P 500', 'Nasdaq 100', 'KOSPI', 'Dow Jones', 'VIX volatility', 'Fear & Greed', 'Buffett ratio', 'US CPI', 'Core CPI', 'Core PCE', 'US unemployment', 'US hourly earnings', 'US participation', 'Effective Fed funds', 'SOFR', 'Bank of Korea', 'Gold', 'Dollar index'])
  await saved.click()
  await expect(saved).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('.saved-list .market-name')).toHaveText(['Bitcoin'])
  await page.goto('/markets')
  await cards.filter({ hasText: 'Gold' }).click()
  await expect(page.getByTestId('quote-price')).toHaveText('2,480.00 USD')
  await page.locator('.detail-price-guide').click()
  await expect(page.locator('.detail-dialog .provenance')).toContainText('Reference venue pending')
})

test('chart period controls and keyboard explore actual points without changing the quote', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 })
  await boot(page)
  await page.goto('/markets/demo-smsn-usdc')
  for (const [period, count] of [['1D', 289], ['1W', 8], ['1M', 31], ['3M', 91], ['1Y', 366]] as const) {
    await page.getByRole('button', { name: period, exact: true }).click()
    await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', `${count}`)
    await expect(page.getByTestId('quote-price')).toHaveText('1,716,825 KRW')
    await expect(page.getByTestId('quote-change')).toHaveText('(+2.34%)')
  }
  const chart = page.getByRole('slider')
  await chart.focus()
  await chart.press('Home')
  await expect(chart).toHaveAttribute('aria-valuenow', '0')
  await expect(chart).toHaveAttribute('aria-valuetext', /1,356,286 KRW/)
  await chart.press('ArrowRight')
  await expect(chart).toHaveAttribute('aria-valuenow', '1')
  await chart.press('End')
  await expect(chart).toHaveAttribute('aria-valuetext', /1,716,825 KRW/)
})

test('mock indicator details lead with price and selectable chart ranges', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/markets/wti-spot')
  await expect(page.locator('.detail-chart-card')).toBeVisible()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-mode', 'line')
  await expect(page.locator('.chart-line')).toHaveCount(1)
  await expect(page.locator('.chart-candle, .chart-volume-bar')).toHaveCount(0)
  await expect(page.locator('.asset-detail')).not.toContainText('RSI')
  const chartY = (await page.locator('.detail-chart-card').boundingBox())!.y
  const introY = (await page.locator('.detail-brief').boundingBox())!.y
  expect(chartY).toBeLessThan(introY)
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '6')
  await page.getByRole('button', { name: '1W', exact: true }).click()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '8')
  await expect(page.locator('.chart-caption')).toHaveText('USD/bbl')
  await expect(page.getByTestId('quote-price')).toHaveText('78.40 USD/bbl')
  await page.getByRole('slider').focus()
  await page.keyboard.press('Home')
  await expect(page.locator('.chart-point-tooltip')).toBeVisible()
  await expect(page.locator('.chart-point-tooltip')).toContainText('USD/bbl')
  await page.getByRole('button', { name: 'ALL', exact: true }).click()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '12')
  await page.getByRole('button', { name: '1D', exact: true }).click()
  await expect(page.locator('.detail-related-card')).toHaveCount(4)
  await page.goto('/markets/demo-us-cpi-yoy')
  await expect(page.locator('.price-chart')).toHaveAttribute('data-period', '1Y')
  await expect(page.locator('.price-chart')).toHaveAttribute('data-mode', 'line')
  await expect(page.locator('.detail-chart-type')).toHaveCount(0)
  await page.getByRole('button', { name: '3M', exact: true }).click()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '3')
  await expect(page.getByTestId('quote-price')).toBeVisible()
})

test('saved, theme, language and time zone persist with a clean page reload', async ({ page }) => {
  await page.goto('/markets')
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('en')
  await page.goto('/markets/demo-smsn-usdc')
  await page.locator('.desktop-save').getByRole('button').click()
  await expect(page.locator('.desktop-save button')).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/saved')
  await expect(page.locator('.saved-list')).toContainText('SMSN')
  await page.goto('/settings')
  await page.getByRole('button', { name: /Dark A.2/ }).click()
  await page.locator('#settings-language').selectOption('ko')
  await page.locator('#settings-timezone').selectOption('Asia/Seoul')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('#settings-timezone')).toHaveValue('Asia/Seoul')
  await page.goto('/markets/demo-smsn-usdc')
  await expect(page.locator('.desktop-save button')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.detail-price-guide').click()
  await expect(page.locator('.detail-dialog .provenance')).toContainText('06:42:08 KST')
  await page.keyboard.press('Escape')
  await page.locator('.desktop-save button').click()
  await page.goto('/saved')
  await expect(page.getByRole('heading', { name: '관심 목록이 비어 있습니다' })).toBeVisible()
})

test('Macro, Calendar, dialog and explicit data states are honest and interactive', async ({ page }) => {
  await boot(page)
  await page.goto('/macro')
  await expect(page.locator('.macro-full')).toContainText('2.6%')
  await expect(page.locator('.macro-full')).toContainText('2.50%')
  await expect(page.locator('.macro-metadata')).toHaveCount(macroIndicators.length)
  await page.goto('/calendar')
  await expect(page.getByRole('heading', { name: 'No release schedule in this demo' })).toBeVisible()
  for (const state of ['error', 'loading', 'unavailable', 'stale']) {
    await page.goto('/settings')
    await page.locator('#data-state').selectOption(state)
    // Client navigation intentionally keeps transient demo state.
    await page.getByRole('link', { name: 'Open Markets' }).click()
    if (state === 'stale') await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(18)
    else await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(0)
    if (state === 'error') { await page.getByRole('button', { name: 'Retry' }).click(); await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(18) }
  }
  await page.goto('/markets/demo-smsn-usdc')
  await page.getByRole('button', { name: 'About this price' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('not an ordinary-share quote')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'About this price' })).toBeFocused()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout width ${width} across every route`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await boot(page, 'ko', 'dark')
    for (const path of ['/markets', '/markets/demo-btc-usdc', '/markets/category/indicators', '/markets/category/pre-ipo', '/markets/category/stocks', '/markets/category/other-assets', '/markets/category/oil', '/markets/category/treasury', '/markets/category/indices', '/markets/category/sentiment-valuation', '/markets/category/inflation', '/markets/category/rates-commodities', '/saved', '/macro', '/calendar', '/settings']) {
      await page.goto(path)
      await noOverflow(page)
      const horizontalOverflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(node => { const rect = node.getBoundingClientRect(); return rect.width && getComputedStyle(node).position !== 'absolute' && rect.right > innerWidth + 1 && !node.closest('.category-tabs') }).map(node => node.className))
      expect(horizontalOverflow).toEqual([])
    }
  })
}

test('asset rows preserve full prices, identity and charts while resizing', async ({ page }) => {
  await boot(page)
  await page.goto('/markets/category/stocks')
  for (const locale of ['ko', 'en']) {
    await page.locator('.locale-select select').selectOption(locale)
    await page.evaluate(() => document.fonts.ready)
    for (const width of [320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      const issues = await page.locator('.home-asset-link, .home-indicator-content').evaluateAll(contents => contents.flatMap(content => {
        const price = content.querySelector('.home-card-value')! as HTMLElement
        const change = content.querySelector('.home-card-change')! as HTMLElement
        const bounds = content.getBoundingClientRect()
        const priceBounds = price.getBoundingClientRect(), changeBounds = change.getBoundingClientRect()
        const identity = content.querySelector('.home-asset-identity')?.getBoundingClientRect()
        const chart = content.querySelector('.home-mini-chart')?.getBoundingClientRect()
        const overlap = chart && chart.width > 0 && identity && (identity.right > chart.left + .5 || chart.right > priceBounds.left + .5)
        return price.scrollWidth > price.clientWidth + 1 || priceBounds.bottom > changeBounds.top + .5 || changeBounds.right > bounds.right + .5 || priceBounds.right > bounds.right + .5 || overlap
          ? [content.textContent] : []
      }))
      expect(issues, `${locale} ${width}px must show full prices and separate charts from identity`).toEqual([])
      await expect(page.getByTestId('card-price').first()).toHaveText(locale === 'ko' ? '1,716,825 원' : '1,716,825 KRW')
      await noOverflow(page)
    }
  }
})

test('home price guide, tab saving and metric details preserve navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 })
  await boot(page, 'ko')
  await page.getByRole('tab', { name: '국내', exact: true }).click()
  const save = page.locator('[data-market="demo-smsn-usdc"] .save-button')
  await save.click()
  await expect(page).toHaveURL(/tab=domestic/)
  await expect(save).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(save).toHaveAttribute('aria-pressed', 'true')
  await page.locator('header').getByRole('link', { name: '관심', exact: true }).click()
  await expect(page.locator('.saved-list')).toContainText('SMSN')
  await page.goto('/markets')
  await expect(page.locator('.home-section-heading .indicator-toggle')).toHaveCount(3)
  for (const id of ['wti-spot', 'us-treasury-10y', 'demo-sp500', 'demo-fear-greed', 'demo-us-core-pce-yoy']) {
    const card = page.locator(`.macro-tile[href="/markets/${id}"]`)
    await card.scrollIntoViewIfNeeded()
    const homeScroll = await page.evaluate(() => window.scrollY)
    await card.click()
    await expect(page).toHaveURL(new RegExp(`/markets/${id}$`))
    await expect(page.locator('.asset-detail')).toHaveAttribute('data-market', id)
    await page.goBack()
    await expect(page).toHaveURL(/\/markets$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(homeScroll)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.home-reference-badge').click()
  await expect(page.getByRole('dialog')).toContainText('실제 주가나 종가가 아니며')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  for (const card of await page.locator('.macro-tile').all()) {
    expect(await card.locator('.home-card-change').evaluate(node => getComputedStyle(node).color)).toBe(await card.locator('.sparkline').evaluate(node => getComputedStyle(node).color))
  }
})

test('mobile market cards, detail save, touch chart and header Saved preserve navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 })
  await boot(page)
  await page.getByRole('tab', { name: 'Crypto', exact: true }).click()
  await expect(page.locator('.market-card')).toHaveCount(4)
  await expect(page.locator('.bottom-nav, .sidebar')).toHaveCount(0)
  const btcCard = page.locator('.market-grid').getByRole('link', { name: /BTC.*View market details/ })
  await btcCard.scrollIntoViewIfNeeded()
  const scrollTarget = await page.evaluate(() => window.scrollY)
  expect(scrollTarget).toBeGreaterThanOrEqual(0)
  await page.evaluate(target => window.scrollTo(0, target), scrollTarget)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollTarget)
  const cardBounds = await btcCard.boundingBox()
  // Tap the visible portion without Playwright scrolling the entire card into view.
  await page.mouse.click(cardBounds!.x + cardBounds!.width / 2, cardBounds!.y + cardBounds!.height - 30)
  await expect(page).toHaveURL(/demo-btc-usdc/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.getByRole('button', { name: '1Y', exact: true }).click()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '366')
  await page.locator('.mobile-header-save button').click()
  await expect(page.locator('.mobile-header-save button')).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('slider').click({ position: { x: 120, y: 80 } })
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', /USD/)
  await page.goBack()
  await expect(page).toHaveURL(/tab=crypto/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollTarget)
  await page.locator('header').getByRole('link', { name: 'Saved' }).click()
  await expect(page.locator('.saved-list')).toContainText('BTC')
})

test('macro arithmetic distinguishes yield basis points, oil returns and native USDT conversion', () => {
  const treasury = indicators.find(item => item.id === 'us-treasury-10y')!
  expect(overviewChange(treasury)).toBe(-4)
  expect(overviewChangeLabel(treasury, 'ko')).toBe('−4 bp')
  expect(overviewChangeLabel({ ...treasury, value: '4.10', previous: '4.00' }, 'en')).toBe('+10 bp')
  expect(overviewChangeLabel({ ...treasury, value: '4.105', previous: '4.10' }, 'en')).toBe('+0.50 bp')
  expect(overviewChangeLabel({ ...treasury, previous: treasury.value }, 'en')).toBe('0 bp')
  expect(overviewChangeLabel(indicators[0], 'en')).toBe('+2.08%')
  expect(preIpo[0].value).toBe('620.00')
  expect(overviewPrice(preIpo[0], 'ko')).toBe('620.12')
  expect(overviewChangeLabel(preIpo[0], 'en')).toBe('+3.33%')
  for (const item of [...indicators, ...preIpo]) {
    expect(item.history[0]).toBe(Number(item.previous))
    expect(item.history.at(-1)).toBe(Number(item.value))
  }
})

test('indicator and pre-IPO tabs preserve source details and consistent data states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await boot(page, 'ko')
  expect(await page.locator('[data-home-section]').evaluateAll(sections => sections.map(section => section.getAttribute('data-home-section')))).toEqual(['oil', 'treasury', 'indices', 'sentiment-valuation', 'inflation', 'employment', 'monetary-policy', 'rates-commodities'])
  await expect(page.getByRole('tab')).toHaveText(['주요 지표', '국내', '해외', 'IPO 예정', '코인'])
  await expect(page.locator('.home-market-status')).toContainText('시장 데이터 · 예시 데이터')
  await expect(page.getByText('매크로 한눈에')).toHaveCount(0)
  const wti = page.locator('[data-overview-id="wti-spot"]')
  await expect(wti.getByTestId('overview-price')).toHaveText('78.40 USD/bbl')
  await wti.click()
  await expect(page.getByTestId('quote-price')).toHaveText('78.40 USD/bbl')
  await page.goBack()
  const treasury = page.locator('[data-overview-id="us-treasury-10y"]')
  await expect(treasury.getByTestId('overview-price')).toHaveText('4.12 %')
  await expect(treasury).toContainText('−4 bp')
  await treasury.click()
  await expect(page.getByTestId('quote-change')).toHaveText('−4 bp')
  await page.locator('.detail-price-guide').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('4.12 %')
  await expect(dialog).toContainText('수익률 상승은 채권 가격 상승을 의미하지 않습니다')
  await expect(dialog.getByRole('link')).toHaveAttribute('href', /home.treasury.gov/)
  await page.keyboard.press('Escape')
  await page.goBack()
  await expect(treasury).toBeVisible()
  await page.getByRole('tab', { name: 'IPO 예정', exact: true }).click()
  const openai = page.locator('[data-overview-id="openai-pre-ipo"]')
  await openai.click()
  await page.locator('.detail-price-guide').click()
  await expect(dialog).toContainText('OPENAI/USDT')
  await expect(dialog).toContainText('620.00 USDT')
  await expect(dialog).toContainText('620.12 USD')
  await expect(dialog).toContainText('1 USDT = 1.0002 USD')
  await expect(dialog).toContainText('주식 소유권을 제공하지 않으며')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
  if (screenshotRoot) await page.screenshot({ path: `${screenshotRoot}/pre-ipo-guide-390-ko.png` })
  await dialog.getByRole('button', { name: '닫기' }).click()
  await page.goBack()
  await expect(openai).toBeVisible()
  await page.locator('[data-overview-id="anthropic-pre-ipo"]').click()
  await page.locator('.detail-price-guide').click()
  await expect(dialog).toContainText('ANTHROPIC/USDT')
  await expect(dialog.getByRole('link')).toHaveAttribute('href', /2b9ff1e1acf8433793bc40c59a0cb852/)
  await page.keyboard.press('Escape')
  for (const state of ['loading', 'error', 'unavailable', 'stale']) {
    await page.goto('/settings')
    await page.locator('#data-state').selectOption(state)
    await page.getByRole('link', { name: '마켓 열기' }).click()
    const hasValues = state === 'stale'
    await expect(page.getByTestId('overview-price').filter({ visible: true })).toHaveCount(hasValues ? 7 : 0)
    await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(hasValues ? 13 : 0)
    await expect(page.locator('.home-route .sparkline:visible')).toHaveCount(hasValues ? 25 : 0)
    await expect(page.locator('.home-route .price-chart')).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveCount(1)
    if (state === 'error' || state === 'unavailable') await expect(page.getByRole('button', { name: '다시 시도' })).toHaveCount(1)
    await noOverflow(page)
  }
})

test('malformed preferences and unknown asset URLs remain usable', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('oreunae:saved', '{bad json'); localStorage.setItem('oreunae:locale', 'invalid'); localStorage.setItem('oreunae:theme', 'invalid') })
  await page.goto('/markets/unknown')
  await expect(page.getByRole('heading', { name: 'This page could not be found' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to Markets' }).click()
  await expect(page.getByTestId('snapshot-price').filter({ visible: true })).toHaveCount(18)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})
