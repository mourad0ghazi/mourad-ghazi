import type { Transaction } from '../types'

export function formatCurrency(value: number, currency = 'MAD', hidden = false) {
  if (hidden) return '•••••'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export function formatCompact(value: number, currency = 'MAD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('fr-FR', options ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(typeof value === 'string' ? new Date(value + (value.length === 10 ? 'T12:00:00' : '')) : value)
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
