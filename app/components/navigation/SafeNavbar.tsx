'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function SafeNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
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
            <NavLink href="/nft-market">NFT 市场</NavLink>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-black px-6 py-2 rounded-full font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              连接钱包
            </motion.button>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/50 rounded-lg mt-2">
              <MobileNavLink href="/">首页</MobileNavLink>
              <MobileNavLink href="/nft-market">NFT 市场</MobileNavLink>
              <div className="pt-2">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-full font-medium">
                  连接钱包
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
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
