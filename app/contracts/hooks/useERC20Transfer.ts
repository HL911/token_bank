'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'
import MyTokenABI from '../abis/MyToken.json'

export function useERC20Transfer() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // 转账ERC20代币
  const transferERC20 = async (to: string, amount: string, tokenAddress?: string) => {
    const contractAddress = (tokenAddress || CONTRACT_ADDRESSES.MY_TOKEN) as `0x${string}`
    
    try {
      await writeContract({
        address: contractAddress,
        abi: MyTokenABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parseUnits(amount, 18)] // 假设18位小数
      })
    } catch (error) {
      console.error('ERC20转账失败:', error)
      throw error
    }
  }

  return {
    transferERC20,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// 查询ERC20余额的hook
export function useERC20Balance(address?: string, tokenAddress?: string) {
  const contractAddress = (tokenAddress || CONTRACT_ADDRESSES.MY_TOKEN) as `0x${string}`
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: MyTokenABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address
    }
  })

  return {
    balance,
    isLoading,
    refetch
  }
}

// 查询ERC20代币信息的hook
export function useERC20TokenInfo(tokenAddress?: string) {
  const contractAddress = (tokenAddress || CONTRACT_ADDRESSES.MY_TOKEN) as `0x${string}`
  
  const { data: name } = useReadContract({
    address: contractAddress,
    abi: MyTokenABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: contractAddress,
    abi: MyTokenABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: contractAddress,
    abi: MyTokenABI,
    functionName: 'decimals',
  })

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number
  }
}
