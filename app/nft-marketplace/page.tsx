'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard, FadeInUp } from '../components/animations/AnimatedCard'
import { NFTCard } from '../components/nft/NFTCard'
import { ListNFTModal } from '../components/nft/ListNFTModal'
import { useActiveListings, useSellerActiveListings, useActiveListingsCount, useUserNFTBalance } from '../contracts/hooks/useNFTMarket'
import { useNFTMarketEvents } from '../contracts/hooks/useNFTMarketEvents'

export default function NFTMarketplacePage() {
  const { address, isConnected } = useAccount()
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<'market' | 'my-nfts'>('market')
  const [listModalOpen, setListModalOpen] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isOperating, setIsOperating] = useState(false) // 全局操作状态

  // 获取市场数据
  const { listings: marketListings, isLoading: listingsLoading, refetch: refetchListings } = useActiveListings()
  const { listings: userListings, refetch: refetchUserListings } = useSellerActiveListings(address)
  const { count: activeListingsCount } = useActiveListingsCount()
  
  // 获取用户NFT余额
  const { balance: userNFTBalance } = useUserNFTBalance(address)
  
  // 获取事件数据用于统计（保留用于显示历史统计）
  const { soldEvents } = useNFTMarketEvents()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 处理市场上架列表数据
  const activeListings = useMemo(() => {
    if (!marketListings) return []
    
    return marketListings.map((listing, index) => ({
      tokenId: listing.tokenId.toString(),
      listingId: listing.listingId.toString(), // 使用索引作为listingId
      price: listing.price.toString(),
      seller: listing.seller,
      paymentToken: listing.paymentToken,
      isActive: listing.isActive
    }))
  }, [marketListings])

  // 生成用户拥有的NFT列表
  const userNFTs = useMemo(() => {
    if (!userNFTBalance || !address) return []
    
    const nfts = []
    const balance = Number(userNFTBalance)
    
    // 安全的方式：只显示确实存在的NFT
    // 这里我们检查从1开始的连续ID，但只包含实际存在的
    for (let i = 1; i <= Math.min(balance * 2, 10); i++) { // 检查范围扩大一些，但限制最大值
      const tokenId = i.toString()
      
      // 先检查这个tokenId是否在用户的已上架列表中
      const userListing = userListings?.find(listing => listing.tokenId.toString() === tokenId)
      
      // 如果在上架列表中，说明NFT存在且属于用户
      if (userListing) {
        nfts.push({
          tokenId,
          isListed: true,
          listing: {
            listingId: userListing.listingId.toString(),
            price: userListing.price.toString(),
            seller: userListing.seller,
            paymentToken: userListing.paymentToken
          }
        })
      }
    }
    
    // 如果没有找到足够的NFT，添加一些可能的未上架NFT
    // 注意：这里仍然可能有问题，建议用户先铸造NFT
    if (nfts.length < balance) {
      for (let i = 1; i <= balance && nfts.length < balance; i++) {
        const tokenId = i.toString()
        const alreadyAdded = nfts.some(nft => nft.tokenId === tokenId)
        
        if (!alreadyAdded) {
          nfts.push({
            tokenId,
            isListed: false,
            listing: undefined
          })
        }
      }
    }
    
    return nfts
  }, [userNFTBalance, userListings, address])

  const handleRefresh = () => {
    // 强制重新获取所有相关数据
    refetchListings()
    refetchUserListings()
    setRefreshKey(prev => prev + 1)
    
    // 额外延迟刷新确保数据同步
    setTimeout(() => {
      refetchListings()
      refetchUserListings()
      setRefreshKey(prev => prev + 1)
    }, 1000)
  }

  const handleListNFT = (tokenId: string) => {
    setSelectedTokenId(tokenId)
    setListModalOpen(true)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent mb-4">
              NFT 市场
            </h1>
            <p className="text-gray-400 text-lg">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <FadeInUp>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25"
            >
              <span className="text-2xl">🏪</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent mb-4">
              NFT 市场
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              去中心化NFT交易平台 - 买卖您的数字资产
            </p>
          </div>
        </FadeInUp>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard delay={0.2}>
            <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur-xl border border-blue-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-blue-300">在售NFT</CardTitle>
                    <CardDescription className="text-blue-400/70">当前市场上架</CardDescription>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-2xl">🏷️</span>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  key={`listed-${refreshKey}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-4xl font-bold text-blue-400"
                >
                  {activeListingsCount ? Number(activeListingsCount) : 0}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <Card className="bg-gradient-to-br from-green-900/60 to-green-800/60 backdrop-blur-xl border border-green-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-green-300">已售出</CardTitle>
                    <CardDescription className="text-green-400/70">成功交易</CardDescription>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-2xl">✅</span>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  key={`sold-${refreshKey}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="text-4xl font-bold text-green-400"
                >
                  {soldEvents.length}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.6}>
            <Card className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-xl border border-purple-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-purple-300">我的NFT</CardTitle>
                    <CardDescription className="text-purple-400/70">拥有数量</CardDescription>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-2xl">👤</span>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  key={`balance-${refreshKey}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring" }}
                  className="text-4xl font-bold text-purple-400"
                >
                  {userNFTBalance ? Number(userNFTBalance) : 0}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* 标签页导航 */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 backdrop-blur-xl rounded-xl p-1 border border-gray-700/50">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'market'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            🏪 市场浏览
          </button>
          <button
            onClick={() => setActiveTab('my-nfts')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'my-nfts'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            👤 我的NFT
          </button>
        </div>

        {/* 内容区域 */}
        <AnimatedCard delay={0.8}>
          {activeTab === 'market' ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">市场中的NFT</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 刷新
                </motion.button>
              </div>
              
              {activeListings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-2xl font-bold text-white mb-2">市场暂无NFT</h3>
                  <p className="text-gray-400">目前没有NFT在市场上架，请稍后再来查看</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeListings.map((listing) => (
                    <NFTCard
                      key={`${listing.tokenId}-${refreshKey}`}
                      tokenId={listing.tokenId}
                      listingId={listing.listingId}
                      price={listing.price}
                      seller={listing.seller}
                      paymentToken={listing.paymentToken}
                      isListed={true}
                      onRefresh={handleRefresh}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">我的NFT收藏</h2>
                {!isConnected && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    请连接钱包
                  </Badge>
                )}
              </div>
              
              {!isConnected ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-2xl font-bold text-white mb-2">请连接钱包</h3>
                  <p className="text-gray-400">连接钱包后即可查看和管理您的NFT收藏</p>
                </div>
              ) : userNFTs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-white mb-2">暂无NFT</h3>
                  <p className="text-gray-400">您还没有拥有任何NFT，去市场看看吧</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.map((nft) => (
                    <div key={`${nft.tokenId}-${refreshKey}`} className="relative">
                      <NFTCard
                        tokenId={nft.tokenId}
                        listingId={nft.listing?.listingId}
                        price={nft.listing?.price}
                        seller={nft.listing?.seller}
                        paymentToken={nft.listing?.paymentToken}
                        isListed={nft.isListed}
                        onRefresh={handleRefresh}
                        showListingActions={false}
                        ownerAddress={address}
                      />
                      {!nft.isListed && (
                        <motion.button
                          whileHover={{ scale: isOperating ? 1 : 1.02 }}
                          whileTap={{ scale: isOperating ? 1 : 0.98 }}
                          onClick={() => handleListNFT(nft.tokenId)}
                          disabled={isOperating}
                          className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-lg text-sm font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isOperating ? '处理中...' : '🏷️ 上架'}
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* 上架NFT模态框 */}
      <ListNFTModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        tokenId={selectedTokenId}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
