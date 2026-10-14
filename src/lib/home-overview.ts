import Decimal from 'decimal.js'
import fixture from '../data/home-overview.json' with { type: 'json' }
import { formatNumber } from './market-data'
import type { Locale } from './market-data'

export interface OverviewItem {
  id: string
  kind: 'oil' | 'gas' | 'yield' | 'pre-ipo'
  name: Record<Locale, string>
  value: string
  previous: string
  history: number[]
  source?: string
  url?: string
  pair?: string
  contract?: string
  symbol?: string
  candidate?: boolean
}

export const indicators = fixture.indicators as OverviewItem[]
export const preIpo = fixture.preIpo as OverviewItem[]
export const sampleUsdtToUsd = fixture.sampleUsdtToUsd

export function overviewChange(item: OverviewItem) {
  const current = new Decimal(item.value), previous = new Decimal(item.previous)
  return (item.kind === 'yield'
    ? current.minus(previous).times(100)
    : current.div(previous).minus(1).times(100)).toDecimalPlaces(2).toNumber()
}

export function overviewPrice(item: OverviewItem, locale: Locale) {
  // USDT contracts use their own explicit demo FX; the original markets use USDC.
  const value = new Decimal(item.value).times(item.pair?.endsWith('/USDT') ? sampleUsdtToUsd : 1)
  return formatNumber(value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2), locale)
}

export function overviewChangeLabel(item: OverviewItem, locale: Locale) {
  const change = overviewChange(item)
  const decimals = item.kind === 'yield' && Number.isInteger(change) ? 0 : 2
  return `${change < 0 ? '−' : change > 0 ? '+' : ''}${formatNumber(Math.abs(change), locale, decimals)}${item.kind === 'yield' ? ' bp' : '%'}`
}
