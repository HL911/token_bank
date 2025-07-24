'use client'

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

interface NFTEventCardProps {
  event: NFTEvent
  className?: string
}

const eventConfig = {
  listed: {
    title: 'NFT 上架',
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: '🏷️',
    description: '新的NFT已上架销售'
  },
  sold: {
    title: 'NFT 售出',
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: '✅',
    description: 'NFT交易成功完成'
  },
  cancelled: {
    title: '取消上架',
    color: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    icon: '❌',
    description: 'NFT上架已被取消'
  }
}

export function NFTEventCard({ event, className }: NFTEventCardProps) {
  const config = eventConfig[event.type]
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toFixed(4)} ETH`
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      config.color,
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <CardTitle className="text-lg font-semibold">
              {config.title}
            </CardTitle>
          </div>
          <Badge className={config.badgeColor}>
            Token #{event.tokenId}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {config.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">卖家:</span>
            <span className="ml-2 font-mono text-gray-600">
              {formatAddress(event.seller)}
            </span>
          </div>
          
          {event.buyer && (
            <div>
              <span className="font-medium text-gray-700">买家:</span>
              <span className="ml-2 font-mono text-gray-600">
                {formatAddress(event.buyer)}
              </span>
            </div>
          )}
          
          {event.price && (
            <div>
              <span className="font-medium text-gray-700">价格:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {formatPrice(event.price)}
              </span>
            </div>
          )}
          
          <div>
            <span className="font-medium text-gray-700">时间:</span>
            <span className="ml-2 text-gray-600">
              {event.timestamp.toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>交易哈希:</span>
            <span className="font-mono">
              {formatAddress(event.transactionHash)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
