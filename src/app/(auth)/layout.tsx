import localFont from 'next/font/local'
import '../styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fanattics Portal',
  description:
    'Welcome to the Navattic Fanattics Portal, where you can participate in challenges, see upcoming Navattic events, and meet fellow Navattic fans and power users. ',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png' }],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  manifest: '/favicon/site.webmanifest',
  other: {
    'msapplication-config': '/favicon/browserconfig.xml',
    'msapplication-TileColor': '#00aba9',
    'theme-color': '#ffffff',
  },
  openGraph: {
    title: 'Fanattics Portal',
    description:
      'Welcome to the Navattic Fanattics Portal, where you can participate in challenges, see upcoming Navattic events, and meet fellow Navattic fans and power users.',
    url: 'https://fanattics.navattic.com',
    siteName: 'Fanattics Portal',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://t7nc1nixn2.ufs.sh/f/yVcG3wa4IlnLoBIg1ouiYyvKXHMeWUG5lSu2sw7ab68jn4fg',
        width: 1200,
        height: 630,
      },
    ],
  },
}

const suisse = localFont({
  src: [
    { path: '../styles/fonts/SuisseIntl-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../styles/fonts/SuisseIntl-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../styles/fonts/SuisseIntl-Semibold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-suisse',
})
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${suisse.variable} font-sans`}>
      <body>{children}</body>
    </html>
  )
}
