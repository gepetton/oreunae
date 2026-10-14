import { createContext, useContext } from 'react'
import type { DataState, Locale } from './market-data'
import en from '../locales/en.json'

type Theme = 'light' | 'dark'
export type TextKey = keyof typeof en
export interface Preferences {
  locale: Locale; setLocale: (value: Locale) => void
  theme: Theme; setTheme: (value: Theme) => void
  timezone: string; setTimezone: (value: string) => void
  saved: string[]; toggleSaved: (id: string) => void
  dataState: DataState; setDataState: (value: DataState) => void
  t: (key: TextKey) => string
}
export const Context = createContext<Preferences | null>(null)
export function usePreferences() {
  const context = useContext(Context)
  if (!context) throw new Error('PreferencesProvider is required')
  return context
}
