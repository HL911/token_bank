'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

// 格式化地址显示
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function SafeNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const openWalletModal = () => {
    open()
  }

  return (
    <>
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">TB</span>
            </div>
            <span className="text-white font-bold text-xl">Token Bank</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/">首页</NavLink>
            <NavLink href="/permit-token-bank">签名存款</NavLink>
            <NavLink href="/nft-market">NFT 监听</NavLink>
            <NavLink href="/nft-marketplace">NFT 市场</NavLink>
            <NavLink href="/mint-nft">铸造 NFT</NavLink>
            <NavLink href="/whitelist-admin">白名单管理</NavLink>
            {!isClient ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300"
                disabled
              >
                加载中...
              </motion.button>
            ) : isConnected && address ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 px-4 py-2 rounded-full font-medium border border-green-500/30"
                >
                  {formatAddress(address)}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openWalletModal}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-medium hover:from-orange-400 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  管理
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openWalletModal}
                className="bg-gradient-to-r from-green-500 to-green-600 text-black px-6 py-2 rounded-full font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
              >
                连接钱包
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-gray-800/50"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink href="/">首页</MobileNavLink>
              <MobileNavLink href="/permit-token-bank">签名存款</MobileNavLink>
              <MobileNavLink href="/nft-market">NFT 监听</MobileNavLink>
              <MobileNavLink href="/nft-marketplace">NFT 市场</MobileNavLink>
              <MobileNavLink href="/mint-nft">铸造 NFT</MobileNavLink>
              {!isClient ? (
                <div className="text-gray-400 px-3 py-2">加载中...</div>
              ) : isConnected && address ? (
                <div className="space-y-2">
                  <div className="text-green-400 px-3 py-2 font-mono text-sm">
                    {formatAddress(address)}
                  </div>
                  <button
                    onClick={openWalletModal}
                    className="w-full text-left bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg font-medium hover:from-orange-400 hover:to-orange-500 transition-all duration-300"
                  >
                    管理钱包
                  </button>
                </div>
              ) : (
                <button
                  onClick={openWalletModal}
                  className="w-full text-left bg-gradient-to-r from-green-500 to-green-600 text-black px-3 py-2 rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300"
                >
                  连接钱包
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
    

    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.span
        whileHover={{ y: -2 }}
        className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors duration-300 cursor-pointer"
      >
        {children}
      </motion.span>
    </Link>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <span className="text-gray-300 hover:text-green-400 block px-3 py-2 text-base font-medium transition-colors duration-300">
        {children}
      </span>
    </Link>
  )
}
