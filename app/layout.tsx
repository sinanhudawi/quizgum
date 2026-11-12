 
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['500', '600', '700'],
})

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: {
    default: 'quizgum — Create & play quizzes',
    template: '%s · quizgum',
  },
  description:
    'quizgum lets you build your own quizzes, share them with a 6-digit code, and see who tops the leaderboard.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#e9ebee',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="H_0jsTuyzJGE-fErzjQJudNqOvOEjIIFvkLlunxZkOA"
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-background bg-[url('/images/bg.png')] bg-cover bg-center"
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
