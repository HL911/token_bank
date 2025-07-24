'use client'

import { useNFTMarketEvents } from '../contracts/hooks/useNFTMarketEvents'
import { formatEther } from 'viem'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SafeNFTEventList } from '../components/nft/SafeNFTEventList'
import { NFTEvent } from '../components/nft/SafeNFTEventCard'
import { AnimatedCard, FadeInUp, PulseGlow } from '../components/animations/AnimatedCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function NFTMarketPage() {
  const [isClient, setIsClient] = useState(false)
  const { 
    listedEvents, 
    soldEvents, 
    cancelledEvents, 
    isListening,
    startListening,
    stopListening,
    clearEvents 
  } = useNFTMarketEvents()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 页面加载完成后自动开始监听
  useEffect(() => {
    if (isClient && !isListening) {
      startListening()
    }
  }, [isClient, isListening, startListening])

  // 将原始事件转换为统一的NFTEvent格式
  const allEvents: NFTEvent[] = useMemo(() => {
    const events: NFTEvent[] = []
    
    // 处理上架事件
    listedEvents.forEach((event, index) => {
      events.push({
        id: `listed-${index}-${event.transactionHash}`,
        type: 'listed',
        tokenId: event.tokenId.toString(),
        price: event.price.toString(),
        seller: event.seller,
        timestamp: new Date(Number(event.timestamp) * 1000),
        transactionHash: event.transactionHash
      })
    })
    
    // 处理售出事件
    soldEvents.forEach((event, index) => {
      events.push({
        id: `sold-${index}-${event.transactionHash}`,
        type: 'sold',
        tokenId: event.tokenId.toString(),
        price: event.price.toString(),
        seller: event.seller,
        buyer: event.buyer,
        timestamp: new Date(Number(event.timestamp) * 1000),
        transactionHash: event.transactionHash
      })
    })
    
    // 处理取消上架事件
    cancelledEvents.forEach((event, index) => {
      // 通过listingId查找对应的上架事件来获取卖家信息
      const correspondingListing = listedEvents.find(listedEvent => 
        listedEvent.listingId === event.listingId
      )
      
      events.push({
        id: `cancelled-${index}-${event.transactionHash}`,
        type: 'cancelled',
        tokenId: event.listingId.toString(),
        seller: correspondingListing?.seller || '未知卖家',
        timestamp: new Date(Number(event.timestamp) * 1000),
        transactionHash: event.transactionHash
      })
    })
    
    return events
  }, [listedEvents, soldEvents, cancelledEvents])

  // 防止水合错误，在客户端渲染完成前显示加载状态
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
              NFT 市场事件监听
            </h1>
            <p className="text-gray-400 text-lg">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <FadeInUp>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25"
            >
              <span className="text-2xl">📊</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent mb-4">
              NFT 市场事件监听
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              实时监控链上NFT交易活动 - 安全、透明、去中心化
            </p>
          </div>
        </FadeInUp>
        
        {/* 控制面板 */}
        <AnimatedCard delay={0.4} className="mb-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {/* 状态指示器 */}
              <PulseGlow>
                <Badge className={`px-6 py-3 text-lg border-2 ${
                  isListening 
                    ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                    : 'bg-red-500/20 text-red-300 border-red-500/50'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  {isListening ? '正在监听中...' : '监听已停止'}
                </Badge>
              </PulseGlow>
              
              {/* 控制按钮 */}
              <div className="flex gap-3">
                {!isListening ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startListening}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black rounded-full font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                  >
                    <span>▶️</span>
                    开始监听
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopListening}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium hover:from-red-400 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                  >
                    <span>⏹️</span>
                    停止监听
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearEvents}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-medium hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <span>🗑️</span>
                  清空历史
                </motion.button>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* 事件统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard delay={0.6}>
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-xl border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-blue-300">上架事件</CardTitle>
                    <CardDescription className="text-blue-400/70">NFT上架到市场</CardDescription>
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
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="text-4xl font-bold text-blue-400"
                >
                  {listedEvents.length}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.7}>
            <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-xl border-green-500/30 hover:border-green-400/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-green-300">售出事件</CardTitle>
                    <CardDescription className="text-green-400/70">NFT成功售出</CardDescription>
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
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="text-4xl font-bold text-green-400"
                >
                  {soldEvents.length}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.8}>
            <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-xl border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-orange-300">取消事件</CardTitle>
                    <CardDescription className="text-orange-400/70">取消NFT上架</CardDescription>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-2xl">❌</span>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring" }}
                  className="text-4xl font-bold text-orange-400"
                >
                  {cancelledEvents.length}
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* NFT事件列表 */}
        <SafeNFTEventList events={allEvents} />

        {/* 使用说明 */}
        <AnimatedCard delay={1.2} className="mt-12">
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl border border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  📖
                </motion.span>
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                >
                  <span className="text-blue-400 text-xl">🏷️</span>
                  <div>
                    <p className="font-medium text-blue-300 mb-2">上架事件</p>
                    <p className="text-blue-200/70 text-sm">
                      当有 NFT 在市场上架时，会实时显示上架信息，包括卖家、价格等详情。
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                >
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <p className="font-medium text-green-300 mb-2">售出事件</p>
                    <p className="text-green-200/70 text-sm">
                      当 NFT 成功售出时，会显示买家、卖家和成交价格等交易信息。
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
                >
                  <span className="text-orange-400 text-xl">❌</span>
                  <div>
                    <p className="font-medium text-orange-300 mb-2">取消事件</p>
                    <p className="text-orange-200/70 text-sm">
                      当卖家取消 NFT 上架时，会记录取消上架的相关信息。
                    </p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  )
}
