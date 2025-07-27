'use client'

import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'
import MyERC721ABI from '../abis/MyERC721.json'

/**
 * 检查NFT是否存在的hook
 */
export function useNFTExists(tokenId: string | undefined) {
  const { data: owner, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_ERC721,
    abi: MyERC721ABI,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
      retry: false, // 不重试，因为不存在的NFT会直接报错
    }
  })

  return {
    exists: !isError && !!owner,
    owner,
    isLoading,
    isError
  }
}

/**
 * 批量检查多个NFT是否存在
 */
export function useMultipleNFTExists(tokenIds: string[]) {
  const results = tokenIds.map(tokenId => {
    const { exists, owner, isLoading, isError } = useNFTExists(tokenId)
    return {
      tokenId,
      exists,
      owner,
      isLoading,
      isError
    }
  })

  const allLoaded = results.every(result => !result.isLoading)
  const existingNFTs = results.filter(result => result.exists)

  return {
    results,
    allLoaded,
    existingNFTs
  }
}
