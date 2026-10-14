import type { DetailAsset } from '../lib/detail-assets'
import { assetPair, assetUnit, assetValue } from '../lib/detail-assets'
import { formatNumber } from '../lib/market-data'
import { usePreferences } from '../lib/preferences-context'
import { Icon } from './ui'

export function IndicatorProvenance({ asset }: { asset: DetailAsset }) {
  const { t, locale, dataState } = usePreferences()
  const item = asset.overview
  const available = dataState === 'demo' || dataState === 'stale'
  return <section className="ob-card provenance" aria-label={t(item?.kind === 'pre-ipo' ? 'priceProvenance' : 'indicatorProvenance')}>
    <h2>{t(item?.kind === 'pre-ipo' ? 'priceProvenance' : 'indicatorProvenance')}</h2>
    <dl>
      <div><dt>{t('instrument')}</dt><dd className="mono">{assetPair(asset)}</dd></div>
      <div><dt>{t('type')}</dt><dd>{t(asset.category)}</dd></div>
      <div><dt>{t('illustrativeValue')}</dt><dd className="mono">{available ? `${assetValue(asset, asset.price, locale)} ${assetUnit(asset, locale)}` : '—'}</dd></div>
      {item?.pair && <>
        <div><dt>{t('nativePrice')}</dt><dd className="mono">{available ? `${formatNumber(item.value, locale)} USDT` : '—'}</dd></div>
        <div><dt>{t('sampleExchangeRate')}</dt><dd className="mono">1 USDT = {asset.rate} USD</dd></div>
      </>}
      <div><dt>{t('source')}</dt><dd>{item?.url && item.source ? <a href={item.url} target="_blank" rel="noreferrer">{item.source} · {t(item.kind === 'pre-ipo' ? 'listingNotice' : 'seriesSource')}<Icon name="arrow-up-right" /></a> : t('notProvided')}</dd></div>
      <div><dt>{t('observationPeriod')}</dt><dd>{t('notProvided')}</dd></div>
      <div><dt>{t('updated')}</dt><dd>{t('dateNotProvided')}</dd></div>
    </dl>
    {item?.contract && <p className="provenance-note">{t('preIpoContractNote')} <span className="font-mono">{item.contract}</span></p>}
    <p className="provenance-note">{t(asset.basis ?? (asset.index ? 'indexBasis' : item ? 'overviewSourceNote' : 'macroNote'))}</p>
    <p className="provenance-note">{t('undatedHistoryHelp')}</p>
  </section>
}
