import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'
import NFTMarketABI from '../abis/NFTMarket.json'

// NFT 上架事件类型
export interface NFTListedEvent {
  listingId: bigint
  seller: string
  nftContract: string
  tokenId: bigint
  price: bigint
  blockNumber: bigint
  transactionHash: string
  timestamp: number
}

// NFT 售出事件类型
export interface NFTSoldEvent {
  listingId: bigint
  buyer: string
  seller: string
  nftContract: string
  tokenId: bigint
  price: bigint
  blockNumber: bigint
  transactionHash: string
  timestamp: number
}

// NFT 取消上架事件类型
export interface NFTListingCancelledEvent {
  listingId: bigint
  blockNumber: bigint
  transactionHash: string
  timestamp: number
}

export const useNFTMarketEvents = () => {
  const publicClient = usePublicClient()
  const [listedEvents, setListedEvents] = useState<NFTListedEvent[]>([])
  const [soldEvents, setSoldEvents] = useState<NFTSoldEvent[]>([])
  const [cancelledEvents, setCancelledEvents] = useState<NFTListingCancelledEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<{
    listed?: () => void
    sold?: () => void
    cancelled?: () => void
  }>({})

  // 手动停止监听函数
  const stopListening = () => {
    if (unsubscribeFunctions.listed) {
      unsubscribeFunctions.listed()
      console.log('🔇 停止监听 NFT 上架事件')
    }
    if (unsubscribeFunctions.sold) {
      unsubscribeFunctions.sold()
      console.log('🔇 停止监听 NFT 售出事件')
    }
    if (unsubscribeFunctions.cancelled) {
      unsubscribeFunctions.cancelled()
      console.log('🔇 停止监听 NFT 取消上架事件')
    }
    setUnsubscribeFunctions({})
    setIsListening(false)
    console.log('⏹️ 已停止所有 NFT 事件监听')
  }

  // 手动开始监听函数
  const startListening = async () => {
    if (!publicClient) {
      console.log('❌ 无法获取公共客户端，请检查网络连接')
      return
    }

    if (isListening) {
      console.log('⚠️ 监听已在进行中')
      return
    }

    try {
      setIsListening(true)
      console.log('🎯 开始监听 NFT 市场事件...')

      let unsubscribeListed: (() => void) | undefined
      let unsubscribeSold: (() => void) | undefined
      let unsubscribeCancelled: (() => void) | undefined



      // 监听 NFT 上架事件
      unsubscribeListed = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTListed',
          onLogs: async (logs) => {
            try {
              for (const log of logs) {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
                const event: NFTListedEvent = {
                  listingId: log.args.listingId as bigint,
                  seller: log.args.seller as string,
                  nftContract: log.args.nftContract as string,
                  tokenId: log.args.tokenId as bigint,
                  price: log.args.price as bigint,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                  timestamp: Number(block.timestamp)
                }
                
                console.log('📝 NFT 上架事件:', {
                  listingId: event.listingId.toString(),
                  seller: event.seller,
                  nftContract: event.nftContract,
                  tokenId: event.tokenId.toString(),
                  price: event.price.toString(),
                  transactionHash: event.transactionHash,
                  timestamp: new Date(event.timestamp * 1000).toLocaleString()
                })
                
                setListedEvents(prev => [event, ...prev])
              }
            } catch (error) {
              console.error('❌ 处理上架事件时出错:', error)
            }
          },
          onError: (error) => {
            console.error('🔌 上架事件监听连接错误:', error)
            console.log('🔄 尝试重新连接...')
            // 延迟重连，避免频繁重连
            setTimeout(() => {
              if (isListening) {
                console.log('🔄 重新启动上架事件监听')
                stopListening()
                setTimeout(startListening, 1000)
              }
            }, 3000)
          }
        })

      // 监听 NFT 售出事件
      unsubscribeSold = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTSold',
          onLogs: async (logs) => {
            try {
              for (const log of logs) {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
                const event: NFTSoldEvent = {
                  listingId: log.args.listingId as bigint,
                  buyer: log.args.buyer as string,
                  seller: log.args.seller as string,
                  nftContract: log.args.nftContract as string,
                  tokenId: log.args.tokenId as bigint,
                  price: log.args.price as bigint,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                  timestamp: Number(block.timestamp)
                }
                
                console.log('💰 NFT 售出事件:', {
                  listingId: event.listingId.toString(),
                  buyer: event.buyer,
                  seller: event.seller,
                  nftContract: event.nftContract,
                  tokenId: event.tokenId.toString(),
                  price: event.price.toString(),
                  transactionHash: event.transactionHash,
                  timestamp: new Date(event.timestamp * 1000).toLocaleString()
                })
                
                setSoldEvents(prev => [event, ...prev])
              }
            } catch (error) {
              console.error('❌ 处理售出事件时出错:', error)
            }
          },
          onError: (error) => {
            console.error('🔌 售出事件监听连接错误:', error)
            console.log('🔄 尝试重新连接...')
            setTimeout(() => {
              if (isListening) {
                console.log('🔄 重新启动售出事件监听')
                stopListening()
                setTimeout(startListening, 1000)
              }
            }, 3000)
          }
        })

      // 监听 NFT 取消上架事件
      unsubscribeCancelled = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTListingCancelled',
          onLogs: async (logs) => {
            try {
              for (const log of logs) {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
                const event: NFTListingCancelledEvent = {
                  listingId: log.args.listingId as bigint,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                  timestamp: Number(block.timestamp)
                }
                
                console.log('❌ NFT 取消上架事件:', {
                  listingId: event.listingId.toString(),
                  transactionHash: event.transactionHash,
                  timestamp: new Date(event.timestamp * 1000).toLocaleString()
                })
                
                setCancelledEvents(prev => [event, ...prev])
              }
            } catch (error) {
              console.error('❌ 处理取消事件时出错:', error)
            }
          },
          onError: (error) => {
            console.error('🔌 取消事件监听连接错误:', error)
            console.log('🔄 尝试重新连接...')
            setTimeout(() => {
              if (isListening) {
                console.log('🔄 重新启动取消事件监听')
                stopListening()
                setTimeout(startListening, 1000)
              }
            }, 3000)
          }
        })

      // 保存取消订阅函数
      setUnsubscribeFunctions({
        listed: unsubscribeListed,
        sold: unsubscribeSold,
        cancelled: unsubscribeCancelled
      })

      console.log('✅ NFT 市场事件监听已启动')
    } catch (error) {
      console.error('❌ 启动 NFT 事件监听失败:', error)
      setIsListening(false)
    }
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  return {
    listedEvents,
    soldEvents,
    cancelledEvents,
    isListening,
    // 手动开始监听
    startListening,
    // 手动停止监听
    stopListening,
    // 清空事件历史
    clearEvents: () => {
      setListedEvents([])
      setSoldEvents([])
      setCancelledEvents([])
      console.log('🗑️ 已清空所有事件历史记录')
    }
  }
}
