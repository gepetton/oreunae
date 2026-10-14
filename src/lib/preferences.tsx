import { useEffect, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import en from '../locales/en.json'
import ko from '../locales/ko.json'
import { detailAssets } from './detail-assets'
import type { DataState, Locale } from './market-data'

import { Context } from './preferences-context'

type Theme = 'light' | 'dark'
function readPreference(key: string) {
  try {
    return localStorage.getItem(`oreunae:${key}`)
  } catch {
    return null
  }
}
function persist(key: string, value: string) {
  try {
    localStorage.setItem(`oreunae:${key}`, value)
  } catch {
    /* Preferences remain usable in memory when storage is unavailable. */
  }
}
function initialSaved(): string[] {
  try {
    const value: unknown = JSON.parse(readPreference('saved') || '[]')
    return Array.isArray(value)
      ? value.filter(
          (id): id is string =>
            typeof id === 'string' && detailAssets.some((asset) => asset.id === id),
        )
      : []
  } catch {
    return []
  }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const value = readPreference('locale')
    return value === 'ko' || value === 'en'
      ? value
      : navigator.language.startsWith('ko')
        ? 'ko'
        : 'en'
  })
  const [theme, setTheme] = useState<Theme>(() =>
    readPreference('theme') === 'dark' ? 'dark' : 'light',
  )
  const [timezone, setTimezone] = useState(() =>
    readPreference('timezone') === 'Asia/Seoul' ? 'Asia/Seoul' : 'UTC',
  )
  const [saved, setSaved] = useState(initialSaved)
  const [dataState, setDataState] = useState<DataState>('demo')
  useLayoutEffect(() => {
    document.documentElement.lang = locale
    persist('locale', locale)
  }, [locale])
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#F6F7F2' : '#111412')
    persist('theme', theme)
  }, [theme])
  useEffect(() => {
    persist('timezone', timezone)
  }, [timezone])
  useEffect(() => {
    persist('saved', JSON.stringify(saved))
  }, [saved])
  function toggleSaved(id: string) {
    setSaved((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    )
  }
  return (
    <Context
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        timezone,
        setTimezone,
        saved,
        toggleSaved,
        dataState,
        setDataState,
        t: (key) => (locale === 'ko' ? ko : en)[key],
      }}
    >
      {children}
    </Context>
  )
}
