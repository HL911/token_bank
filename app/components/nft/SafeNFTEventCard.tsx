'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface NFTEvent {
  id: string
  type: 'listed' | 'sold' | 'cancelled'
  tokenId: string
  price?: string
  seller: string
  buyer?: string
  timestamp: Date
  transactionHash: string
}

interface SafeNFTEventCardProps {
  event: NFTEvent
  className?: string
  index?: number
}

const eventConfig = {
  listed: {
    title: 'NFT 上架',
    color: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-blue-500/30',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: '🏷️',
    iconBg: 'bg-blue-500/20',
    description: '新的NFT已上架销售',
    accentColor: 'text-blue-400'
  },
  sold: {
    title: 'NFT 售出',
    color: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-green-500/30',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    icon: '✅',
    iconBg: 'bg-green-500/20',
    description: 'NFT交易成功完成',
    accentColor: 'text-green-400'
  },
  cancelled: {
    title: '取消上架',
    color: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-orange-500/30',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: '❌',
    iconBg: 'bg-orange-500/20',
    description: 'NFT上架已被取消',
    accentColor: 'text-orange-400'
  }
}

export function SafeNFTEventCard({ event, className, index = 0 }: SafeNFTEventCardProps) {
  const config = eventConfig[event.type]
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    
    // 根据价格大小选择合适的精度
    if (numPrice >= 1) {
      return `${numPrice.toFixed(4)} ETH`
    } else if (numPrice >= 0.001) {
      return `${numPrice.toFixed(6)} ETH`
    } else {
      return `${numPrice.toExponential(3)} ETH`
    }
  }

  const formatTokenAmount = (price: string) => {
    const numPrice = parseFloat(price)
    
    // 显示完整的代币数量信息
    return {
      amount: numPrice,
      formatted: formatPrice(price),
      wei: price, // 原始wei值
      symbol: 'ETH'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("group", className)}
    >
      <Card className={cn(
        "backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl",
        config.color,
        "hover:border-green-500/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.iconBg)}
              >
                <span className="text-lg">{config.icon}</span>
              </motion.div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  {config.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  {config.description}
                </CardDescription>
              </div>
            </div>
            <Badge className={cn("border", config.badgeColor)}>
              Token #{event.tokenId}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
              <span className="font-medium text-gray-300">卖家:</span>
              <span className="font-mono text-gray-100">
                {formatAddress(event.seller)}
              </span>
            </div>
            
            {event.buyer && (
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                <span className="font-medium text-gray-300">买家:</span>
                <span className="font-mono text-gray-100">
                  {formatAddress(event.buyer)}
                </span>
              </div>
            )}
            
            {event.price && (
              <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                <span className="font-medium text-gray-300">价格:</span>
                <span className={cn("font-bold", config.accentColor)}>
                  {event.price}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
              <span className="font-medium text-gray-300">时间:</span>
              <span className="text-gray-100 text-xs">
                {event.timestamp.toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
          
          <motion.div 
            className="pt-3 border-t border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">交易哈希:</span>
              <motion.a
                href={`https://etherscan.io/tx/${event.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-green-400 hover:text-green-300 transition-colors duration-200 underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {formatAddress(event.transactionHash)}
              </motion.a>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
