import Decimal from 'decimal.js'
import marketFixture from '../data/markets.json' with { type: 'json' }
import historyFixture from '../data/history.json' with { type: 'json' }
import macroFixture from '../data/macro.json' with { type: 'json' }
import displayRates from '../data/display-rates.json' with { type: 'json' }

export type Locale = 'en' | 'ko'
export type DisplayCurrency = 'KRW' | 'USD'
export type Period = '1H' | '24H' | '1W' | '1M' | '1Y'
export type DataState = 'demo' | 'loading' | 'error' | 'unavailable' | 'stale'
export interface Market {
  id: string
  symbol: string
  quote: string
  name: Record<Locale, string>
  kind: string
  category: string
  price: string
  prev24h: string
  high24h: string
  low24h: string
  asOf: string
  demo: boolean
  sourceStatus: string
  displayDecimals?: number
  source: { name: string; url: string; basis: string } | null
}
export interface Point { time: string; value: string }
export const markets: Market[] = marketFixture.markets
export const macroIndicators = macroFixture.indicators
export const periods: Period[] = ['1H', '24H', '1W', '1M', '1Y']
export const categories = ['all', 'us', 'korea', 'crypto', 'commodities'] as const
export type Category = typeof categories[number]
const history: Record<string, { intraday: Point[]; daily: Point[] }> = historyFixture.series
export const change24h = (market: Market) => new Decimal(market.price).div(market.prev24h).minus(1).times(100).toDecimalPlaces(2).toNumber()
export const priceDirection = (change: number) => change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
export function formatNumber(value: string | number, locale: Locale, decimals = 2) {
  return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(value))
}
export function marketCurrency(market: Market): DisplayCurrency {
  return market.category === 'korea' ? 'KRW' : 'USD'
}
export function currencyUnit(currency: DisplayCurrency, locale: Locale) {
  return currency === 'KRW' && locale === 'ko' ? '원' : currency
}
export function displayRate(market: Market) {
  if (market.quote === marketCurrency(market)) return '1'
  return displayRates.rates[marketCurrency(market)]
}
export function convertPrice(market: Market, value: string | number) {
  return new Decimal(value).times(displayRate(market)).toFixed()
}
export function formatMarketPrice(market: Market, value: string | number, locale: Locale, decimals = market.displayDecimals ?? (marketCurrency(market) === 'KRW' ? 0 : 2)) {
  const converted = new Decimal(convertPrice(market, value)).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP)
  return formatNumber(converted.toFixed(decimals), locale, decimals)
}
export function formatChange(market: Market, locale: Locale) {
  const value = change24h(market)
  return `${value < 0 ? '−' : value > 0 ? '+' : ''}${formatNumber(Math.abs(value), locale)}%`
}
export function seriesFor(marketId: string, period: Period): Point[] {
  const source = history[marketId]
  const points = period === '1H' || period === '24H' ? source.intraday : source.daily
  const duration = { '1H': 3600000, '24H': 86400000, '1W': 7 * 86400000, '1M': 30 * 86400000, '1Y': 365 * 86400000 }[period]
  const cutoff = Date.parse(points.at(-1)!.time) - duration
  return points.filter(point => Date.parse(point.time) >= cutoff)
}
export function formatTime(time: string, locale: Locale, timezone: string, includeDate = false) {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', {
    timeZone: timezone,
    ...(includeDate ? { year: 'numeric', month: 'short', day: 'numeric' } as const : {}),
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(new Date(time))
}
