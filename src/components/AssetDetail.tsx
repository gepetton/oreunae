import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetContent } from '../data/asset-content'
import { formatTime, priceDirection } from '../lib/market-data'
import { assetAbsoluteChange, assetChange, assetChangeLabel, assetPair, assetSeries, assetUnit, assetValue, relatedAssets } from '../lib/detail-assets'
import type { AssetPeriod, DetailAsset } from '../lib/detail-assets'
import { usePreferences } from '../lib/preferences-context'
import { PriceChart } from './Chart'
import type { ChartInspection } from './Chart'
import { HomeAssetIcon } from './HomeAssetIcon'
import { Provenance } from './MarketPanels'
import { IndicatorProvenance } from './IndicatorProvenance'
import { EmptyState, Icon, SampleBadge, SaveButton } from './ui'

function DetailDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = usePreferences()
  useLayoutEffect(() => {
    const dialog = ref.current!
    const returnFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className="about-dialog price-guide-sheet detail-dialog" aria-labelledby="detail-dialog-title" onCancel={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
  }}>
    <div className="price-guide-header">
      <h2 id="detail-dialog-title">{title}</h2>
      <button className="ob-button icon-button ghost" aria-label={t('close')} onClick={onClose}><Icon name="x" /></button>
    </div>
    <div className="price-guide-content" tabIndex={0} role="region" aria-label={title}>{children}</div>
  </dialog>
}

export function AssetDetail({ asset }: { asset: DetailAsset }) {
  const { locale, timezone, t, dataState, setDataState } = usePreferences()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<AssetPeriod>(asset.macro && asset.changeUnit !== 'bp' ? '1Y' : '1D')
  const [dialog, setDialog] = useState<'price' | 'share' | null>(null)
  const [copied, setCopied] = useState(false)
  const [inspected, setInspected] = useState<ChartInspection | null>(null)
  const [introExpanded, setIntroExpanded] = useState(false)
  const content = assetContent[asset.symbol]
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  const change = assetChange(asset)
  const direction = priceDirection(change)
  const unit = assetUnit(asset, locale)
  const absoluteChange = assetAbsoluteChange(asset, locale)
  const category = t(asset.category)
  const sample = !asset.market
  const rateBased = asset.changeUnit !== '%'
  const detailType = asset.changeUnit === 'bp' ? 'rate' : asset.macro ? 'release' : 'market'
  const chartPeriods: AssetPeriod[] = detailType === 'release' ? ['3M', '6M', '1Y', 'ALL'] : ['1D', '1W', '1M', '3M', '1Y', 'ALL']
  const isReference = !!asset.market || asset.overview?.kind === 'pre-ipo'
  const candidate = asset.market?.sourceStatus === 'candidate' || asset.overview?.candidate
  const guideTitle = t(isReference ? 'priceGuide' : 'indicatorGuide')
  const basis = candidate ? t('candidateBasis') : asset.basis ? t(asset.basis) : asset.index ? t('indexBasis') : asset.market ? t('priceDetail') : asset.overview ? t(asset.overview.kind === 'oil' ? 'oilBasis' : asset.overview.kind === 'yield' ? 'treasuryBasis' : 'preIpoBasis') : t(asset.symbol === 'CPI' ? 'cpiBasis' : 'policyBasis')
  const history = assetSeries(asset)
  const high = asset.market?.high24h ?? Math.max(...history.map(point => Number(point.value)))
  const low = asset.market?.low24h ?? Math.min(...history.map(point => Number(point.value)))
  const related = relatedAssets(asset)
  const relatedTitle = t(asset.overview?.kind === 'oil' || asset.overview?.kind === 'gas' || asset.symbol === 'GOLD' ? 'relatedCommodities' : 'detailCompareAssets')
  const intro = content.description[locale]
  const hasLongIntro = intro.length > (locale === 'ko' ? 65 : 125)
  const basisSummary = asset.market ? t('tokenReferenceSample') : asset.overview?.kind === 'oil' ? t('oilSeriesSample') : asset.overview?.kind === 'yield' ? t('yieldSeriesSample') : asset.index ? t('indexSeriesSample') : asset.macro ? t('macroSeriesSample') : t('referenceSeriesSample')
  const inspectionLabel = inspected?.time ? `${sample ? `${t('sampleData')} · ` : ''}${formatTime(inspected.time, locale, timezone, true)}` : inspected ? `${t('samplePoint')} ${inspected.index + 1}/${inspected.total}` : null
  function openDialog(value: 'price' | 'share', trigger: HTMLElement) {
    // Safari touch does not focus buttons automatically; retain the actual opener.
    trigger.focus({ preventScroll: true })
    setDialog(value)
  }

  return <article className="asset-detail mx-auto max-w-190 pt-2 md:pt-1" data-market={asset.id} data-currency={asset.currency}>
    <header className="topbar detail-topbar">
      <div className="detail-topbar-inner">
        <button className="ob-button icon-button ghost detail-back" aria-label={t('back')} onClick={() => {
          if (typeof window.history.state?.idx === 'number' && window.history.state.idx > 0) navigate(-1)
          else navigate('/markets')
        }}><Icon name="arrow-left" /></button>
        <div className="detail-header-actions">
          <span className="detail-header-save desktop-save mobile-header-save"><SaveButton market={asset} /></span>
          <button className="ob-button icon-button ghost detail-share" aria-label={t('shareAsset')} onClick={event => { setCopied(false); openDialog('share', event.currentTarget) }}>
            <svg className="ob-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M7 10H5v11h14V10h-2" /></svg>
          </button>
        </div>
      </div>
    </header>
    <div className="detail-identity flex items-center gap-3 mb-3">
      <div className="detail-asset-logo"><HomeAssetIcon symbol={asset.icon} size={46} /></div>
      <div className="min-w-0 flex-1">
        <h1 className="text-[23px] md:text-[27px] font-bold tracking-[-.7px] leading-tight">{asset.name[locale]}</h1>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1 text-[12px] text-muted">
          <span className="detail-market-pair font-mono">{assetPair(asset)}</span>
          <span aria-hidden="true">·</span><span>{category}</span>
          {candidate && <span className="detail-24h">{t('candidate')}</span>}
        </div>
      </div>
    </div>

    {noValue ? <div className="ob-card mb-4" aria-busy={dataState === 'loading'}>
      <EmptyState icon={dataState === 'loading' ? 'loader-circle' : 'info'} title={t(dataState as 'loading' | 'error' | 'unavailable')} description={t(dataState === 'loading' ? 'loadingHelp' : dataState === 'error' ? 'errorHelp' : 'unavailableHelp')}>
        {dataState !== 'loading' && <button className="ob-button" onClick={() => setDataState('demo')}>{t('retry')}</button>}
      </EmptyState>
    </div> : <>
      <div className="detail-price-row">
        <div className="detail-price numerals" data-testid="quote-price">{assetValue(asset, inspected?.value ?? asset.price, locale)} <small>{unit}</small></div>
        {inspected ? <div className="detail-inspection-time numerals">{inspectionLabel}</div> : <div className={`detail-change-row numerals ${detailType === 'release' ? 'text-muted' : `market-${direction}`}`}>
          {detailType !== 'release' && <span aria-hidden="true">{change > 0 ? '▲' : change < 0 ? '▼' : ''}</span>}
          {!rateBased && <span>{absoluteChange}</span>}
          <span data-testid="quote-change">{rateBased ? assetChangeLabel(asset, locale) : `(${assetChangeLabel(asset, locale)})`}</span>
          <span className="detail-change-basis">{sample ? t('previousSample') : '24H'}</span>
        </div>}
      </div>
      <div className="detail-price-status flex items-center gap-1.5 text-[11px] text-muted mt-1 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-muted/60" aria-hidden="true" />
        <span>{t('sampleData')}</span>
      </div>
      {dataState === 'stale' && <p className="state-notice mb-3" role="status"><Icon name="info" />{t('stale')} · {t('staleHelp')}</p>}
    </>}

    {!noValue && <section className="detail-chart-section" aria-label={t('chartHistory')}>
      <div className="detail-chart-toolbar">
        <div className="detail-periods" role="group" aria-label={t('timeRange')}>
          {chartPeriods.map(value => <button key={value} aria-pressed={period === value} onClick={() => { setInspected(null); setPeriod(value) }}>{value}</button>)}
        </div>
      </div>
      <div className="ob-card detail-chart-card"><PriceChart key={period} asset={asset} period={period} onInspect={setInspected} /></div>
    </section>}

    <dl className={`ob-card detail-stats mt-3 ${detailType === 'market' ? 'is-market' : ''}`}>
      {detailType === 'release' ? <>
        <div><dt>{t('previousValue')}</dt><dd>{noValue ? '—' : assetValue(asset, asset.previous, locale)}</dd></div>
        <div><dt>{t('sampleChange')}</dt><dd className="detail-missing">{noValue ? '—' : assetChangeLabel(asset, locale)}</dd></div>
      </> : detailType === 'rate' ? <>
        <div><dt>{t('previousValue')}</dt><dd>{noValue ? '—' : assetValue(asset, asset.previous, locale)}</dd></div>
        <div><dt>{t('sampleRange')} <span>({unit})</span></dt><dd>{noValue ? '—' : `${assetValue(asset, low, locale)}–${assetValue(asset, high, locale)}`}</dd></div>
      </> : <>
        <div><dt>{t('previousValue')}</dt><dd>{noValue ? '—' : assetValue(asset, asset.previous, locale)}</dd></div>
        <div><dt>{t(sample ? 'sampleHigh' : 'high24h')} <span>({unit})</span></dt><dd>{noValue ? '—' : assetValue(asset, high, locale)}</dd></div>
        <div><dt>{t(sample ? 'sampleLow' : 'low24h')} <span>({unit})</span></dt><dd>{noValue ? '—' : assetValue(asset, low, locale)}</dd></div>
        <div><dt>{t('sampleChange')}</dt><dd className={`market-${direction}`}>{noValue ? '—' : absoluteChange}</dd></div>
      </>}
    </dl>
    <section className="detail-content-section" aria-labelledby="asset-related-title">
      <div className="flex items-baseline justify-between gap-2 mb-3"><h2 id="asset-related-title">{relatedTitle}</h2></div>
      <div className="detail-related-list">
        {related.map(item => <Link key={item.id} to={`/markets/${item.id}`} className="detail-related-card" aria-label={`${item.name[locale]} · ${item.symbol} · ${t('mobileDetail')}`}>
          <HomeAssetIcon symbol={item.icon} size={32} />
          <span className="detail-related-name"><strong title={item.name[locale]}>{item.name[locale]}</strong><small>{item.symbol}</small></span>
          <span className="detail-related-values"><strong className="numerals">{noValue ? '—' : assetValue(item, item.price, locale)}</strong>{!noValue && <small className={`numerals market-${priceDirection(assetChange(item))}`}>{assetChangeLabel(item, locale)}</small>}</span>
          <Icon name="chevron-right" className="detail-related-chevron" />
        </Link>)}
      </div>
    </section>
    <section className="detail-brief" aria-labelledby="asset-overview-title">
      <h2 id="asset-overview-title">{t(isReference ? 'assetIntroduction' : 'indicatorIntroduction')}</h2>
      <p id="detail-intro-copy" className={`detail-brief-copy ${introExpanded ? '' : 'is-collapsed'}`}>{intro}</p>
      {hasLongIntro && <button className="detail-brief-toggle" aria-controls="detail-intro-copy" aria-expanded={introExpanded} onClick={() => setIntroExpanded(value => !value)}>{t(introExpanded ? 'readLess' : 'readMore')} <Icon name="chevron-down" className={introExpanded ? 'rotate-180' : ''} /></button>}
    </section>
    <section className="detail-data-section" aria-labelledby="detail-data-title">
      <h2 id="detail-data-title">{t('detailDataInfo')}</h2>
      <dl className="ob-card detail-data-list">
        <div><dt>{t('basis')}</dt><dd>{basisSummary}</dd></div>
        <div><dt>{t('displayUnit')}</dt><dd>{unit}</dd></div>
        {asset.market?.asOf && <div><dt>{t('sampleTimestamp')}</dt><dd>{formatTime(asset.market.asOf, locale, timezone, true)}</dd></div>}
        <div><dt>{t('source')}</dt><dd>{t('sourceNotConnected')}</dd></div>
      </dl>
      <button className="detail-price-guide" aria-label={t(isReference ? 'aboutPrice' : 'indicatorGuide')} onClick={event => openDialog('price', event.currentTarget)}>
        <Icon name="info" /><span>{t(isReference ? 'priceProvenance' : 'indicatorProvenance')}</span><Icon name="chevron-right" />
      </button>
    </section>
    {dialog !== null && <DetailDialog title={dialog === 'price' ? guideTitle : t('shareAsset')} onClose={() => setDialog(null)}>
      {dialog === 'price' ? <><SampleBadge /><h3 className="mt-4 mb-2">{asset.name[locale]}</h3><p>{basis}</p><p className="mt-3">{t('mockTimelineNotice')}</p>{asset.market ? <Provenance market={asset.market} /> : <IndicatorProvenance asset={asset} />}</>
        : <><h3 className="mb-3">{asset.name[locale]} · {assetPair(asset)}</h3><label className="block text-[12px] text-muted mb-2" htmlFor="detail-share-url">{t('assetLink')}</label><input id="detail-share-url" className="ob-input text-[12px]" readOnly value={window.location.href} onFocus={event => event.target.select()} /><button className="ob-button primary w-full mt-3" onClick={async () => {
          try { await navigator.clipboard.writeText(window.location.href); setCopied(true) } catch { document.getElementById('detail-share-url')?.focus() }
        }}>{t(copied ? 'linkCopied' : 'copyLink')}</button><p className="mt-3" role="status">{copied ? t('linkCopied') : t('copyLinkHint')}</p></>}
    </DetailDialog>}
  </article>
}
