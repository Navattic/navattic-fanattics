import '../styles/globals.css'
import { Providers } from '@/components/Providers'
import localFont from 'next/font/local'
import { AppSidebar } from '@/components/ui/AppSidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { payload } from '@/lib/payloadClient'
import { Metadata } from 'next'
import { BetaToast } from '../../components/ui/BetaToast'

// PRE-LAUNCH TODOs:
// TODO: Add error state throughout
// TODO: Add pagination
// TODO: Add Fanattic tier badge
// TODO: Add notification system

export const metadata: Metadata = {
  title: 'Fanattic Portal',
  description:
    'Participate in challenges, see upcoming Navattic events, and meet fellow Navattic fans and power users',
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
    title: 'Fanattic Portal',
    description: 'Fanattic Portal',
    url: 'https://portal.navattic.com',
    siteName: 'Fanattic Portal',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://t7nc1nixn2.ufs.sh/f/yVcG3wa4IlnLZ7aD0dol54jKIOt798TGDorYQXCU1pWmkNwf',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const currentUser = (
    await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session?.user.email,
        },
      },
    })
  ).docs[0]

  // CRITICAL: Check onboarding completion
  if (!currentUser?.onboardingCompleted) {
    redirect('/register')
  }

  return (
    <html lang="en" className={`${suisse.variable} font-sans`}>
      <body>
        <Providers user={currentUser}>
          <BetaToast />
          <AppSidebar />
          <main className="mx-auto w-full">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
