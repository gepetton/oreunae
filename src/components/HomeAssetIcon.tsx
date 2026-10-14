import { Icon } from './ui'
import { OreunaeBadge } from './icons/OreunaeIcon'
import type { OreunaeIconName } from './icons/OreunaeIcon'

const brands: Record<string, string> = {
  SMSN: 'samsung', NVDA: 'nvidia', BTC: 'bitcoin', OPENAI: 'openai', ANTHROPIC: 'anthropic',
  '005380': 'hyundai', '035420': 'naver', AAPL: 'apple', TSLA: 'tesla', AMZN: 'amazon',
  ETH: 'ethereum', SOL: 'solana', XRP: 'ripple', SPACEX: 'spacex', DATABRICKS: 'databricks',
}

const monograms: Record<string, string> = {
  '000660': 'SK', MSFT: 'M',
}

const indicatorIcons = new Set<OreunaeIconName>([
  'oil-barrel', 'natural-gas', 'gold-bars', 'treasury', 'dollar-index', 'market-index',
  'volatility', 'sentiment', 'valuation', 'cpi-basket', 'pce-wallet', 'employment',
  'wages', 'policy-rate', 'short-rate', 'market-pulse',
])

export function HomeAssetIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const brand = brands[symbol]
  if (!brand && indicatorIcons.has(symbol as OreunaeIconName)) {
    return <OreunaeBadge name={symbol as OreunaeIconName} size={size} glyphSize={size >= 48 ? 32 : size >= 32 ? 21 : 16} className="home-asset-icon is-semantic" aria-hidden="true" />
  }
  return (
    <span className={`home-asset-icon ${brand ? `is-brand asset-${brand}` : `is-semantic asset-${symbol.toLowerCase()}`}`} aria-hidden="true">
      {brand ? <img src={`/assets/market-icons/${brand}.svg`} alt="" width="24" height="24" />
        : monograms[symbol] ? <span className="home-asset-monogram font-bold leading-none">{monograms[symbol]}</span>
        : <Icon name="chart-no-axes-column-increasing" />}
    </span>
  )
}
