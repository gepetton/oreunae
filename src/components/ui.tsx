import type { ReactNode } from 'react'
import { usePreferences } from '../lib/preferences-context'
import type { Market } from '../lib/market-data'

export function Icon({
  name,
  className = '',
}: {
  name: string
  className?: string
}) {
  return (
    <svg className={`ob-icon ${className}`} aria-hidden="true">
      <use href={`/assets/icons/sprite.svg#${name}`} />
    </svg>
  )
}
export function SampleBadge() {
  const { t } = usePreferences()
  return (
    <span className="ob-badge sample-badge inline-flex gap-1.5 items-center font-medium whitespace-nowrap">
      <span className="sample-dot w-1 h-1 rounded-full bg-muted max-md:hidden" />
      {t('sampleData')}
    </span>
  )
}
export function SaveButton({
  market,
  label = false,
  primary = false,
}: {
  market: Pick<Market, 'id' | 'name' | 'symbol'>
  label?: boolean
  primary?: boolean
}) {
  const { saved, toggleSaved, t, locale } = usePreferences()
  const active = saved.includes(market.id)
  return (
    <button
      type="button"
      className={`ob-button save-button ${label ? '' : 'icon-button'} ${primary ? 'primary save-full' : ''} ${active ? 'is-saved' : ''}`}
      aria-label={`${t(active ? 'removeFromWatchlist' : 'saveToWatchlist')} · ${market.name[locale]} · ${market.symbol}`}
      aria-pressed={active}
      onClick={() => toggleSaved(market.id)}
    >
      <Icon name={active ? 'check' : 'star'} />
      {label && (
        <span>
          {t(active ? 'saved' : primary ? 'saveToWatchlist' : 'save')}
        </span>
      )}
    </button>
  )
}
export function MarketAvatar({ market }: { market: Market }) {
  return (
    <span
      className={`market-avatar avatar-${market.category}`}
      aria-hidden="true"
    >
      {market.symbol[0]}
    </span>
  )
}
export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon bg-surface-subtle w-17 h-17 rounded-[20px] grid place-items-center text-positive mb-1">
        <Icon name={icon} />
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}
