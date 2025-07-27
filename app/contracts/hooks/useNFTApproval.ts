'use client'

import { useReadContract, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'
import MyERC721ABI from '../abis/MyERC721.json'

/**
 * 检查NFT是否已授权给指定地址
 */
export function useNFTApproval(tokenId?: string) {
  const { data: approvedAddress, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_ERC721,
    abi: MyERC721ABI,
    functionName: 'getApproved',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId
    }
  })

  const isApprovedForMarket = approvedAddress === CONTRACT_ADDRESSES.NFT_MARKET

  return {
    approvedAddress,
    isApprovedForMarket,
    refetch
  }
}

/**
 * 使用publicClient直接检查授权状态（用于异步调用）
 */
export async function checkNFTApproval(publicClient: any, tokenId: string): Promise<boolean> {
  try {
    const approvedAddress = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.MY_ERC721,
      abi: MyERC721ABI,
      functionName: 'getApproved',
      args: [BigInt(tokenId)]
    })
    
    return approvedAddress === CONTRACT_ADDRESSES.NFT_MARKET
  } catch (error) {
    console.error('检查授权状态失败:', error)
    return false
  }
}
