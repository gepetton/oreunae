import { Link } from 'react-router-dom'
import {
  change24h,
  currencyUnit,
  displayRate,
  formatChange,
  formatMarketPrice,
  formatNumber,
  formatTime,
  macroIndicators,
  marketCurrency,
  priceDirection,
} from '../lib/market-data'
import type { Market } from '../lib/market-data'
import { usePreferences } from '../lib/preferences-context'
import type { TextKey } from '../lib/preferences-context'
import { Icon, SampleBadge, SaveButton } from './ui'
import { Sparkline } from './Chart'
import { HomeAssetIcon } from './HomeAssetIcon'
import { assetAbsoluteChange, assetChange, assetChangeLabel, assetSeries, assetUnit, assetValue, detailAssets } from '../lib/detail-assets'
import type { DetailAsset } from '../lib/detail-assets'

export function MarketGrid({ markets }: { markets: Market[] }) {
  const { t, locale, dataState } = usePreferences()
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  return (
    <div className="market-grid home-asset-grid" data-testid="market-grid">
      {markets.map((market) => {
        const change = change24h(market)
        const direction = priceDirection(change)
        const value = formatMarketPrice(market, market.price, locale)
        const asset = detailAssets.find(asset => asset.id === market.id)!
        return (
          <article className="ob-card market-card home-asset-card" key={market.id} data-market={market.id} data-currency={marketCurrency(market)}>
            <Link to={`/markets/${market.id}`} className="home-asset-link" aria-label={`${market.name[locale]} · ${market.symbol} · ${t('mobileDetail')}`}>
              <HomeAssetIcon symbol={asset.icon} />
              <div className="home-asset-identity">
                <h3 className="market-name" title={market.name[locale]}>{market.name[locale]}</h3>
                <span className="home-card-ticker">{market.symbol}{market.sourceStatus === 'candidate' && ` · ${t('candidate')}`}</span>
              </div>
              <div className="home-asset-quote">
                {noValue ? <span className="home-empty-value">— <span>{t(dataState as 'loading' | 'error' | 'unavailable')}</span></span> : <>
                  <div className={`home-card-value numerals ${value.length > 7 ? 'is-long' : ''}`} data-testid="card-price">
                    {value}<span className="sr-only"> {currencyUnit(marketCurrency(market), locale)}</span>
                  </div>
                  <span className={`market-${direction} home-card-change numerals`} data-testid="card-change">
                    <span className="home-card-delta"><span className="sr-only">{t('valueChange')} </span>{assetAbsoluteChange(asset, locale)}</span>
                    <span className="home-card-rate">{formatChange(market, locale)}</span>
                  </span>
                </>}
              </div>
              <Icon name="chevron-right" className="home-card-chevron" />
            </Link>
            <SaveButton market={market} />
          </article>
        )
      })}
    </div>
  )
}
export function MarketList({ assets, savedPage = false }: { assets: DetailAsset[]; savedPage?: boolean }) {
  const { t, locale, dataState } = usePreferences()
  const noValue = ['loading', 'error', 'unavailable'].includes(dataState)
  return <section className={`ob-card market-list ${savedPage ? 'saved-list' : ''}`} aria-label={t(savedPage ? 'saved' : 'marketWatchlist')}>
    <div className="section-heading"><h2>{t(savedPage ? 'saved' : 'marketWatchlist')}</h2><span className="list-count text-[12px] text-muted">{assets.length} {t('countMarkets')}</span></div>
    <div className="market-table-heading" aria-hidden="true"><span>{t('markets')}</span><span>{t('type')}</span><span>{t('price')}</span><span>{t('valueChange')}</span><span>{t('trend')}</span><span><Icon name="star" /></span></div>
    <ul className="market-rows list-none p-0 m-0">
      {assets.map(asset => <li className="market-row" key={asset.id}>
        <Link to={`/markets/${asset.id}`} className="market-row-link" aria-label={`${asset.name[locale]} · ${asset.symbol} · ${t('mobileDetail')}`}>
          <div className="row-identity flex items-center gap-2.5 min-w-0 max-md:gap-2 max-xs:gap-1.5">
            <HomeAssetIcon symbol={asset.icon} size={34} />
            <div className="min-w-0"><strong className="market-name block leading-[1.3]">{asset.name[locale]}</strong><span className="market-ticker block text-[12px] text-muted leading-[1.4] whitespace-nowrap">{asset.symbol} · {assetUnit(asset, locale)}</span></div>
          </div>
          <span className="market-kind">{t(asset.category)}</span>
          <span className="row-price numerals" data-currency={asset.currency}>{noValue ? '—' : `${asset.unit === 'KRW' ? '₩' : asset.currency === 'USD' ? '$' : ''}${assetValue(asset, asset.price, locale)}${asset.unit === '%' ? '%' : asset.unit === 'USD/bbl' ? '/bbl' : asset.unit === 'pt' ? ' pt' : asset.unit === 'score' ? ` ${assetUnit(asset, locale)}` : ''}`}</span>
          <span className={`row-change numerals market-${priceDirection(assetChange(asset))}`}>{noValue ? '—' : assetChangeLabel(asset, locale)}</span>
          {!noValue && <Sparkline values={assetSeries(asset).map(point => Number(point.value))} direction={priceDirection(assetChange(asset))} step={asset.symbol === 'BOK'} />}
        </Link>
        <SaveButton market={asset} />
      </li>)}
    </ul>
  </section>
}
export function MacroSnapshot({ full = false }: { full?: boolean }) {
  const { t, locale } = usePreferences()
  return (
    <section
      className={`ob-card macro-panel ${full ? 'macro-full' : ''}`}
      aria-label={t('macroSnapshot')}
    >
      <div className="section-heading">
        <h2>
          {full ? (
            t('macroSnapshot')
          ) : (
            <Link className="macro-title-link" to="/macro">
              {t('macroSnapshot')}
            </Link>
          )}
        </h2>
        <SampleBadge />
      </div>
      <div className="macro-grid">
        {macroIndicators.map((indicator) => (
          <Link className="macro-card block" key={indicator.id} to={`/markets/${indicator.id}`} aria-label={`${t(indicator.nameKey as TextKey)} · ${t('mobileDetail')}`}>
            <div className="macro-card-heading flex gap-2 items-center">
              <span className="country-tag" aria-hidden="true">
                {indicator.country}
              </span>
              <div>
                <h3>
                  <span className={full ? '' : 'hidden md:inline'}>
                    {t(indicator.nameKey as TextKey)}
                  </span>
                  {!full && (
                    <span className="md:hidden">
                    {t(indicator.nameKey as TextKey)}
                    </span>
                  )}
                </h3>
                <p>{t(indicator.definitionKey as TextKey)}</p>
              </div>
            </div>
            <div className="macro-value-line">
              <div>
                <div className="macro-value numerals">
                  {formatNumber(
                    indicator.value,
                    locale,
                    indicator.displayDecimals,
                  )}
                  <span>%</span>
                </div>
                <span className="macro-caption">{t('illustrativeValue')}</span>
              </div>
              <Sparkline values={indicator.history} step={indicator.symbol === 'BOK'} />
            </div>
            {full && (
              <>
                <div className="macro-history-label flex justify-between gap-2 mt-3.5 text-[10px] text-muted">
                  <span>{t('syntheticHistory')}</span>
                  <span>{t('dateNotProvided')}</span>
                </div>
                <dl className="macro-metadata border-t border-t-line mt-5 mx-0 mb-0 pt-2">
                  <div>
                    <dt>{t('observationPeriod')}</dt>
                    <dd>{t('notProvided')}</dd>
                  </div>
                  <div>
                    <dt>{t('source')}</dt>
                    <dd>{t('notProvided')}</dd>
                  </div>
                </dl>
              </>
            )}
          </Link>
        ))}
      </div>
      {full && (
        <p className="info-paragraph flex gap-2.5 items-start pt-4.5 px-0 pb-0 mt-5 border-t border-t-line text-[12px] text-muted">
          <Icon name="info" />
          {t('macroNote')}
        </p>
      )}
    </section>
  )
}
export function Provenance({
  market,
  detail = false,
}: {
  market: Market
  detail?: boolean
}) {
  const { t, locale, timezone, dataState } = usePreferences()
  const hasSource = market.sourceStatus === 'reference-only' && market.source
  const unit = currencyUnit(marketCurrency(market), locale)
  if (market.sourceStatus === 'candidate') return <section className="ob-card provenance" aria-label={t('priceProvenance')}>
    <h2>{t('priceProvenance')}</h2>
    <dl>
      <div><dt>{t('instrument')}</dt><dd>{market.name[locale]} · {market.symbol}</dd></div>
      <div><dt>{t('type')}</dt><dd>{t('candidate')}</dd></div>
      <div><dt>{t('illustrativeValue')}</dt><dd className="mono">{['demo', 'stale'].includes(dataState) ? `${formatMarketPrice(market, market.price, locale)} ${unit}` : '—'}</dd></div>
      <div><dt>{t('source')}</dt><dd>{t('pendingVenue')}</dd></div>
      <div><dt>{t('updated')}</dt><dd>{t('dateNotProvided')}</dd></div>
    </dl>
    <p className="provenance-note">{t('candidateBasis')}</p>
  </section>
  return (
    <section
      className={`ob-card provenance ${detail ? 'provenance-detail' : ''}`}
      aria-label={t('priceProvenance')}
    >
      <h2>{t('priceProvenance')}</h2>
      <dl>
        <div>
          <dt>{t('instrument')}</dt>
          <dd className="mono">{market.symbol} / {market.quote}</dd>
        </div>
        <div>
          <dt>{t('type')}</dt>
          <dd>{t(market.kind === 'crypto' ? 'crypto' : 'perpetual')}</dd>
        </div>
        <div>
          <dt>{t('source')}</dt>
          <dd>
            {hasSource ? (
              <a href={market.source!.url} target="_blank" rel="noreferrer">
                {market.source!.name}
                <Icon name="arrow-up-right" />
              </a>
            ) : (
              <span>{t('pendingVenue')}</span>
            )}
          </dd>
        </div>
        <div>
          <dt>{t('basis')}</dt>
          <dd>{hasSource ? t('singleMarket') : t('pendingVenue')}</dd>
        </div>
        <div>
          <dt>{t('nativePrice')}</dt>
          <dd className="mono">{dataState === 'demo' || dataState === 'stale' ? `${formatNumber(market.price, locale, market.displayDecimals ?? 2)} ${market.quote}` : '—'}</dd>
        </div>
        <div>
          <dt>{t('sampleExchangeRate')}</dt>
          <dd className="mono">1 {market.quote} = {formatNumber(displayRate(market), locale, marketCurrency(market) === 'KRW' ? 0 : 4)} {unit}</dd>
        </div>
        <div>
          <dt>{t('updated')}</dt>
          <dd>
            <time className="mono" dateTime={market.asOf}>
              {formatTime(market.asOf, locale, timezone)}{' '}
              {timezone === 'UTC' ? 'UTC' : 'KST'}
            </time>
            <span className="observation-date">
              {new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', {
                timeZone: timezone,
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(new Date(market.asOf))}
            </span>
          </dd>
        </div>
      </dl>
      <p className="provenance-note">{t('quoteExplanation')}</p>
      <p className="provenance-note">{t('conversionNote')}</p>
      <p className="provenance-note">{t(hasSource ? 'sourceNote' : 'pendingNote')}</p>
    </section>
  )
}
