import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { HeroUIProvider } from '@heroui/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GitHub Project Viewer',
  description: 'Visualize GitHub project structure interactively',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <HeroUIProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </HeroUIProvider>
      </body>
    </html>
  )
} 