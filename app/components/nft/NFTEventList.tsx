'use client'

import { NFTEventCard, NFTEvent } from './NFTEventCard'

interface NFTEventListProps {
  events: NFTEvent[]
  className?: string
}

export function NFTEventList({ events, className }: NFTEventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">📭</div>
        <p className="text-gray-500">暂无NFT事件</p>
        <p className="text-sm text-gray-400 mt-1">
          当有NFT上架、售出或取消上架时，事件将在这里显示
        </p>
      </div>
    )
  }

  // 按时间倒序排列事件
  const sortedEvents = [...events].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          NFT 市场事件
        </h2>
        <div className="text-sm text-gray-500">
          共 {events.length} 个事件
        </div>
      </div>
      
      <div className="grid gap-4">
        {sortedEvents.map((event) => (
          <NFTEventCard 
            key={event.id} 
            event={event}
            className="animate-in slide-in-from-top-2 duration-300"
          />
        ))}
      </div>
    </div>
  )
}
