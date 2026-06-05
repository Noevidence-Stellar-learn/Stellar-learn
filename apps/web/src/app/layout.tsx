import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Stellar Learn — Build on Stellar Blockchain Through Adventure',
  description:
    'An open-source gamified platform that teaches Stellar blockchain development through a 2D pixel-art adventure game. Go from zero to builder.',
  keywords: ['Stellar', 'blockchain', 'learn to code', 'DeFi', 'web3', 'gamified learning'],
  openGraph: {
    title: 'Stellar Learn',
    description: 'Learn Stellar blockchain development through 2D adventure gameplay.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-brand-dark text-brand-gold antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
