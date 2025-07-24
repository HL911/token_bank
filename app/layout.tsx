'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi'
import "./globals.css"
import { useState } from 'react'
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

// 创建查询客户端实例
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1分钟
        refetchOnWindowFocus: false,
      },
    },
  })
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 在客户端创建查询客户端
  const [queryClient] = useState(() => createQueryClient())

  return (
    <html lang="zh-CN">
      <head>
        <title>Token Bank - 数字资产银行</title>
        <meta name="description" content="基于区块链的数字资产银行应用" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {/* 粒子背景效果 */}
            <ParticleBackground />
            
            {/* Safe风格导航栏 */}
            <SafeNavbar />
            <main>
              {children}
            </main>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
