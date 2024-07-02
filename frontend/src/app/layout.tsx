import { Metadata } from 'next'
import { Karla } from 'next/font/google'

import Egg from '/src/components/Egg/Egg'
import Settings from '/src/components/Settings/Settings'
import { AppBase } from '/src/config/app'
import TranslateDialog from '/src/components/TranslateDialog/TranslateDialog'
import { fallbackLng } from '/src/i18n/options'
import { useTranslation } from '/src/i18n/server'

import './global.css'

const karla = Karla({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: AppBase,
  title: {
    absolute: 'Star Fit',
    template: '%s - Star Fit',
  },
  keywords: ['star', 'fit', 'best', 'starfit', 'starbestfit', 'schedule', 'availability', 'availabilities', 'preferences', 'when2meet', 'doodle', 'meet', 'plan', 'time', 'timezone'],
  description: 'Enter your preferences to find a time that works for everyone!',
  themeColor: '#F79E00',
  manifest: 'manifest.json',
  openGraph: {
    title: 'Star Fit',
    description: 'Enter your preferences to find a time that works for everyone!',
    url: '/',
  },
  icons: {
    icon: 'favicon.ico',
    apple: 'logo192.png',
  },
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const { resolvedLanguage } = await useTranslation([])

  return <html lang={resolvedLanguage ?? fallbackLng}>
    <body className={karla.className}>
      <Settings />
      <Egg />
      <TranslateDialog />

      {children}

    </body>
  </html>
}

export default RootLayout
