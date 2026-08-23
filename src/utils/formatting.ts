import { useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import type { Settings } from '../types'
import { formatDate } from './helpers'

export function useDateFormatter() {
  const dateFormat = useSettingsStore((state) => state.dateFormat)
  const language = useSettingsStore((state) => state.language)
  const timezone = useSettingsStore((state) => state.timezone)
  return useCallback((value: string | Date, options?: Intl.DateTimeFormatOptions) => formatDate(value, { ...options, timeZone: options?.timeZone ?? timezone }, dateFormat, language), [dateFormat, language, timezone])
}

export function useTimeFormatter() {
  const timeFormat = useSettingsStore((state) => state.timeFormat)
  const language = useSettingsStore((state) => state.language)
  return useCallback((value: string) => {
    const match = value.match(/^(\d{1,2}):(\d{2})/)
    if (!match) return value
    const time = new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])))
    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit', hour12: timeFormat === '12h', timeZone: 'UTC' }).format(time)
  }, [language, timeFormat])
}

export function currencyFormatOptions(settings: Pick<Settings, 'amountDecimals' | 'currencyDisplay' | 'language'>) {
  return {
    fractionDigits: settings.amountDecimals,
    currencyDisplay: settings.currencyDisplay,
    language: settings.language,
  } as const
}
