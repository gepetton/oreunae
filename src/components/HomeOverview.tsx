import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { indicators, overviewChange, overviewChangeLabel, overviewPrice, preIpo } from '../lib/home-overview'
import type { OverviewItem } from '../lib/home-overview'
import type { DetailAsset } from '../lib/detail-assets'
import { assetAbsoluteChange, assetChange, assetChangeLabel, assetUnit, assetValue, detailAssets } from '../lib/detail-assets'
import { markets, priceDirection } from '../lib/market-data'
import { usePreferences } from '../lib/preferences-context'
import { useTouchFeedback } from '../lib/use-touch-feedback'
import { useScrollNavigation } from '../lib/use-scroll-navigation'
import { MarketGrid } from './MarketPanels'
import { Icon, SampleBadge } from './ui'
import { HomeAssetIcon } from './HomeAssetIcon'
import { OreunaeIcon } from './icons/OreunaeIcon'
import type { TextKey } from '../lib/preferences-context'

function OverviewCards({ items, compact = false }: { items: OverviewItem[]; compact?: boolean }) {
  const { locale, t, dataState } = usePreferences()
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  return (
    <div className={compact ? 'home-indicator-grid grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3' : 'home-asset-grid'}>
      {items.map(item => {
        const change = overviewChange(item), direction = priceDirection(change)
        const value = overviewPrice(item, locale)
        const asset = detailAssets.find(asset => asset.id === item.id)!
        return (
          <Link
            to={`/markets/${item.id}`}
            key={item.id}
            className={`ob-card overview-card text-left w-full ${compact ? 'home-indicator-card' : 'home-asset-card home-preipo-card'}`}
            data-overview-id={item.id}
            aria-label={`${item.name[locale]} · ${t('mobileDetail')}`}
          >
            <span className={compact ? 'home-indicator-content' : 'home-asset-link'}>
              {compact ? <span className="home-indicator-name">
                <HomeAssetIcon symbol={asset.icon} />
                <span title={item.name[locale]}>{item.name[locale]}</span>
              </span> : <>
                <HomeAssetIcon symbol={item.symbol ?? item.pair!.split('/')[0]} />
                <span className="home-asset-identity">
                  <span className="home-asset-name" title={item.name[locale]}>{item.name[locale]}</span>
                  <span className="home-card-ticker">{item.candidate ? t('candidate') : item.pair!.replace('/', ' · ')}</span>
                </span>
              </>}
              <span className={compact ? 'home-indicator-bottom' : 'home-asset-quote'}>
              {noValue ? (
                <span className="home-empty-value">— <span>{t(dataState as 'loading' | 'error' | 'unavailable')}</span></span>
              ) : (
                <span className="home-price-stack">
                  <span className={`home-card-value numerals ${value.length > 7 ? 'is-long' : ''}`} data-testid="overview-price">
                    {value}{!compact && <span className="sr-only"> {assetUnit(asset, locale)}</span>}
                  </span>
                  <span className={`market-${direction} home-card-change numerals`} data-testid="overview-change">
                    {item.kind !== 'yield' && <span className="home-card-delta"><span className="sr-only">{t('valueChange')} </span>{assetAbsoluteChange(asset, locale)}</span>}
                    <span className={item.kind !== 'yield' ? 'home-card-rate' : undefined}>{overviewChangeLabel(item, locale)}</span>
                  </span>
                </span>
              )}
              </span>
            </span>
            {!compact && <span className={`home-period-badge${item.candidate ? ' is-candidate' : ''}`}>{item.candidate ? t('sampleData') : '24H'}</span>}
            {!compact && <Icon name="chevron-right" className="home-card-chevron" />}
          </Link>
        )
      })}
    </div>
  )
}

const indicatorGroups = [
  { section: 'oil', title: 'internationalOil', ids: ['wti-spot', 'brent-spot', 'dubai-spot', 'henry-hub-gas'] },
  { section: 'treasury', title: 'usTreasuryRates', ids: ['us-treasury-2y', 'us-treasury-5y', 'us-treasury-10y', 'us-treasury-30y', 'us-treasury-3m', 'us-treasury-6m', 'us-treasury-1y', 'us-treasury-20y'] },
  { section: 'rates-commodities', title: 'commoditiesDollar', ids: ['demo-dollar-index', 'demo-gold-usdc'] },
  { section: 'monetary-policy', title: 'monetaryPolicy', ids: ['demo-us-effr', 'demo-us-sofr', 'demo-bok-policy'] },
  { section: 'indices', title: 'majorIndices', ids: ['demo-sp500', 'demo-nasdaq100', 'demo-kospi', 'demo-dow', 'demo-russell2000'] },
  { section: 'sentiment-valuation', title: 'sentimentValuation', ids: ['demo-vix', 'demo-fear-greed', 'demo-buffett'] },
  { section: 'inflation', title: 'inflation', ids: ['demo-us-cpi-yoy', 'demo-us-core-cpi-yoy', 'demo-us-core-pce-yoy', 'demo-us-pce-yoy', 'demo-kr-cpi-yoy'] },
  { section: 'employment', title: 'employment', ids: ['demo-us-unemployment', 'demo-us-wage-yoy', 'demo-us-participation'] },
] as const

const expandedSectionsKey = 'oreunae:expanded-indicators'
const homePreviewCount = 4
function readExpandedSections(): string[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(expandedSectionsKey) ?? '[]')
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string' && (indicatorGroups.some(group => group.section === item) || homeTabs.some(tab => tab.id === item))) : []
  } catch { return [] }
}

const homeSections = ['indicators', 'pre-ipo', 'stocks', 'other-assets', 'market-snapshot', ...indicatorGroups.map(group => group.section)] as const
type HomeSection = typeof homeSections[number]
const sectionTitles: Record<HomeSection, TextKey> = {
  indicators: 'keyIndicators', 'pre-ipo': 'preIpo', stocks: 'stocks', 'other-assets': 'globalAssets', 'market-snapshot': 'marketSnapshot',
  oil: 'internationalOil', treasury: 'usTreasuryRates', indices: 'majorIndices', 'sentiment-valuation': 'sentimentValuation', inflation: 'inflation', employment: 'employment', 'monetary-policy': 'monetaryPolicy', 'rates-commodities': 'commoditiesDollar',
}

function IndicatorTiles({ assets }: { assets: DetailAsset[] }) {
  const { t, locale, dataState } = usePreferences()
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  return <div className="macro-tile-grid">
    {assets.map(asset => {
      const direction = priceDirection(assetChange(asset)), value = assetValue(asset, asset.price, locale)
      const releaseBased = Boolean(asset.macro)
      return <Link key={asset.id} to={`/markets/${asset.id}`} className="macro-tile" data-overview-id={asset.overview ? asset.id : undefined} data-snapshot-id={!asset.overview ? asset.id : undefined} aria-label={`${asset.name[locale]} · ${t('mobileDetail')}`}>
        <span className="macro-tile-identity">
          <span className="macro-tile-icon" aria-hidden="true"><HomeAssetIcon symbol={asset.icon} /></span>
          <span className="macro-tile-label">
            <span className="macro-tile-name" title={asset.name[locale]}>{asset.name[locale]}</span>
            <span className="macro-tile-ticker">{asset.symbol}</span>
          </span>
        </span>
        {noValue ? <span className="home-empty-value">— <span>{t(dataState as 'loading' | 'error' | 'unavailable')}</span></span> : <>
          <span className={`macro-tile-quote ${releaseBased ? 'is-release' : ''}`}>
            <strong className={`macro-tile-price numerals ${value.length > 7 ? 'is-extra-long' : ''}`} data-testid={asset.overview ? 'overview-price' : 'snapshot-price'}>{value}{releaseBased ? <>%{asset.macro?.definitionKey === 'yoy' && <small className="macro-value-basis"> YoY</small>}</> : <span className="sr-only"> {assetUnit(asset, locale)}</span>}</strong>
            <span className={`home-card-change numerals ${releaseBased ? 'text-muted' : `market-${direction}`}`}>
              {(releaseBased || asset.changeUnit === '%') && <span className="home-card-delta"><span className="sr-only">{t('valueChange')} </span>{assetAbsoluteChange(asset, locale)}</span>}
              <span className={!releaseBased && asset.changeUnit === '%' ? 'home-card-rate' : undefined}>{releaseBased ? `${t('previous')} ${assetValue(asset, asset.previous, locale)}%` : assetChangeLabel(asset, locale)}</span>
            </span>
          </span>
        </>}
        <Icon name="chevron-right" className="home-card-chevron" />
      </Link>
    })}
  </div>
}

function IndicatorSection({ group, expanded, onToggle }: { group: typeof indicatorGroups[number]; expanded: boolean; onToggle: () => void }) {
  const assets = group.ids.map(id => detailAssets.find(asset => asset.id === id)!)
  const previewCount = Math.min(assets.length, homePreviewCount)
  return <ExpandableHomeSection section={group.section} title={group.title} indicator hiddenCount={assets.length - previewCount} expanded={expanded} onToggle={onToggle}
    preview={<IndicatorTiles assets={assets.slice(0, previewCount)} />}
    extra={<IndicatorTiles assets={assets.slice(previewCount)} />} />
}

function ExpandableHomeSection({ section, title, indicator = false, hiddenCount, expanded, onToggle, preview, extra }: {
  section: string; title: TextKey; indicator?: boolean; hiddenCount: number; expanded: boolean; onToggle: () => void; preview: ReactNode; extra: ReactNode
}) {
  const { t } = usePreferences()
  const sectionHeading = useRef<HTMLHeadingElement>(null)
  const panelId = `indicator-extra-${section}`
  const toggleLabel = expanded ? t('collapseIndicators') : t('showMoreIndicators').replace('{count}', String(hiddenCount))
  function handleToggle() {
    if (expanded) {
      sectionHeading.current?.focus({ preventScroll: true })
      sectionHeading.current?.scrollIntoView({ block: 'nearest' })
    }
    onToggle()
  }
  return <section className={`home-expandable-section ${indicator ? 'indicator-section' : 'home-asset-section'}`} aria-labelledby={`indicator-heading-${section}`} data-home-section={section}>
    <div className="home-section-heading">
      <h2 ref={sectionHeading} tabIndex={-1} id={`indicator-heading-${section}`}>{t(title)}</h2>
      {hiddenCount > 0 && <button type="button" className="indicator-toggle indicator-toggle-heading" aria-expanded={expanded} aria-controls={panelId} aria-label={`${t(title)} · ${toggleLabel}`} onClick={handleToggle}>{toggleLabel}<Icon name="chevron-down" /></button>}
    </div>
    <div className="home-section-cards">
      {preview}
      {hiddenCount > 0 && <>
        <div id={panelId} className={`indicator-expansion ${expanded ? 'is-expanded' : ''}`} inert={!expanded} aria-hidden={!expanded}>
          <div className="indicator-expansion-inner">{extra}</div>
        </div>
      </>}
    </div>
  </section>
}

const snapshotAssets = ['demo-sp500', 'demo-nasdaq100', 'demo-gold-usdc', 'demo-dollar-index'].map(id => detailAssets.find(asset => asset.id === id)!)

function SnapshotCards() {
  const { t, locale, dataState } = usePreferences()
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  return <div className="snapshot-grid grid gap-2 lg:grid-cols-2">
    {snapshotAssets.map(asset => {
      const change = assetChange(asset), direction = priceDirection(change)
      return <Link key={asset.id} to={`/markets/${asset.id}`} className="ob-card snapshot-card" data-snapshot-id={asset.id} aria-label={`${asset.name[locale]} · ${t('mobileDetail')}`}>
        <HomeAssetIcon symbol={asset.icon} size={30} />
        <span className="snapshot-name" title={asset.name[locale]}>{asset.name[locale]}</span>
        <span className="snapshot-quote numerals">
          {noValue ? <span className="home-empty-value">—</span> : <>
            <strong data-testid="snapshot-price">{assetValue(asset, asset.price, locale)}<span className="sr-only"> {assetUnit(asset, locale)}</span></strong>
            <span className={`home-card-change market-${direction}`}><span aria-hidden="true">{change > 0 ? '▲ ' : change < 0 ? '▼ ' : ''}</span>{assetChangeLabel(asset, locale)}</span>
          </>}
        </span>
        <Icon name="chevron-right" className="snapshot-chevron" />
      </Link>
    })}
  </div>
}

function SectionContent({ section }: { section: HomeSection }) {
  const { t } = usePreferences()
  const group = indicatorGroups.find(item => item.section === section)
  if (group) return <div className="ob-card indicator-section-card"><IndicatorTiles assets={group.ids.map(id => detailAssets.find(asset => asset.id === id)!)} /></div>
  if (section === 'market-snapshot') return <SnapshotCards />
  if (section === 'indicators') return <OverviewCards items={indicators} compact />
  if (section === 'pre-ipo') return <OverviewCards items={preIpo} />
  if (section === 'stocks') return (
    <div className="grid gap-2 xl:grid-cols-2 xl:gap-3">
      <div className="home-stock-group min-w-0" role="group" aria-labelledby="domestic-stocks-label">
        <p id="domestic-stocks-label" className="mb-1 text-[12px] leading-4 font-medium text-muted">{t('domestic')}</p>
        <MarketGrid markets={markets.filter(market => market.category === 'korea')} />
      </div>
      <div className="home-stock-group min-w-0" role="group" aria-labelledby="overseas-stocks-label">
        <p id="overseas-stocks-label" className="mb-1 text-[12px] leading-4 font-medium text-muted">{t('overseas')}</p>
        <MarketGrid markets={markets.filter(market => market.category === 'us')} />
      </div>
    </div>
  )
  return <MarketGrid markets={markets.filter(market => !['korea', 'us'].includes(market.category))} />
}

function MarketStateNotice() {
  const { t, dataState, setDataState } = usePreferences()
  if (dataState === 'demo') return null
  return (
    <div className="state-notice mb-4" role="status" aria-busy={dataState === 'loading'}>
      <Icon name={dataState === 'loading' ? 'loader-circle' : 'info'} />
      <span>{t(dataState)} · {t(`${dataState}Help`)}</span>
      {(dataState === 'error' || dataState === 'unavailable') && <button className="ob-button ml-auto shrink-0" onClick={() => setDataState('demo')}>{t('retry')}</button>}
    </div>
  )
}

export function MarketCategoryPage() {
  const { section: requestedSection } = useParams()
  const section = homeSections.find(item => item === requestedSection)
  const { t } = usePreferences()
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus({ preventScroll: true }) }, [section])
  if (!section) return <Navigate to="/markets" replace />
  return (
    <div className="home-route min-w-0 market-category-page">
      <div className="flex items-center gap-2 min-h-11 mb-3">
        <h1 ref={title} tabIndex={-1} id={`${section}-title`} className="text-[19px] md:text-[21px] font-bold tracking-[-.5px] focus:outline-none">{t(sectionTitles[section])}</h1>
        <span className="ml-auto shrink-0"><SampleBadge /></span>
      </div>
      <MarketStateNotice />
      <section aria-labelledby={`${section}-title`} data-home-section={section}>
        <SectionContent section={section} />
        {(section === 'indicators' || section === 'treasury') && <Link to="/macro" className="ob-button mt-3">{t('inflationAndRates')}<Icon name="arrow-up-right" /></Link>}
      </section>
      <p className="page-footnote">{t('homeDemoFooter')}</p>
    </div>
  )
}

function PriceGuide({ onClose }: { onClose: () => void }) {
  const { t, locale } = usePreferences()
  const dialog = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = overflow }
  }, [])
  const sources = new Map<string, string>()
  for (const market of markets) {
    if (market.source) sources.set(market.source.url, `${market.source.name} · ${market.symbol}`)
  }
  for (const item of [...indicators, ...preIpo]) {
    if (item.url && item.source) sources.set(item.url, item.kind === 'pre-ipo' ? `${item.source} · ${item.name[locale]}` : item.source)
  }
  return (
    <dialog ref={dialog} className="about-dialog price-guide-sheet" aria-labelledby="price-guide-title" onClose={onClose} onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close()
    }}>
      <div className="price-guide-header">
        <h2 id="price-guide-title">{t('priceGuide')}</h2>
        <button className="ob-button ghost icon-button" autoFocus aria-label={t('close')} onClick={() => dialog.current?.close()}><Icon name="x" /></button>
      </div>
      <div className="price-guide-content">
        <SampleBadge />
        <section>
          <h3>{t('priceGuideDefinition')}</h3>
          <p>{t('homeReferenceNote')}</p>
        </section>
        <section>
          <h3>{t('priceGuideMethod')}</h3>
          <p>{t('priceGuideMethodNote')}</p>
          <p className="price-guide-formula">{t('priceGuideFormula')}</p>
          <p>{t('priceGuideUnits')}</p>
          <p>{t('indicatorUnitsNote')}</p>
        </section>
        <section>
          <h3>{t('source')}</h3>
          <p>{t('priceGuideSourceNote')}</p>
          <ul className="mt-2 divide-y divide-line/60">
            {[...sources].map(([url, name]) => <li key={url}><a className="flex items-center justify-between gap-3 min-h-11 underline underline-offset-4" href={url} target="_blank" rel="noreferrer">{name}<Icon name="arrow-up-right" /></a></li>)}
          </ul>
        </section>
      </div>
    </dialog>
  )
}

const homeTabs = [
  { id: 'indicators', label: 'tabIndicators', icon: 'nav-markets' },
  { id: 'domestic', label: 'tabDomestic', icon: 'nav-domestic' },
  { id: 'overseas', label: 'tabOverseas', icon: 'nav-global' },
  { id: 'pre-ipo', label: 'tabIpo', icon: 'nav-preipo' },
  { id: 'crypto', label: 'tabCrypto', icon: 'nav-crypto' },
] as const

export function HomeOverview() {
  const { t, theme } = usePreferences()
  const touchFeedbackRef = useTouchFeedback()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = homeTabs.find(item => item.id === searchParams.get('tab')) ?? homeTabs[0]
  const navigationRef = useScrollNavigation(tab.id)
  const tabMarkets = markets.filter(market => market.category === (tab.id === 'domestic' ? 'korea' : tab.id === 'overseas' ? 'us' : 'crypto'))
  const [priceGuideOpen, setPriceGuideOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState(readExpandedSections)
  useEffect(() => {
    try { sessionStorage.setItem(expandedSectionsKey, JSON.stringify(expandedSections)) } catch { /* Expansion still works when storage is unavailable. */ }
  }, [expandedSections])
  function toggleSection(section: string) {
    setExpandedSections(current => current.includes(section) ? current.filter(item => item !== section) : [...current, section])
  }
  function selectTab(id: string) {
    const next = new URLSearchParams(searchParams)
    if (id === 'indicators') next.delete('tab')
    else next.set('tab', id)
    // A tab is a home filter: keep one home entry, including its selection, in history.
    setSearchParams(next, { replace: true })
  }
  function openGuide(trigger: HTMLButtonElement) {
    trigger.focus({ preventScroll: true })
    setPriceGuideOpen(true)
  }
  return (
    <div ref={touchFeedbackRef} className="markets-page home-route home-tabs-page min-w-0">
      <h1 className="sr-only">OREUNAE Markets</h1>
      <div className="home-market-status">
        <span className="flex min-w-0 items-center gap-2 whitespace-nowrap"><span className="home-status-dot" aria-hidden="true" />{t(tab.id === 'indicators' ? 'homeIndicatorStatus' : 'homeMarketStatus')}</span>
        <button className="home-reference-badge" aria-haspopup="dialog" onClick={event => openGuide(event.currentTarget)}>{t('priceGuide')}<Icon name="info" /></button>
      </div>
      <nav ref={navigationRef} className="home-bottom-navigation" aria-label={t('homeTabs')}><div className="home-tabs" role="tablist" aria-label={t('homeTabs')}>
        {homeTabs.map((item, index) => <button key={item.id} id={`home-tab-${item.id}`} role="tab" aria-selected={tab.id === item.id} aria-controls="home-tab-panel" tabIndex={tab.id === item.id ? 0 : -1} onClick={() => selectTab(item.id)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % homeTabs.length : event.key === 'ArrowLeft' ? (index + homeTabs.length - 1) % homeTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? homeTabs.length - 1 : null
          if (next === null) return
          event.preventDefault()
          selectTab(homeTabs[next].id)
          document.getElementById(`home-tab-${homeTabs[next].id}`)?.focus({ preventScroll: true })
        }}><OreunaeIcon name={item.icon} className="ob-icon" size={22} /><span>{t(item.label)}</span></button>)}
      </div></nav>
      <MarketStateNotice />
      <div id="home-tab-panel" role="tabpanel" aria-labelledby={`home-tab-${tab.id}`} tabIndex={0} className="home-tab-panel">
        {tab.id === 'indicators' ? <div className="home-sections home-indicator-sections">
          {indicatorGroups.map(group => <IndicatorSection key={group.section} group={group} expanded={expandedSections.includes(group.section)} onToggle={() => toggleSection(group.section)} />)}
          <button className="home-brand-banner" aria-label={t('homeBannerLabel')} aria-haspopup="dialog" onClick={event => openGuide(event.currentTarget)}>
            <Icon name="globe" />
            <span className="relative z-10 leading-[1.5]"><strong className="block font-semibold">{t('homeBannerLine1')}</strong><span className="block text-muted text-[12px] mt-1">{t('homeBannerLine2')}</span></span>
            <span className="brand-orbit" aria-hidden="true" />
            <span className="banner-arrow"><Icon name="chevron-right" /></span>
          </button>
        </div> : <>
          <ExpandableHomeSection section={tab.id} title={tab.id === 'domestic' ? 'koreanStocks' : tab.id === 'overseas' ? 'usStocks' : tab.id === 'pre-ipo' ? 'preIpo' : 'crypto'}
            hiddenCount={(tab.id === 'pre-ipo' ? preIpo.length : tabMarkets.length) - homePreviewCount}
            expanded={expandedSections.includes(tab.id)} onToggle={() => toggleSection(tab.id)}
            preview={tab.id === 'pre-ipo' ? <OverviewCards items={preIpo.slice(0, homePreviewCount)} /> : <MarketGrid markets={tabMarkets.slice(0, homePreviewCount)} />}
            extra={tab.id === 'pre-ipo' ? <OverviewCards items={preIpo.slice(homePreviewCount)} /> : <MarketGrid markets={tabMarkets.slice(homePreviewCount)} />} />
          {tab.id === 'pre-ipo' && <p className="page-footnote">{t('ipoTabNote')}</p>}
        </>}
      </div>
      {tab.id !== 'indicators' && <div className="home-brand-footer"><img src={`/assets/brand/logo-${theme}.svg`} alt="OREUNAE" width="106" height="26" /><span>Markets never close.</span></div>}
      <p className="page-footnote">{t('homeDemoFooter')}</p>
      {priceGuideOpen && <PriceGuide onClose={() => setPriceGuideOpen(false)} />}
    </div>
  )
}
