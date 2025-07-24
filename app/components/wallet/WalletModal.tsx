'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

// 格式化地址显示
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true)
      await connect({ connector })
      // 连接成功后关闭模态框
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error('连接钱包失败:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      console.log('开始断开钱包连接...')
      await disconnect()
      console.log('钱包连接已断开')
      onClose()
    } catch (error) {
      console.error('断开钱包失败:', error)
    }
  }

  // 点击背景关闭模态框
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isClient) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* 模态框内容 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题 */}
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isConnected ? '钱包管理' : '连接钱包'}
            </h2>

            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-gray-300 text-center mb-6">请选择钱包进行连接：</p>
                {connectors.map((connector) => (
                  <motion.button
                    key={connector.uid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending || isConnecting}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? '🔄 连接中...' : `连接 ${connector.name}`}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-300 font-medium flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    钱包已连接
                  </p>
                  {address ? (
                    <p className="text-green-200/80 text-sm font-mono">
                      地址: {formatAddress(address)}
                    </p>
                  ) : (
                    <p className="text-green-200/80 text-sm font-mono">
                      地址加载中...
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDisconnect}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  🔌 断开钱包
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
