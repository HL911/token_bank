'use client'

import { useWriteContract, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'
import MyERC721ABI from '../abis/MyERC721.json'
import { useState, useCallback } from 'react'

export function useNFTMint() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  
  const { writeContract } = useWriteContract()

  // 铸造NFT
  const mintNFT = useCallback(async (to: string, tokenURI: string) => {
    if (!address) throw new Error('请先连接钱包')
    
    setIsLoading(true)
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MY_ERC721,
        abi: MyERC721ABI,
        functionName: 'mint',
        args: [to, tokenURI]
      })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  return {
    mintNFT,
    isLoading
  }
}
