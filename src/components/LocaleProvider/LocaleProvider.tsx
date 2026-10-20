import { useContext } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from 'react-aria-components'
import type { Messages } from './messages'
import { MessageContext } from './locale'

export function LocaleMessages({ messages, children }: { messages?: Messages; children: ReactNode }) {
  const { locale } = useLocale()
  const parent = useContext(MessageContext)
  return (
    <MessageContext.Provider value={{ locale, overrides: { ...(parent.locale === locale ? parent.overrides : {}), ...messages } }}>
      {children}
    </MessageContext.Provider>
  )
}

