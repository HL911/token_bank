'use client'

import { motion } from 'framer-motion'
import { SafeNFTEventCard, NFTEvent } from './SafeNFTEventCard'

interface SafeNFTEventListProps {
  events: NFTEvent[]
  className?: string
}

export function SafeNFTEventList({ events, className }: SafeNFTEventListProps) {
  if (events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16"
      >
        <motion.div 
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-6xl mb-4"
        >
          📭
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">暂无NFT事件</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          当有NFT上架、售出或取消上架时，事件将在这里以精美的卡片形式实时显示
        </p>
        <motion.div
          className="mt-6 flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>上架事件</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>售出事件</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span>取消事件</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // 按时间倒序排列事件
  const sortedEvents = [...events].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            NFT 市场事件
          </h2>
          <p className="text-gray-400 mt-2">实时监控链上NFT交易活动</p>
        </div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full px-4 py-2"
        >
          <span className="text-green-400 font-medium">
            共 {events.length} 个事件
          </span>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="grid gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {sortedEvents.map((event, index) => (
          <SafeNFTEventCard 
            key={event.id} 
            event={event}
            index={index}
            className="transform transition-all duration-300"
          />
        ))}
      </motion.div>
      
      {/* 底部渐变效果 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
      />
    </div>
  )
}
