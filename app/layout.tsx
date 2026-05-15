import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './components/Providers'
import { RegisterSW } from './components/RegisterSW'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#0FA878',
}

export const metadata: Metadata = {
  title: 'Flowpath',
  description: 'Track your job applications in one place',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flowpath',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full font-sans antialiased">
        <Providers>{children}</Providers>
        <RegisterSW />
      </body>
    </html>
  )
}
