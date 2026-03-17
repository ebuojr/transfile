import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <head>
        {/* TASA Orbiter Display — not yet in next/font/google's built-in list */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=TASA+Orbiter+Display:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}
