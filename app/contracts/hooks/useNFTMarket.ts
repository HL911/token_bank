'use client'

import { useWriteContract, useReadContract, useAccount, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'
import NFTMarketABI from '../abis/NFTMarket.json'
import MyERC721ABI from '../abis/MyERC721.json'
import { useState, useCallback } from 'react'
import { checkNFTApproval } from './useNFTApproval'

export interface NFTListing {
  listingId: bigint
  seller: string
  nftContract: string
  tokenId: bigint
  price: bigint
  paymentToken: string
  isActive: boolean
}

export function useNFTMarket() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const publicClient = usePublicClient()
  
  // 写入合约的hooks
  const { writeContract: writeNFTMarket } = useWriteContract()
  const { writeContract: writeERC721 } = useWriteContract()
  


  // 上架NFT
  const listNFT = useCallback(async (tokenId: string, price: string, paymentToken?: string) => {
    if (!address) throw new Error('请先连接钱包')
    if (!publicClient) throw new Error('网络连接失败')
    
    setIsLoading(true)
    try {
      // 检查NFT是否已经授权给市场合约
      const isApproved = await checkNFTApproval(publicClient, tokenId)
      
      if (!isApproved) {
        console.log('NFT未授权，正在授权给市场合约...')
        // 只有在未授权的情况下才执行approve
        await writeERC721({
          address: CONTRACT_ADDRESSES.MY_ERC721,
          abi: MyERC721ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.NFT_MARKET, BigInt(tokenId)]
        })
        
        // 等待授权交易确认
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log('NFT已授权，跳过approve步骤')
      }

      // 执行上架操作
      await writeNFTMarket({
        address: CONTRACT_ADDRESSES.NFT_MARKET,
        abi: NFTMarketABI,
        functionName: 'list',
        args: [
          CONTRACT_ADDRESSES.MY_ERC721,
          BigInt(tokenId),
          parseEther(price),
          paymentToken || CONTRACT_ADDRESSES.MY_TOKEN // 默认使用MyToken作为支付代币
        ]
      })
      
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [address, publicClient, writeNFTMarket, writeERC721])

  // 购买NFT
  const buyNFT = useCallback(async (listingId: string) => {
    if (!address) throw new Error('请先连接钱包')
    
    setIsLoading(true)
    try {
      await writeNFTMarket({
        address: CONTRACT_ADDRESSES.NFT_MARKET,
        abi: NFTMarketABI,
        functionName: 'buy',
        args: [BigInt(listingId)]
      })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [address, writeNFTMarket])

  // 取消上架
  const cancelListing = useCallback(async (listingId: string) => {
    if (!address) throw new Error('请先连接钱包')
    
    setIsLoading(true)
    try {
      await writeNFTMarket({
        address: CONTRACT_ADDRESSES.NFT_MARKET,
        abi: NFTMarketABI,
        functionName: 'cancelListing',
        args: [BigInt(listingId)]
      })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [address, writeNFTMarket])

  return {
    listNFT,
    buyNFT,
    cancelListing,
    isLoading
  }
}

// 查询上架信息的hook
export function useNFTListing(listingId: bigint) {
  const { data: listing, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.NFT_MARKET,
    abi: NFTMarketABI,
    functionName: 'listings',
    args: [listingId],
  })

  return {
    listing: listing as NFTListing | undefined,
    isLoading,
    refetch
  }
}

// 查询NFT所有者的hook
export function useNFTOwner(tokenId: bigint) {
  const { data: owner, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_ERC721,
    abi: MyERC721ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  })

  return {
    owner: owner as string | undefined,
    isLoading,
    refetch
  }
}

// 查询NFT元数据的hook
export function useNFTMetadata(tokenId: bigint) {
  const { data: tokenURI, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_ERC721,
    abi: MyERC721ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  })

  return {
    tokenURI: tokenURI as string | undefined,
    isLoading
  }
}

// 查询用户NFT余额的hook
export function useUserNFTBalance(userAddress?: string) {
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_ERC721,
    abi: MyERC721ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress
    }
  })

  return {
    balance: balance as bigint | undefined,
    isLoading,
    refetch
  }
}

// 查询所有活跃上架列表的hook
export function useActiveListings() {
  const { data: listings, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.NFT_MARKET,
    abi: NFTMarketABI,
    functionName: 'getActiveListings',
    args: [],
  })

  return {
    listings: listings as NFTListing[] | undefined,
    isLoading,
    refetch
  }
}

// 查询特定卖家的活跃上架列表的hook
export function useSellerActiveListings(sellerAddress?: string) {
  const { data: listings, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.NFT_MARKET,
    abi: NFTMarketABI,
    functionName: 'getSellerActiveListings',
    args: sellerAddress ? [sellerAddress] : undefined,
    query: {
      enabled: !!sellerAddress
    }
  })

  return {
    listings: listings as NFTListing[] | undefined,
    isLoading,
    refetch
  }
}

// 查询活跃上架数量的hook
export function useActiveListingsCount() {
  const { data: count, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.NFT_MARKET,
    abi: NFTMarketABI,
    functionName: 'getActiveListingsCount',
    args: [],
  })

  return {
    count: count as bigint | undefined,
    isLoading,
    refetch
  }
}
