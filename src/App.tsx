import { useLayoutEffect } from 'react'
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  useParams,
} from 'react-router-dom'
import {
  MacroSnapshot,
  MarketList,
} from './components/MarketPanels'
import { EmptyState, Icon, SampleBadge } from './components/ui'
import { HomeOverview, MarketCategoryPage } from './components/HomeOverview'
import { AssetDetail } from './components/AssetDetail'
import { OreunaeIcon } from './components/icons/OreunaeIcon'
import { detailAssets } from './lib/detail-assets'
import type { DataState, Locale } from './lib/market-data'
import { usePreferences } from './lib/preferences-context'
import stateFixture from './data/states.json'
import type { TextKey } from './lib/preferences-context'
import './App.css'

const scrollPositions = new Map<string, number>()
try {
  const saved = JSON.parse(sessionStorage.getItem('oreunae:scroll') ?? '{}')
  for (const [key, value] of Object.entries(saved)) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) scrollPositions.set(key, value)
  }
} catch { /* Scroll restoration remains available in memory when storage is unavailable. */ }
function ScrollMemory() {
  const location = useLocation(),
    action = useNavigationType()
  const positionKey = `${location.pathname}${location.search}:${location.key}`
  useLayoutEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const persist = () => {
      try { sessionStorage.setItem('oreunae:scroll', JSON.stringify(Object.fromEntries(scrollPositions))) } catch { /* Optional session state. */ }
    }
    window.addEventListener('pagehide', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      history.scrollRestoration = previous
    }
  }, [])
  useLayoutEffect(() => {
    const position =
      action === 'POP' ? scrollPositions.get(positionKey) || 0 : 0
    window.scrollTo(0, position)
    const remember = () => scrollPositions.set(positionKey, window.scrollY)
    remember()
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [positionKey, action])
  return null
}
function Header() {
  const { t, theme, setTheme, locale, setLocale } = usePreferences()
  const location = useLocation()
  const market = detailAssets.find((m) => location.pathname === `/markets/${m.id}`)
  if (market) return null
  return (
    <header
      className={`topbar h-[var(--ob-header)] fixed z-30 top-0 left-0 right-0 flex items-center py-0 px-7 gap-6 ${location.pathname === '/markets' || location.pathname === '/' ? 'bg-background/80' : 'bg-glass'} backdrop-blur-[20px] border-b border-b-glass-edge max-lg:py-0 max-lg:px-5 max-lg:gap-2 max-lg:border-b-0 max-xs:py-0 max-xs:px-3 ${location.pathname === '/markets' || location.pathname === '/' ? 'home-topbar' : ''}`}
    >
      <Link to="/markets" className="brand" aria-label="OREUNAE">
        <img
          src={`/assets/brand/logo-${theme}.svg`}
          alt="OREUNAE"
          width="128"
          height="31"
        />
      </Link>
      <div className="header-controls">
        <span className="header-sample mr-1 max-lg:hidden">
          <SampleBadge />
        </span>
        <div className="header-actions">
          <NavLink
            to="/calendar"
            aria-label={t('economicCalendar')}
            title={t('economicCalendar')}
            className={({ isActive }) => `ob-button ghost header-action ${isActive ? 'active' : ''}`}
          >
            <OreunaeIcon name="calendar" className="ob-icon" size={21} />
          </NavLink>
          <NavLink
            to="/saved"
            aria-label={t('watchlist')}
            title={t('watchlist')}
            className={({ isActive }) => `ob-button ghost header-action ${isActive ? 'active' : ''}`}
          >
            <OreunaeIcon name="watchlist" className="ob-icon" size={21} />
            <span className="hidden md:inline">{t('saved')}</span>
          </NavLink>
          <label className="locale-select flex items-center relative gap-2 min-h-11 max-md:gap-1.5">
            <OreunaeIcon name="language" className="ob-icon" size={21} />
            <select
              aria-label={t('language')}
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              <option value="en">EN</option>
              <option value="ko">KO</option>
            </select>
            <OreunaeIcon name="chevron-down" className="ob-icon" size={14} />
          </label>
        </div>
        <button
          className="ob-button ghost icon-button theme-toggle"
          aria-label={t(theme === 'light' ? 'dark' : 'light')}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Icon name={theme === 'light' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  )
}
function MarketsPage() {
  const { id } = useParams()
  const chosen = detailAssets.find((asset) => asset.id === id)
  if (!id) return <HomeOverview />
  if (!chosen) return <NotFound />
  return <AssetDetail key={chosen.id} asset={chosen} />
}
function SavedPage() {
  const { t, saved } = usePreferences()
  const selected = detailAssets.filter((asset) => saved.includes(asset.id))
  return (
    <div className="standard-page">
      {selected.length ? (
        <MarketList assets={selected} savedPage />
      ) : (
        <section className="ob-card">
          <EmptyState
            icon="star"
            title={t('noSaved')}
            description={t('savedHelp')}
          >
            <Link className="ob-button primary" to="/markets">
              {t('allMarkets')}
              <Icon name="arrow-up-right" />
            </Link>
          </EmptyState>
        </section>
      )}
      <p className="page-footnote">{t('savedHelp')}</p>
    </div>
  )
}
function MacroPage() {
  const { t } = usePreferences()
  return (
    <div className="standard-page">
      <MacroSnapshot full />
      <p className="page-footnote">{t('demoFooter')}</p>
    </div>
  )
}
function CalendarPage() {
  const { t } = usePreferences()
  return (
    <div className="standard-page">
      <h1 className="mb-3 text-[19px] md:text-[21px] font-bold tracking-[-.5px]">{t('economicCalendar')}</h1>
      <section className="ob-card calendar-empty">
        <EmptyState
          icon="calendar-days"
          title={t('noEvents')}
          description={t('noEventsHelp')}
        >
          <Link className="ob-button" to="/markets">
            {t('keyIndicators')}
            <Icon name="arrow-up-right" />
          </Link>
        </EmptyState>
      </section>
    </div>
  )
}
function SettingsPage() {
  const {
    t,
    locale,
    setLocale,
    theme,
    setTheme,
    timezone,
    setTimezone,
    dataState,
    setDataState,
  } = usePreferences()
  return (
    <div className="standard-page settings-page">
      <section className="ob-card">
        <h2>{t('appearance')}</h2>
        <div className="theme-options grid grid-cols-[1fr_1fr] gap-4 max-md:gap-2.5">
          {(['light', 'dark'] as const).map((value) => (
            <button
              key={value}
              className={`theme-option ${value === theme ? 'selected' : ''}`}
              aria-pressed={value === theme}
              onClick={() => setTheme(value)}
            >
              <span className={`theme-thumbnail ${value}`} aria-hidden="true">
                <i />
                <span>
                  <i />
                  <i />
                  <i />
                </span>
              </span>
              <span className="theme-option-label">
                <Icon name={value === 'light' ? 'sun' : 'moon'} />
                <strong>{t(value)}</strong>
                {value === theme && <Icon name="check" />}
              </span>
              <small>
                {t(value === 'light' ? 'lightDescription' : 'darkDescription')}
              </small>
            </button>
          ))}
        </div>
      </section>
      <section className="ob-card">
        <h2>{t('preferences')}</h2>
        <div className="setting-row flex items-center justify-between gap-6 py-4 px-0 border-t border-t-line max-md:gap-3 max-md:text-[13px]">
          <label htmlFor="settings-language">
            <Icon name="globe" />
            {t('language')}
          </label>
          <select
            className="ob-input"
            id="settings-language"
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </div>
        <div className="setting-row flex items-center justify-between gap-6 py-4 px-0 border-t border-t-line max-md:gap-3 max-md:text-[13px]">
          <label htmlFor="settings-timezone">{t('timezone')}</label>
          <select
            className="ob-input"
            id="settings-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Seoul">Asia/Seoul · KST</option>
          </select>
        </div>
        <p className="muted-caption">{t('localPreferences')}</p>
      </section>
      <section className="ob-card">
        <h2>{t('demoStates')}</h2>
        <p className="settings-description">{t('demoStatesHelp')}</p>
        <div className="setting-row flex items-center justify-between gap-6 py-4 px-0 border-t border-t-line max-md:gap-3 max-md:text-[13px]">
          <label htmlFor="data-state">{t('sampleData')}</label>
          <select
            className="ob-input"
            id="data-state"
            value={dataState}
            onChange={(event) => setDataState(event.target.value as DataState)}
          >
            <option value="demo">{t('demoNormal')}</option>
            {stateFixture.states.map((state) => (
              <option value={state.id} key={state.id}>
                {t(state.labelKey as TextKey)}
              </option>
            ))}
          </select>
        </div>
        <Link className="ob-button" to="/markets">
          {t('openMarkets')}
          <Icon name="arrow-up-right" />
        </Link>
      </section>
    </div>
  )
}
function NotFound() {
  const { t } = usePreferences()
  return (
    <div className="standard-page">
      <EmptyState
        icon="search"
        title={t('notFound')}
        description={t('notFoundHelp')}
      >
        <Link to="/markets" className="ob-button primary">
          {t('backToMarkets')}
        </Link>
      </EmptyState>
    </div>
  )
}
export default function App() {
  const { t } = usePreferences()
  const { pathname } = useLocation()
  const isHome = pathname === '/markets' || pathname === '/'
  const isDetail = detailAssets.some(asset => pathname === `/markets/${asset.id}`)
  return (
    <>
      <ScrollMemory />
      <a className="skip-link" href="#main-content">
        {t('skipContent')}
      </a>
      <Header />
      <main
        className={`main-content ${isHome ? 'pt-[var(--ob-header)] pb-[calc(var(--ob-home-nav-height)_+_28px_+_env(safe-area-inset-bottom))]' : 'pt-[calc(var(--ob-header)_+_24px)] max-lg:pt-[calc(var(--ob-header)_+_6px)] pb-[calc(24px_+_env(safe-area-inset-bottom))]'} px-7 max-lg:px-5 max-xs:pl-4 max-xs:pr-4`}
        id="main-content"
      >
        <Routes>
          <Route path="/" element={<Navigate to="/markets" replace />} />
          <Route
            path="/markets"
            element={<MarketsPage />}
          />
          <Route
            path="/markets/:id"
            element={<MarketsPage />}
          />
          <Route path="/markets/category/:section" element={<MarketCategoryPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/macro" element={<MacroPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isDetail && <footer className="page-utilities max-w-280 mx-auto flex items-center justify-between gap-3 pt-4 mt-5 border-t border-line">
          <SampleBadge />
          <Link to="/settings">
            <Icon name="settings" />
            {t('settings')}
          </Link>
        </footer>}
      </main>
    </>
  )
}
