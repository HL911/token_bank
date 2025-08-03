'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNFTMarket } from '../../contracts/hooks/useNFTMarket'
import { useTokenDisplayName } from '../../contracts/hooks/useERC20Info'

interface WhitelistBuyModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  price: string
  paymentToken?: string
  onBuySuccess?: () => void
}

export function WhitelistBuyModal({
  isOpen,
  onClose,
  listingId,
  price,
  paymentToken,
  onBuySuccess
}: WhitelistBuyModalProps) {
  const { address } = useAccount()
  const { permitBuyNFT } = useNFTMarket()
  const tokenSymbol = useTokenDisplayName(paymentToken)

  const [signatureData, setSignatureData] = useState({
    deadline: '',
    v: '',
    r: '',
    s: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    if (!address || !signatureData.deadline || !signatureData.v || !signatureData.r || !signatureData.s) {
      setError('请填写完整的签名信息')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      await permitBuyNFT(
        listingId,
        BigInt(signatureData.deadline),
        parseInt(signatureData.v),
        signatureData.r as `0x${string}`,
        signatureData.s as `0x${string}`
      )

      onBuySuccess?.()
      onClose()
    } catch (error: any) {
      console.error('白名单购买失败:', error)
      setError(error.message || '购买失败，请检查签名信息是否正确')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignatureDataChange = (field: string, value: string) => {
    setSignatureData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  // 尝试解析粘贴的JSON签名数据
  const handlePasteSignature = (pastedText: string) => {
    try {
      const parsed = JSON.parse(pastedText)
      if (parsed.deadline && parsed.v && parsed.r && parsed.s) {
        setSignatureData({
          deadline: parsed.deadline.toString(),
          v: parsed.v.toString(),
          r: parsed.r,
          s: parsed.s
        })
        setError('')
      }
    } catch (e) {
      // 如果不是JSON格式，忽略错误
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-yellow-400 flex items-center">
                  🔐 白名单购买
                </CardTitle>
                <CardDescription className="text-gray-400">
                  请输入项目方提供的签名信息进行购买
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 购买信息 */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Listing ID:</span>
                    <span className="text-white">{listingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价格:</span>
                    <span className="text-green-400 font-medium">
                      {formatEther(BigInt(price))} {tokenSymbol || 'Token'}
                    </span>
                  </div>
                </div>

                {/* 签名信息输入 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      签名截止时间 (Deadline)
                    </label>
                    <input
                      type="text"
                      value={signatureData.deadline}
                      onChange={(e) => handleSignatureDataChange('deadline', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="1735833600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      签名 V 值
                    </label>
                    <input
                      type="text"
                      value={signatureData.v}
                      onChange={(e) => handleSignatureDataChange('v', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="27"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      签名 R 值
                    </label>
                    <input
                      type="text"
                      value={signatureData.r}
                      onChange={(e) => handleSignatureDataChange('r', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      签名 S 值
                    </label>
                    <input
                      type="text"
                      value={signatureData.s}
                      onChange={(e) => handleSignatureDataChange('s', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>
                </div>

                {/* 快速粘贴区域 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    或粘贴完整签名JSON
                  </label>
                  <textarea
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
                    rows={4}
                    placeholder='{"deadline":"1735833600","v":"27","r":"0x...","s":"0x..."}'
                    onChange={(e) => handlePasteSignature(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    粘贴从白名单管理后台复制的签名JSON数据
                  </p>
                </div>

                {/* 错误信息 */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-300"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onClick={handleBuy}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '购买中...' : '确认购买'}
                  </motion.button>
                </div>

                {/* 使用说明 */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    💡 <strong>使用说明:</strong>
                  </p>
                  <ul className="text-blue-300 text-xs mt-2 space-y-1">
                    <li>• 从白名单管理后台获取签名信息</li>
                    <li>• 可以单独填写各个字段，或直接粘贴JSON</li>
                    <li>• 确保签名未过期且针对当前买家地址</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
