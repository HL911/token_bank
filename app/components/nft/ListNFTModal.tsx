'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNFTMarket } from '../../contracts/hooks/useNFTMarket'
import { CONTRACT_ADDRESSES } from '../../contracts/addresses'
import { useERC20Symbol } from '../../contracts/hooks/useERC20Info'
import { validateTokenAddress, formatAddress } from '../../utils/addressValidation'

interface ListNFTModalProps {
  isOpen: boolean
  onClose: () => void
  tokenId: string
  onSuccess?: () => void
}

export function ListNFTModal({ isOpen, onClose, tokenId, onSuccess }: ListNFTModalProps) {
  const [price, setPrice] = useState('')
  const [paymentToken, setPaymentToken] = useState('')
  const [customTokenAddress, setCustomTokenAddress] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [whitelistOnly, setWhitelistOnly] = useState(false)
  const [error, setError] = useState('')
  const { listNFT, isLoading } = useNFTMarket()
  const { symbol: myTokenSymbol } = useERC20Symbol(CONTRACT_ADDRESSES.MY_TOKEN)
  const { symbol: customTokenSymbol } = useERC20Symbol(customTokenAddress || undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!price || parseFloat(price) <= 0) {
      setError('请输入有效的价格')
      return
    }

    // 决定使用的代币地址
    let finalTokenAddress = paymentToken
    
    if (paymentToken === 'custom' && showCustomInput) {
      // 验证自定义代币地址
      const validation = validateTokenAddress(customTokenAddress)
      if (!validation.isValid) {
        setError(validation.error || '无效的代币地址')
        return
      }
      finalTokenAddress = customTokenAddress
    }

    try {
      await listNFT(tokenId, price, finalTokenAddress || undefined, whitelistOnly)
      setPrice('')
      setPaymentToken('')
      setCustomTokenAddress('')
      setShowCustomInput(false)
      setWhitelistOnly(false)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('上架失败:', error)
      setError(error.message || '上架失败，请重试')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setPrice('')
      setPaymentToken('')
      setCustomTokenAddress('')
      setShowCustomInput(false)
      setWhitelistOnly(false)
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">上架 NFT</h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-gray-600/30 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-white font-medium">NFT #{tokenId}</p>
            <p className="text-gray-400 text-sm">准备上架到市场</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              设置价格
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例如: 0.1"
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              支付代币
            </label>
            <select
              value={paymentToken}
              onChange={(e) => {
                setPaymentToken(e.target.value)
                setShowCustomInput(e.target.value === 'custom')
                if (e.target.value !== 'custom') {
                  setCustomTokenAddress('')
                }
              }}
              disabled={isLoading}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              <option value="">使用默认代币 ({myTokenSymbol || 'MyToken'})</option>
              <option value={CONTRACT_ADDRESSES.MY_TOKEN}>{myTokenSymbol || 'MyToken'} - MyToken</option>
              <option value="0x0000000000000000000000000000000000000000">ETH - 以太币</option>
              <option value="custom">🔧 自定义ERC20代币</option>
            </select>
            <p className="text-gray-400 text-xs mt-1">
              选择买家需要支付的代币类型
            </p>
          </div>

          {/* 自定义ERC20代币地址输入 */}
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ERC20代币地址
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customTokenAddress}
                  onChange={(e) => setCustomTokenAddress(e.target.value)}
                  placeholder="输入ERC20代币合约地址 (0x...)"
                  disabled={isLoading}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 font-mono text-sm"
                />
                {customTokenAddress && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      地址: {formatAddress(customTokenAddress)}
                    </span>
                    {customTokenSymbol && (
                      <span className="text-green-400">
                        符号: {customTokenSymbol}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-gray-400 text-xs">
                  请确保输入的是有效的ERC20代币合约地址
                </p>
              </div>
            </motion.div>
          )}

          {/* 白名单限制选项 */}
          <div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="whitelistOnly"
                checked={whitelistOnly}
                onChange={(e) => setWhitelistOnly(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2 disabled:opacity-50"
              />
              <label htmlFor="whitelistOnly" className="text-sm font-medium text-gray-300">
                🔒 仅限白名单用户购买
              </label>
            </div>
            <p className="text-gray-400 text-xs mt-2 ml-7">
              启用后，只有获得项目方签名授权的用户才能购买此NFT
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">📋 上架说明</h4>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li>• 上架需要先授权NFT给市场合约</li>
              <li>• 授权完成后会自动进行上架</li>
              <li>• 可以选择接受的支付代币类型（MyToken或ETH）</li>
              <li>• 上架成功后其他用户可以购买您的NFT</li>
              <li>• 您可以随时取消上架</li>
              {whitelistOnly && (
                <li className="text-yellow-300">• 🔒 白名单限制：只有获得项目方签名的用户才能购买</li>
              )}
            </ul>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
            >
              取消
            </button>
            <motion.button
              type="submit"
              disabled={isLoading || !price}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-3 rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  <span>上架中...</span>
                </div>
              ) : (
                '确认上架'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
