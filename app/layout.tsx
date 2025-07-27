import type { Metadata } from 'next'
import { headers } from 'next/headers'
import ContextProvider from './context'
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google";
import SafeNavbar from './components/navigation/SafeNavbar'
import ParticleBackground from './components/effects/ParticleBackground'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Token Bank - 数字资产银行',
  description: '基于区块链的数字资产银行应用',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}>
        <ContextProvider cookies={cookies}>
          {/* 粒子背景效果 */}
          <ParticleBackground />
          
          {/* Safe风格导航栏 */}
          <SafeNavbar />
          <main>
            {children}
          </main>
        </ContextProvider>
      </body>
    </html>
  )
}
