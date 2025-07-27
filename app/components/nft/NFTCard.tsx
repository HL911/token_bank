'use client'

import { motion } from 'framer-motion'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNFTMarket, useNFTOwner, useNFTMetadata } from '../../contracts/hooks/useNFTMarket'
import { CONTRACT_ADDRESSES } from '../../contracts/addresses'
import { useTokenDisplayName } from '../../contracts/hooks/useERC20Info'
import { useState } from 'react'

interface NFTCardProps {
  tokenId: string
  listingId?: string
  price?: string
  seller?: string
  isListed?: boolean
  onRefresh?: () => void
  showListingActions?: boolean // 是否显示内部的上架相关操作
  ownerAddress?: string // 直接传入所有者地址，避免重复查询
  paymentToken?: string // 支付代币地址
}

export function NFTCard({ 
  tokenId, 
  listingId, 
  price, 
  seller, 
  isListed = false,
  onRefresh,
  showListingActions = true,
  ownerAddress,
  paymentToken
}: NFTCardProps) {
  const { address } = useAccount()
  const { buyNFT, cancelListing, isLoading } = useNFTMarket()
  const tokenSymbol = useTokenDisplayName(paymentToken)
  const { owner } = useNFTOwner(BigInt(tokenId))
  const { tokenURI } = useNFTMetadata(BigInt(tokenId))
  
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()
  const isSeller = address && seller && address.toLowerCase() === seller.toLowerCase()

  const handleBuy = async () => {
    if (!listingId) return
    try {
      await buyNFT(listingId)
      setShowBuyModal(false)
      // 等待一小段时间让交易确认，然后刷新状态
      setTimeout(() => {
        onRefresh?.()
      }, 2000)
    } catch (error) {
      console.error('购买失败:', error)
    }
  }

  const handleCancel = async () => {
    if (!listingId) return
    try {
      await cancelListing(listingId)
      setShowCancelModal(false)
      // 等待一小段时间让交易确认，然后刷新状态
      setTimeout(() => {
        onRefresh?.()
      }, 2000)
    } catch (error) {
      console.error('取消上架失败:', error)
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">NFT #{tokenId}</CardTitle>
              {isListed ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  在售
                </Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                  未上架
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-400">
              所有者: {ownerAddress ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : (owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : '加载中...')}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* NFT图片占位符 */}
            <div className="w-full h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg mb-4 flex items-center justify-center border border-gray-600/30">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl"
              >
                🖼️
              </motion.div>
            </div>

            {/* NFT信息 */}
            <div className="space-y-3 flex-1">
              {tokenURI && (
                <div>
                  <p className="text-sm text-gray-400">元数据URI:</p>
                  <p className="text-xs text-green-400 font-mono break-all">
                    {tokenURI.length > 50 ? `${tokenURI.slice(0, 50)}...` : tokenURI}
                  </p>
                </div>
              )}

              {isListed && price && (
                <div>
                  <p className="text-sm text-gray-400">价格:</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatEther(BigInt(price))} {tokenSymbol}
                  </p>
                  {paymentToken && (
                    <p className="text-xs text-gray-500">
                      支付代币: {tokenSymbol}
                    </p>
                  )}
                </div>
              )}

              {isListed && seller && (
                <div>
                  <p className="text-sm text-gray-400">卖家:</p>
                  <p className="text-sm text-blue-400 font-mono">
                    {seller.slice(0, 6)}...{seller.slice(-4)}
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 space-y-2">
              {isListed && !isSeller && address && (
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={() => setShowBuyModal(true)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '处理中...' : '购买'}
                </motion.button>
              )}

              {isListed && isSeller && (
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={() => setShowCancelModal(true)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-400 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '处理中...' : '取消上架'}
                </motion.button>
              )}

              {!isListed && isOwner && showListingActions && (
                <p className="text-center text-gray-400 text-sm py-2">
                  您可以在"我的NFT"页面上架此NFT
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 购买确认模态框 */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">确认购买</h3>
            <p className="text-gray-300 mb-6">
              您确定要购买 NFT #{tokenId} 吗？
              <br />
              价格: <span className="text-green-400 font-bold">{price && formatEther(BigInt(price))} ETH</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleBuy}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '购买中...' : '确认购买'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 取消上架确认模态框 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">确认取消上架</h3>
            <p className="text-gray-300 mb-6">
              您确定要取消 NFT #{tokenId} 的上架吗？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-400 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '取消中...' : '确认取消'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
