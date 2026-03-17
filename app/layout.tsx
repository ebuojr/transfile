import type { Metadata } from 'next'
import { Geist, Geist_Mono, TASA_Orbiter_Display } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const tasaOrbiter = TASA_Orbiter_Display({
  variable: '--font-tasa-orbiter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TransFile — P2P File Transfer',
  description: 'Drop it. Share it. Done. Browser-based peer-to-peer file transfer over your local network.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Font variables on <html>, antialiased on <body> — fixes Tailwind v4 @theme inline resolution
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${tasaOrbiter.variable} dark`}>
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}
