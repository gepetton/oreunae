import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assetAbsoluteChange, assetChangeLabel, assetPair, assetSeries, assetUnit, assetValue, detailAssets } from '../src/lib/detail-assets'

const expandedAssets = detailAssets.filter(asset => !asset.market)
test.use({ hasTouch: true })

test('added mock assets keep candidate units, precision and release change units', () => {
  const byId = (id: string) => detailAssets.find(asset => asset.id === id)!
  const candidate = byId('demo-sk-hynix')
  expect(assetPair(candidate)).toBe('000660')
  expect(candidate.market?.source).toBeNull()
  expect(assetValue(candidate, candidate.price, 'ko')).toBe('189,500')
  expect(assetValue(candidate, candidate.price, 'en')).toBe('189,500')
  const ipo = byId('demo-spacex-candidate')
  expect(ipo.overview?.candidate).toBe(true)
  expect(ipo.overview?.pair).toBeUndefined()
  expect(ipo.overview?.contract).toBeUndefined()
  expect(assetValue(ipo, ipo.price, 'en')).toBe('215.00')
  expect(assetValue(byId('demo-xrp-usdc'), '0.5842', 'en')).toBe('0.5841')
  expect(assetChangeLabel(byId('demo-us-unemployment'), 'ko')).toBe('−0.10 %p')
  expect(assetChangeLabel(byId('demo-us-sofr'), 'en')).toBe('−1 bp')
  for (const asset of detailAssets) {
    const points = assetSeries(asset)
    expect(points.length).toBeGreaterThan(1)
    expect(Number(points.at(-1)!.value)).toBe(Number(asset.price))
  }
})

test('expanded asset math preserves USDT conversion, oil units, bp and percentage points', () => {
  const byId = (id: string) => detailAssets.find(asset => asset.id === id)!
  const openai = byId('openai-pre-ipo'), wti = byId('wti-spot'), treasury = byId('us-treasury-10y')
  expect(assetPair(openai)).toBe('OPENAI/USDT')
  expect(assetValue(openai, openai.price, 'ko')).toBe('620.12')
  expect(assetAbsoluteChange(openai, 'ko')).toBe('+20.00')
  expect(assetUnit(wti, 'ko')).toBe('USD/bbl')
  expect(assetAbsoluteChange(wti, 'ko')).toBe('+1.60')
  expect(assetChangeLabel(wti, 'ko')).toBe('+2.08%')
  expect(assetChangeLabel(treasury, 'ko')).toBe('−4 bp')
  expect(assetChangeLabel(byId('demo-us-cpi-yoy'), 'ko')).toBe('−0.20 %p')
  expect(assetChangeLabel(byId('demo-us-cpi-yoy'), 'en')).toBe('−0.20 pp')
  expect(assetChangeLabel(byId('demo-bok-policy'), 'ko')).toBe('−25 bp')
  expect(assetUnit(byId('dubai-spot'), 'ko')).toBe('USD/bbl')
  expect(assetChangeLabel(byId('dubai-spot'), 'ko')).toBe('+0.89%')
  expect(assetChangeLabel(byId('us-treasury-30y'), 'ko')).toBe('+3 bp')
  expect(assetValue(byId('demo-buffett'), '186.4', 'ko')).toBe('186.4')
  expect(assetUnit(byId('demo-buffett'), 'ko')).toBe('%')
  expect(assetChangeLabel(byId('demo-buffett'), 'ko')).toBe('+1.60 %p')
  expect(assetChangeLabel(byId('demo-buffett'), 'en')).toBe('+1.60 pp')
  expect(assetUnit(byId('demo-fear-greed'), 'ko')).toBe('점')
  expect(assetChangeLabel(byId('demo-fear-greed'), 'ko')).toBe('+5 점')
  expect(assetChangeLabel(byId('demo-fear-greed'), 'en')).toBe('+5 pt')
  expect(assetSeries(byId('demo-fear-greed')).every(point => Number(point.value) >= 0 && Number(point.value) <= 100)).toBe(true)
  for (const asset of expandedAssets) {
    const history = assetSeries(asset)
    expect(history.every(point => point.time === undefined)).toBe(true)
    expect(Number(history.at(-1)!.value)).toBe(Number(asset.price))
  }
})

for (const theme of ['light', 'dark']) for (const locale of ['ko', 'en'] as const) {
  test(`all added details fit mobile and desktop: ${theme} ${locale}`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.addInitScript(({ theme, locale }) => {
      localStorage.setItem('oreunae:theme', theme)
      localStorage.setItem('oreunae:locale', locale)
    }, { theme, locale })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      for (const asset of expandedAssets) {
        await page.goto(`/markets/${asset.id}`)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(asset.name[locale])
        await expect(page.getByTestId('quote-price')).toHaveText(`${assetValue(asset, asset.price, locale)} ${assetUnit(asset, locale)}`)
        await expect(page.locator('.detail-market-pair')).toHaveText(assetPair(asset))
        const initialPeriod = asset.macro && asset.changeUnit !== 'bp' ? '1Y' : '1D'
        await expect(page.locator('.price-chart')).toHaveAttribute('data-point-count', `${assetSeries(asset, initialPeriod).length}`)
        await expect(page.locator('.price-chart')).toHaveAttribute('data-period', initialPeriod)
        await expect(page.locator('.price-chart')).toHaveAttribute('data-start', /202[0-9]-/)
        await expect(page.locator('.detail-stats > div')).toHaveCount(asset.changeUnit === '%' && !asset.macro ? 4 : 2)
        await expect(page.getByRole('dialog')).toHaveCount(0)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        const clipped = await page.locator('[data-testid="quote-price"], .detail-stats dd, .detail-related-card strong').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent))
        expect(clipped, `${asset.id} ${width}px`).toEqual([])
      }
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/markets/us-treasury-10y')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(',')}`)).toEqual([])
    expect(errors).toEqual([])
  })
}

test('every overview card routes to a real detail and saves through reload without losing browser history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 })
  for (const asset of expandedAssets.filter(item => item.overview)) {
    const category = asset.overview?.kind === 'pre-ipo' ? 'pre-ipo' : 'indicators'
    await page.goto(`/markets/category/${category}`)
    await page.locator(`[data-overview-id="${asset.id}"]`).tap()
    await expect(page).toHaveURL(`/markets/${asset.id}`)
    await expect(page.locator('.asset-detail')).toBeVisible()
    await page.locator('.mobile-header-save button').tap()
    await expect(page.locator('.mobile-header-save button')).toHaveAttribute('aria-pressed', 'true')
    await page.reload()
    await expect(page.locator('.mobile-header-save button')).toHaveAttribute('aria-pressed', 'true')
    await page.goBack()
    await expect(page).toHaveURL(`/markets/category/${category}`)
  }
  for (const asset of expandedAssets.filter(item => item.macro)) {
    await page.goto('/macro')
    await page.locator(`.macro-card[href="/markets/${asset.id}"]`).tap()
    await expect(page).toHaveURL(`/markets/${asset.id}`)
    await page.locator('.mobile-header-save button').tap()
    const chart = page.getByRole('slider')
    await chart.focus()
    await chart.press('Home')
    await expect(chart).toHaveAttribute('aria-valuenow', '0')
    await chart.press('End')
    await expect(chart).toHaveAttribute('aria-valuetext', /Sample data/)
    await page.locator('.detail-price-guide').tap()
    await expect(page.getByRole('dialog')).toContainText('Not provided in this demo')
    await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page.goto('/saved')
  await page.reload()
  await expect(page.locator('.saved-list .market-row')).toHaveCount(10)
  const rows = page.locator('.saved-list .market-row')
  await expect(rows.filter({ hasText: 'OPENAI' }).locator('.row-price')).toHaveText('$620.12')
  await expect(rows.filter({ hasText: 'WTI' }).locator('.row-price')).toHaveText('$78.40/bbl')
  await expect(rows.filter({ hasText: 'US10Y' }).locator('.row-price')).toHaveText('4.12%')
  await expect(rows.filter({ hasText: 'CPI' }).locator('.row-change')).toHaveText('−0.20 pp')
  await expect(rows.filter({ hasText: 'BOK' }).locator('.row-change')).toHaveText('−25 bp')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await rows.filter({ hasText: 'OPENAI' }).getByRole('button').tap()
  await page.reload()
  await expect(page.locator('.saved-list .market-row')).toHaveCount(9)
})

test('new detail states hide unavailable prices, charts and saved values, then retry restores examples', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('oreunae:saved', JSON.stringify(['openai-pre-ipo', 'wti-spot', 'us-treasury-10y'])))
  for (const id of ['openai-pre-ipo', 'wti-spot', 'us-treasury-10y']) {
    for (const state of ['loading', 'error', 'unavailable', 'stale']) {
      await page.goto('/settings')
      await page.locator('#data-state').selectOption(state)
      await page.getByRole('link', { name: 'Open Markets' }).tap()
      if (id === 'openai-pre-ipo') await page.getByRole('tab', { name: 'Pre-IPO', exact: true }).tap()
      await page.locator(`[data-overview-id="${id}"]`).tap()
      if (state === 'stale') {
        await expect(page.getByTestId('quote-price')).toBeVisible()
        await expect(page.locator('.state-notice')).toBeVisible()
      } else {
        await expect(page.getByTestId('quote-price')).toHaveCount(0)
        await expect(page.locator('.price-chart, .detail-related-card .sparkline')).toHaveCount(0)
        await expect(page.locator('.detail-stats dd').first()).toHaveText('—')
        await page.locator('.detail-price-guide').tap()
        await expect(page.getByRole('dialog').locator('.provenance')).not.toContainText(id === 'openai-pre-ipo' ? '620.00 USDT' : id === 'wti-spot' ? '78.40 USD/bbl' : '4.12 %')
        await page.keyboard.press('Escape')
        if (state !== 'loading') {
          await page.getByRole('button', { name: 'Retry', exact: true }).tap()
          await expect(page.getByTestId('quote-price')).toBeVisible()
        }
      }
    }
  }
  await page.goto('/settings')
  await page.locator('#data-state').selectOption('unavailable')
  await page.getByRole('link', { name: 'Open Markets' }).tap()
  await page.locator('header').getByRole('link', { name: 'Saved', exact: true }).tap()
  await expect(page.locator('.saved-list .row-price')).toHaveText(['—', '—', '—'])
  await expect(page.locator('.saved-list .sparkline')).toHaveCount(0)
})
