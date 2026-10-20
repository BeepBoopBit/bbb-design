import { createContext, useContext } from 'react'
import { useLocale } from 'react-aria-components'
import { englishMessages, arabicMessages } from './messages'
import type { MessageKey, Messages } from './messages'
export const MessageContext = createContext<{ locale?: string; overrides: Messages }>({ overrides: {} })

export function useMessages() {
  const { locale, direction } = useLocale()
  const { overrides } = useContext(MessageContext)
  const dictionary = { ...englishMessages, ...(locale.startsWith('ar') ? arabicMessages : {}), ...overrides }
  const number = new Intl.NumberFormat(locale)
  function t(key: MessageKey, values: Record<string, string | number> = {}) {
    return dictionary[key].replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = values[name]
      return typeof value === 'number' ? number.format(value) : value ?? placeholder
    })
  }
  return { t, locale, direction, formatNumber: (value: number) => number.format(value) }
}
