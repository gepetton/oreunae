import { expect, test } from '@playwright/test'

test.use({ hasTouch: true })

test('home-centered navigation keeps calendar, saved, indicators and settings reachable', async ({ page }) => {
  await page.goto('/markets')
  for (const locale of ['ko', 'en']) {
    await page.locator('.locale-select select').selectOption(locale)
    await page.evaluate(() => document.fonts.ready)
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      await expect(page.locator('.bottom-nav, .sidebar')).toHaveCount(0)
      const header = page.locator('header')
      const controls = [header.locator('.brand'), header.locator('a[href="/calendar"]'), header.locator('a[href="/saved"]'), header.locator('.locale-select')]
      let right = 0
      for (const control of controls) {
        await expect(control).toBeVisible()
        const bounds = (await control.boundingBox())!
        expect(bounds.x, `${locale} ${width}px: header overlap`).toBeGreaterThanOrEqual(right)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
        expect(bounds.width).toBeGreaterThanOrEqual(44)
        expect(bounds.height).toBeGreaterThanOrEqual(44)
        right = bounds.x + bounds.width
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
  // Settings remains discoverable on desktop after removing the sidebar.
  await page.locator('footer').getByRole('link', { name: 'Settings' }).click()
  await expect(page).toHaveURL(/\/settings$/)
  await page.locator('header .brand').click()
  await expect(page).toHaveURL(/\/markets$/)
  await page.setViewportSize({ width: 320, height: 568 })
  const calendar = page.locator('header').getByRole('link', { name: 'Calendar', exact: true })
  await calendar.tap()
  await expect(page).toHaveURL(/\/calendar$/)
  await expect(calendar).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { level: 1, name: 'Economic calendar', exact: true })).toBeVisible()
  await expect(page.locator('.calendar-empty')).toBeVisible()
  await page.locator('main').getByRole('link', { name: 'Key indicators', exact: true }).tap()
  await expect(page).toHaveURL(/\/markets$/)
  await page.locator('.macro-tile[href="/markets/demo-bok-policy"]').tap()
  await expect(page).toHaveURL(/\/markets\/demo-bok-policy$/)
  await page.locator('.detail-related-card[href="/markets/demo-us-cpi-yoy"]').tap()
  await expect(page).toHaveURL(/\/markets\/demo-us-cpi-yoy$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.asset-detail')).toBeVisible()
  await page.locator('.detail-back').tap()
  await page.locator('.detail-back').tap()
  await page.locator('header').getByRole('link', { name: 'Saved', exact: true }).tap()
  await expect(page).toHaveURL(/\/saved$/)
})

test('WebKit mobile navigation, chart, local fonts and native dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/markets/demo-smsn-usdc')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByTestId('quote-price')).toHaveText('1,716,825 KRW')
  await page.getByRole('button', { name: '1W', exact: true }).click()
  await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', '8')
  await page.getByRole('slider').focus()
  await page.keyboard.press('Home')
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '0')
  const chart = page.getByRole('slider')
  const bounds = await chart.boundingBox()
  // Inspect the second observed sample point, independent of axis placement.
  const position = await chart.locator('.chart-line').evaluate(node => {
    const points = node.getAttribute('d')!.match(/[ML]([\d.]+),([\d.]+)/g)!
    return Number(points[1].slice(1).split(',')[0])
  })
  await page.mouse.move(bounds!.x + position, bounds!.y + 80)
  await page.mouse.down()
  await expect(chart).toHaveAttribute('aria-valuenow', '1')
  await expect(page.getByTestId('quote-price')).not.toHaveText('1,716,825 KRW')
  await page.mouse.up()
  await expect(page.getByTestId('quote-price')).toHaveText('1,716,825 KRW')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'About this price' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/markets')
  await page.getByRole('tab', { name: 'Pre-IPO', exact: true }).tap()
  await expect(page.getByTestId('overview-price')).toHaveCount(4)
  await page.locator('[data-overview-id="openai-pre-ipo"]').tap()
  await expect(page).toHaveURL(/\/markets\/openai-pre-ipo$/)
  await page.locator('.detail-price-guide').tap()
  await expect(page.getByRole('dialog')).toContainText('OPENAI/USDT')
  await expect(page.getByRole('dialog')).toContainText('620.12 USD')
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).tap()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.locator('.detail-price-guide')).toBeFocused()
  await page.goBack()
  await expect(page.locator('[data-overview-id="openai-pre-ipo"]')).toBeVisible()
})

test('home reference cards keep prices readable and restore focus after touch', async ({ page }) => {
  await page.goto('/markets')
  for (const locale of ['ko', 'en']) {
    await page.locator('.locale-select select').selectOption(locale)
    await page.evaluate(() => document.fonts.ready)
    await page.locator('#home-tab-domestic').tap()
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      const issues = await page.locator('.home-asset-link').evaluateAll(cards => cards.flatMap(card => {
        const price = card.querySelector('.home-card-value')! as HTMLElement
        const change = card.querySelector('.home-card-change')!.getBoundingClientRect()
        const identity = card.querySelector('.home-asset-identity')!.getBoundingClientRect()
        const priceBounds = price.getBoundingClientRect()
        const chart = card.querySelector('.home-mini-chart')!.getBoundingClientRect()
        return price.scrollWidth > price.clientWidth + 1 || priceBounds.bottom > change.top + .5 || identity.right > priceBounds.left || (chart.width > 0 && (chart.left < identity.right || chart.right > priceBounds.left))
          ? [card.textContent] : []
      }))
      expect(issues, `${locale} ${width}px`).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('#home-tab-indicators').tap()
  await expect(page.locator('.home-section-heading .indicator-toggle')).toHaveCount(3)
  const treasury = page.locator('[data-overview-id="us-treasury-10y"]')
  await treasury.tap()
  await expect(page).toHaveURL(/\/markets\/us-treasury-10y$/)
  await page.locator('.detail-price-guide').tap()
  await expect(page.getByRole('dialog')).toContainText('basis point')
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).tap()
  await expect(page.locator('.detail-price-guide')).toBeFocused()
  await page.goBack()
  await expect(treasury).toBeVisible()
  await page.getByRole('tab', { name: 'Korea', exact: true }).tap()
  const save = page.locator('[data-market="demo-smsn-usdc"] .save-button')
  await save.tap()
  await expect(save).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/tab=domestic/)
})

test('category lists contain only their instruments and keep details, saving and direct links usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  const categories = [
    { id: 'indicators', title: 'Key indicators', items: ['wti-spot', 'brent-spot', 'dubai-spot', 'us-treasury-10y', 'us-treasury-2y', 'us-treasury-30y', 'us-treasury-3m', 'us-treasury-6m', 'us-treasury-1y', 'us-treasury-5y', 'us-treasury-20y'] },
    { id: 'pre-ipo', title: 'Pre-IPO', items: ['openai-pre-ipo', 'anthropic-pre-ipo', 'demo-spacex-candidate', 'demo-databricks-candidate'] },
    { id: 'stocks', title: 'Stocks', items: ['demo-smsn-usdc', 'demo-sk-hynix', 'demo-hyundai', 'demo-naver', 'demo-nvda-usdc', 'demo-aapl-usdc', 'demo-tsla-usdc', 'demo-msft-usdc', 'demo-amzn-usdc'] },
    { id: 'other-assets', title: 'Global assets', items: ['demo-btc-usdc', 'demo-gold-usdc', 'demo-eth-usdc', 'demo-sol-usdc', 'demo-xrp-usdc'] },
    { id: 'oil', title: 'Global oil', items: ['wti-spot', 'brent-spot', 'dubai-spot'] },
    { id: 'treasury', title: 'US Treasury yields', items: ['us-treasury-2y', 'us-treasury-5y', 'us-treasury-10y', 'us-treasury-30y', 'us-treasury-3m', 'us-treasury-6m', 'us-treasury-1y', 'us-treasury-20y'] },
    { id: 'indices', title: 'Major indices', items: ['demo-sp500', 'demo-nasdaq100', 'demo-kospi', 'demo-dow', 'demo-russell2000'] },
    { id: 'sentiment-valuation', title: 'Sentiment & valuation', items: ['demo-vix', 'demo-fear-greed', 'demo-buffett'] },
    { id: 'inflation', title: 'Inflation', items: ['demo-us-cpi-yoy', 'demo-us-core-cpi-yoy', 'demo-us-core-pce-yoy', 'demo-us-pce-yoy', 'demo-kr-cpi-yoy'] },
    { id: 'rates-commodities', title: 'Commodities & dollar', items: ['demo-gold-usdc', 'demo-dollar-index'] },
  ]
  for (const category of categories) {
    await page.goto(`/markets/category/${category.id}`)
    await expect(page).toHaveURL(new RegExp(`/markets/category/${category.id}$`))
    await expect(page.getByRole('heading', { level: 1, name: category.title, exact: true })).toBeFocused()
    await page.reload()
    const items = page.locator('.overview-card, .market-card, .macro-tile')
    expect(await items.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-overview-id') || node.getAttribute('data-market') || node.getAttribute('data-snapshot-id')))).toEqual(category.items)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  }
  await page.goto('/markets/category/pre-ipo')
  await page.locator('[data-overview-id="openai-pre-ipo"]').tap()
  await expect(page).toHaveURL(/\/markets\/openai-pre-ipo$/)
  await page.locator('.detail-price-guide').tap()
  await expect(page.getByRole('dialog')).toContainText('OPENAI/USDT')
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).tap()
  await expect(page.locator('.detail-price-guide')).toBeFocused()
  await page.goBack()
  await expect(page.locator('[data-overview-id="openai-pre-ipo"]')).toBeVisible()
  await page.goto('/markets/category/stocks')
  const samsung = page.locator('[data-market="demo-smsn-usdc"]')
  await samsung.getByRole('button').tap()
  await expect(samsung.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  await samsung.getByRole('link').tap()
  await expect(page).toHaveURL(/\/markets\/demo-smsn-usdc$/)
  await expect(page.getByTestId('quote-price')).toHaveText('1,716,825 KRW')
  await page.goBack()
  await expect(page).toHaveURL(/\/markets\/category\/stocks$/)
  await expect(samsung.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/markets/category/unknown')
  await expect(page).toHaveURL(/\/markets$/)
  await page.goto('/settings')
  await page.locator('#data-state').selectOption('error')
  await page.getByRole('link', { name: 'Open Markets', exact: true }).tap()
  await page.getByRole('tab', { name: 'Korea', exact: true }).tap()
  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.getByTestId('card-price')).toHaveCount(0)
  await page.getByRole('button', { name: 'Retry', exact: true }).tap()
  await expect(page.getByTestId('card-price')).toHaveCount(4)
})

test('price guide is a scrollable mobile sheet with units, source links and focus return', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/markets')
  const trigger = page.getByRole('button', { name: 'Price guide', exact: true })
  await trigger.tap()
  const sheet = page.getByRole('dialog', { name: 'Price guide', exact: true })
  await expect(sheet).toBeVisible()
  await expect(sheet).toContainText('native token or contract price × display FX rate')
  await expect(sheet).toContainText('USD/bbl')
  await expect(sheet).toContainText('USDT')
  await expect(sheet.getByRole('link')).toHaveCount(5)
  const bounds = await sheet.boundingBox()
  expect(bounds!.x).toBe(0)
  expect(bounds!.width).toBe(320)
  expect(bounds!.y + bounds!.height).toBeCloseTo(568, 0)
  expect(bounds!.height).toBeLessThanOrEqual(568 * .85 + 1)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await sheet.getByRole('link').last().focus()
  expect(await sheet.locator('.price-guide-content').evaluate(node => node.scrollTop)).toBeGreaterThan(0)
  await sheet.getByRole('button', { name: 'Close', exact: true }).tap()
  await expect(sheet).toHaveCount(0)
  await expect(trigger).toBeFocused()
  // Native close fires asynchronously; wait for React's unmount cleanup.
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  await trigger.tap()
  await page.keyboard.press('Escape')
  await expect(sheet).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await trigger.click()
  const desktopBounds = await sheet.boundingBox()
  expect(desktopBounds!.width).toBeLessThanOrEqual(560)
  expect(desktopBounds!.x).toBeGreaterThan(0)
})
