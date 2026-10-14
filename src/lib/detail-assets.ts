import Decimal from 'decimal.js'
import { indicators, preIpo, sampleUsdtToUsd } from './home-overview'
import type { OverviewItem } from './home-overview'
import { displayRate, formatNumber, macroIndicators, marketCurrency, markets, seriesFor } from './market-data'
import type { Locale, Market, Period } from './market-data'
import type { TextKey } from './preferences-context'
import en from '../locales/en.json' with { type: 'json' }
import ko from '../locales/ko.json' with { type: 'json' }
import indexFixture from '../data/market-indices.json' with { type: 'json' }
import type { OreunaeIconName } from '../components/icons/OreunaeIcon'

const indexIcons: Record<string, OreunaeIconName> = {
  'demo-sp500': 'market-index', 'demo-nasdaq100': 'market-index', 'demo-kospi': 'market-index',
  'demo-dow': 'market-index', 'demo-russell2000': 'market-index',
  'demo-dollar-index': 'dollar-index', 'demo-vix': 'volatility',
  'demo-fear-greed': 'sentiment', 'demo-buffett': 'valuation',
}
const macroIcons: Record<string, OreunaeIconName> = {
  'demo-us-cpi-yoy': 'cpi-basket', 'demo-us-core-cpi-yoy': 'cpi-basket', 'demo-kr-cpi-yoy': 'cpi-basket',
  'demo-us-pce-yoy': 'pce-wallet', 'demo-us-core-pce-yoy': 'pce-wallet',
  'demo-us-unemployment': 'employment', 'demo-us-participation': 'employment', 'demo-us-wage-yoy': 'wages',
  'demo-bok-policy': 'policy-rate', 'demo-us-effr': 'short-rate', 'demo-us-sofr': 'short-rate',
}

export type AssetPeriod = Period | '1D' | '3M' | '6M' | 'ALL' | 'sample'
export interface DetailAsset {
  id: string
  name: Record<Locale, string>
  symbol: string
  icon: string
  category: TextKey
  unit: string
  currency: string
  decimals: number
  price: string
  previous: string
  rate: string
  changeUnit: '%' | 'bp' | '%p' | 'pt'
  basis?: TextKey
  market?: Market
  overview?: OverviewItem
  macro?: typeof macroIndicators[number]
  index?: typeof indexFixture.indices[number]
}

export const detailAssets: DetailAsset[] = [
  ...indexFixture.indices.map(index => ({
    id: index.id, name: index.name, symbol: index.symbol, icon: indexIcons[index.id] ?? 'market-index',
    category: index.category as TextKey, unit: index.unit, currency: index.unit, decimals: index.decimals,
    price: index.value, previous: index.previous, rate: '1', changeUnit: index.changeUnit as DetailAsset['changeUnit'],
    basis: index.basis as TextKey, index,
  })),
  ...markets.map(market => ({
    id: market.id, name: market.name, symbol: market.symbol, icon: market.symbol === 'GOLD' ? 'gold-bars' : market.symbol,
    category: (market.category === 'korea' ? 'koreanStocks' : market.category === 'us' ? 'usStocks' : market.category) as TextKey,
    unit: marketCurrency(market), currency: marketCurrency(market), decimals: market.displayDecimals ?? (marketCurrency(market) === 'KRW' ? 0 : 2),
    price: market.price, previous: market.prev24h, rate: displayRate(market), changeUnit: '%' as const, market,
  })),
  ...[...indicators, ...preIpo].map(overview => ({
    id: overview.id, name: overview.name,
    symbol: overview.symbol ?? overview.pair?.split('/')[0] ?? ({ 'wti-spot': 'WTI', 'brent-spot': 'BRENT', 'dubai-spot': 'DUBAI', 'us-treasury-10y': 'US10Y', 'us-treasury-2y': 'US2Y', 'us-treasury-30y': 'US30Y', 'us-treasury-3m': 'US3M', 'us-treasury-6m': 'US6M', 'us-treasury-1y': 'US1Y', 'us-treasury-5y': 'US5Y', 'us-treasury-20y': 'US20Y' }[overview.id]!),
    icon: overview.kind === 'oil' ? 'oil-barrel' : overview.kind === 'yield' ? 'treasury' : overview.kind === 'gas' ? 'natural-gas' : overview.symbol ?? overview.pair?.split('/')[0] ?? 'market-index',
    category: (overview.kind === 'pre-ipo' ? 'preIpo' : overview.kind === 'oil' ? 'oilIndicator' : overview.kind === 'gas' ? 'naturalGasIndicator' : 'treasuryIndicator') as TextKey,
    unit: overview.kind === 'yield' ? '%' : overview.kind === 'oil' ? 'USD/bbl' : overview.kind === 'gas' ? 'USD/MMBtu' : 'USD',
    currency: overview.kind === 'yield' ? '%' : 'USD', decimals: 2,
    price: overview.value, previous: overview.previous, rate: overview.pair?.endsWith('/USDT') ? sampleUsdtToUsd : '1',
    changeUnit: (overview.kind === 'yield' ? 'bp' : '%') as DetailAsset['changeUnit'],
    basis: overview.candidate ? 'candidateBasis' as const : overview.id === 'dubai-spot' ? 'dubaiBasis' as const : overview.kind === 'gas' ? 'naturalGasBasis' as const : undefined, overview,
  })),
  ...macroIndicators.map(macro => ({
    id: macro.id, name: { en: en[macro.nameKey as keyof typeof en], ko: ko[macro.nameKey as keyof typeof ko] },
    symbol: macro.symbol, icon: macroIcons[macro.id] ?? 'market-pulse', basis: macro.basisKey as TextKey,
    category: macro.definitionKey as TextKey, unit: '%', currency: '%', decimals: macro.displayDecimals,
    price: macro.value, previous: String(macro.history.at(-2)), rate: '1',
    changeUnit: macro.changeUnit as DetailAsset['changeUnit'], macro,
  })),
]

export function assetUnit(asset: DetailAsset, locale: Locale) {
  if (asset.unit === 'score') return locale === 'ko' ? '점' : 'pts'
  return asset.unit === 'KRW' && locale === 'ko' ? '원' : asset.unit
}
export function assetPair(asset: DetailAsset) {
  if (asset.market?.sourceStatus === 'candidate') return asset.symbol
  return asset.market ? `${asset.symbol}/${asset.market.quote}` : asset.overview?.pair ?? asset.symbol
}
export function assetValue(asset: DetailAsset, value: string | number, locale: Locale, decimals = asset.decimals) {
  return formatNumber(new Decimal(value).times(asset.rate).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed(decimals), locale, decimals)
}
export function assetChange(asset: DetailAsset) {
  const value = new Decimal(asset.price), previous = new Decimal(asset.previous)
  return (asset.changeUnit === '%' ? value.div(previous).minus(1).times(100) : value.minus(previous).times(asset.changeUnit === 'bp' ? 100 : 1)).toDecimalPlaces(2).toNumber()
}
export function assetChangeLabel(asset: DetailAsset, locale: Locale) {
  const change = assetChange(asset)
  const unit = asset.changeUnit === '%p' && locale === 'en' ? 'pp' : asset.changeUnit === 'pt' && locale === 'ko' ? '점' : asset.changeUnit
  const decimals = ['bp', 'pt'].includes(asset.changeUnit) && Number.isInteger(change) ? 0 : 2
  return `${change < 0 ? '−' : change > 0 ? '+' : ''}${formatNumber(Math.abs(change), locale, decimals)}${unit === '%' ? '' : ' '}${unit}`
}
export function assetAbsoluteChange(asset: DetailAsset, locale: Locale) {
  if (asset.changeUnit !== '%') return assetChangeLabel(asset, locale)
  const delta = new Decimal(asset.price).minus(asset.previous)
  return `${delta.isNegative() ? '−' : delta.isPositive() ? '+' : ''}${assetValue(asset, delta.abs().toFixed(), locale)}`
}
export function assetSeries(asset: DetailAsset, period: AssetPeriod = '24H'): { value: string; time?: string }[] {
  if (asset.market) {
    const points = seriesFor(asset.id, period === '1D' || period === 'sample' ? '24H' : period === '3M' || period === '6M' || period === 'ALL' ? '1Y' : period)
    if (period !== '3M' && period !== '6M') return points
    const cutoff = Date.parse(points.at(-1)!.time) - (period === '3M' ? 90 : 180) * 86400000
    return points.filter(point => Date.parse(point.time) >= cutoff)
  }
  const history = asset.index?.history ?? asset.overview?.history ?? asset.macro!.history
  if (period === 'sample' || period === '24H' || period === '1H') return history.map(value => ({ value: String(value) }))

  // Fixture-only timeline: the selected range changes the sample window, never an actual observation date.
  const release = !!asset.macro && asset.changeUnit !== 'bp'
  const count = release ? { '1D': 3, '1W': 3, '1M': 3, '3M': 3, '6M': 6, '1Y': history.length, 'ALL': history.length }[period] : { '1D': 6, '1W': 8, '1M': 10, '3M': 11, '6M': history.length, '1Y': history.length, 'ALL': history.length }[period]
  const duration = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 365 }[period] * 86400000
  const values = history.slice(-Math.min(history.length, count))
  const end = Date.parse('2026-09-12T21:42:08Z')
  return values.map((value, index) => ({
    value: String(value),
    time: new Date(end - duration + duration * index / Math.max(values.length - 1, 1)).toISOString(),
  }))
}
export function relatedAssets(asset: DetailAsset) {
  const others = detailAssets.filter(item => item.id !== asset.id)
  if (asset.market) return others.filter(item => item.market).sort((a, b) => Number(b.market?.category === asset.market!.category) - Number(a.market?.category === asset.market!.category)).slice(0, 3)
  if (asset.index) return others.filter(item => item.index || item.symbol === 'GOLD').slice(0, 3)
  if (asset.overview?.kind === 'oil' || asset.overview?.kind === 'gas') return [...others.filter(item => item.overview?.kind === 'oil' || item.overview?.kind === 'gas').slice(0, 3), ...others.filter(item => item.symbol === 'GOLD').slice(0, 1)]
  // Show comparable series/contracts first, followed by the other macro context.
  const peers = others.filter(item => asset.macro ? item.macro : item.overview?.kind === asset.overview?.kind)
  const context = others.filter(item => !peers.includes(item) && (asset.overview?.kind === 'pre-ipo' ? item.market?.category === 'us' || item.market?.category === 'korea' : item.overview?.kind === 'yield' || item.overview?.kind === 'oil' || item.macro))
  return [...peers, ...context].slice(0, 3)
}
