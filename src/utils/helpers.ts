import type { Transaction } from '../types'

type CurrencyFormatOptions = {
  fractionDigits?: 0 | 2
  currencyDisplay?: 'symbol' | 'code'
  language?: 'fr' | 'en'
}

export function formatCurrency(value: number, currency = 'MAD', hidden = false, options: CurrencyFormatOptions = {}) {
  if (hidden) return '•••••'
  const digits = options.fractionDigits ?? 0
  return new Intl.NumberFormat(options.language === 'en' ? 'en-GB' : 'fr-FR', {
    style: 'currency',
    currency,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatCompact(value: number, currency = 'MAD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions, pattern?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD', language: 'fr' | 'en' = 'fr') {
  const date = typeof value === 'string' ? new Date(value + (value.length === 10 ? 'T12:00:00' : '')) : value
  const locale = language === 'en' ? 'en-GB' : 'fr-FR'
  if (!pattern) return new Intl.DateTimeFormat(locale, options ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(date)

  const includeDay = options?.day !== undefined || !options
  const includeMonth = options?.month !== undefined || !options
  const includeYear = options?.year !== undefined || !options
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    weekday: options?.weekday,
    timeZone: options?.timeZone,
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
  const ordered = pattern === 'DD/MM/YYYY'
    ? [[parts.day, includeDay], [parts.month, includeMonth], [parts.year, includeYear]] as const
    : pattern === 'MM/DD/YYYY'
      ? [[parts.month, includeMonth], [parts.day, includeDay], [parts.year, includeYear]] as const
      : [[parts.year, includeYear], [parts.month, includeMonth], [parts.day, includeDay]] as const
  const separator = pattern === 'YYYY-MM-DD' ? '-' : '/'
  const formatted = ordered.filter(([, include]) => include).map(([part]) => part).join(separator)
  return parts.weekday ? `${parts.weekday} ${formatted}` : formatted
}

export function downloadFile(name: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name; anchor.click()
  URL.revokeObjectURL(url)
}

export function transactionsToCSV(items: Transaction[]) {
  const rows = [['Date', 'Libellé', 'Type', 'Catégorie', 'Montant'], ...items.map((t) => [t.date, t.title, t.type, t.category, String(t.amount)])]
  return '\uFEFF' + rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n')
}

export function slug(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function daysUntil(date: string) {
  return Math.ceil((new Date(date + 'T12:00:00').getTime() - Date.now()) / 86400000)
}

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}
