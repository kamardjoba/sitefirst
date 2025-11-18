const rawCurrency = typeof import.meta.env?.VITE_CURRENCY === 'string'
  ? import.meta.env.VITE_CURRENCY.trim()
  : ''

export const DEFAULT_CURRENCY_LABEL = rawCurrency || 'PLN'

export function normalizeCurrency(currency) {
  return (currency && currency.trim()) || DEFAULT_CURRENCY_LABEL
}

export function formatCurrency(value, currency) {
  const normalizedCurrency = normalizeCurrency(currency || DEFAULT_CURRENCY_LABEL)
  const amount = Number(value || 0)
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString('ru-RU')
    : '0'
  return `${formattedAmount} ${normalizedCurrency}`
}

