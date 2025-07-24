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
  const [showHistory, setShowHistory] = useState(false)
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

  // 将原始事件转换为统一的NFTEvent格式
  const allEvents: NFTEvent[] = useMemo(() => {
    const events: NFTEvent[] = []
    
    // 处理上架事件
    listedEvents.forEach((event, index) => {
      events.push({
        id: `listed-${index}-${event.transactionHash}`,
        type: 'listed',
        tokenId: event.tokenId.toString(),
        price: formatEther(event.price),
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
        price: formatEther(event.price),
        seller: event.seller,
        buyer: event.buyer,
        timestamp: new Date(Number(event.timestamp) * 1000),
        transactionHash: event.transactionHash
      })
    })
    
    // 处理取消上架事件
    cancelledEvents.forEach((event, index) => {
      events.push({
        id: `cancelled-${index}-${event.transactionHash}`,
        type: 'cancelled',
        tokenId: event.listingId.toString(),
        seller: 'Unknown', // cancelledEvents没有seller字段
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
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-medium hover:from-purple-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                >
                  <span>📊</span>
                  {showHistory ? '隐藏历史' : '查看历史'}
                </motion.button>
                
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

        {/* 历史记录切换提示 */}
        {!showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">📊 事件历史记录</h2>
              <p className="text-gray-600 mb-4">点击上方"查看历史"按钮可以查看详细的事件监听历史记录</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-800">📝 上架事件历史</div>
                  <div className="text-blue-600">查看所有NFT上架记录</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-800">💰 售出事件历史</div>
                  <div className="text-green-600">查看所有NFT交易记录</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="font-medium text-red-800">❌ 取消事件历史</div>
                  <div className="text-red-600">查看所有取消上架记录</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 事件列表 - 仅在显示历史时展示 */}
        {showHistory && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📊 事件历史记录</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span>👁️</span>
                隐藏历史
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NFT 上架事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span>
              NFT 上架事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {listedEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无上架事件</p>
              ) : (
                listedEvents.map((event, index) => (
                  <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-blue-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">卖家:</span>
                        <span className="font-mono text-xs">{event.seller.slice(0, 6)}...{event.seller.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono">#{event.tokenId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">价格:</span>
                        <span className="font-bold text-blue-600">{formatEther(event.price)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NFT 售出事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span>
              NFT 售出事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {soldEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无售出事件</p>
              ) : (
                soldEvents.map((event, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-green-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">买家:</span>
                        <span className="font-mono text-xs">{event.buyer.slice(0, 6)}...{event.buyer.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">卖家:</span>
                        <span className="font-mono text-xs">{event.seller.slice(0, 6)}...{event.seller.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono">#{event.tokenId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">成交价:</span>
                        <span className="font-bold text-green-600">{formatEther(event.price)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NFT 取消上架事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>❌</span>
              取消上架事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cancelledEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无取消事件</p>
              ) : (
                cancelledEvents.map((event, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-red-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-red-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📝</span>
              <div>
                <p className="font-medium text-gray-800">上架事件</p>
                <p>当有 NFT 在市场上架时，会实时显示上架信息，包括卖家、价格等详情。</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">💰</span>
              <div>
                <p className="font-medium text-gray-800">售出事件</p>
                <p>当 NFT 成功售出时，会显示买家、卖家和成交价格等交易信息。</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500">❌</span>
              <div>
                <p className="font-medium text-gray-800">取消事件</p>
                <p>当卖家取消 NFT 上架时，会记录取消上架的相关信息。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
