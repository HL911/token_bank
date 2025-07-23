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

  useEffect(() => {
    if (!publicClient) return

    let unsubscribeListed: (() => void) | undefined
    let unsubscribeSold: (() => void) | undefined
    let unsubscribeCancelled: (() => void) | undefined

    const startListening = async () => {
      try {
        setIsListening(true)
        console.log('🎯 开始监听 NFT 市场事件...')

        // 监听 NFT 上架事件
        unsubscribeListed = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTListed',
          onLogs: async (logs) => {
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
          }
        })

        // 监听 NFT 售出事件
        unsubscribeSold = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTSold',
          onLogs: async (logs) => {
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
          }
        })

        // 监听 NFT 取消上架事件
        unsubscribeCancelled = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.NFT_MARKET,
          abi: NFTMarketABI,
          eventName: 'NFTListingCancelled',
          onLogs: async (logs) => {
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
          }
        })

        console.log('✅ NFT 市场事件监听已启动')
      } catch (error) {
        console.error('❌ 启动 NFT 事件监听失败:', error)
        setIsListening(false)
      }
    }

    startListening()

    // 清理函数
    return () => {
      if (unsubscribeListed) {
        unsubscribeListed()
        console.log('🔇 停止监听 NFT 上架事件')
      }
      if (unsubscribeSold) {
        unsubscribeSold()
        console.log('🔇 停止监听 NFT 售出事件')
      }
      if (unsubscribeCancelled) {
        unsubscribeCancelled()
        console.log('🔇 停止监听 NFT 取消上架事件')
      }
      setIsListening(false)
    }
  }, [publicClient])

  return {
    listedEvents,
    soldEvents,
    cancelledEvents,
    isListening,
    // 清空事件历史
    clearEvents: () => {
      setListedEvents([])
      setSoldEvents([])
      setCancelledEvents([])
    }
  }
}
