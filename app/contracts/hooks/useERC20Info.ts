'use client'

import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'

// 标准ERC20 ABI，只包含我们需要的函数
const ERC20_ABI = [
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export function useERC20Symbol(tokenAddress?: string) {
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000'
    }
  })

  // 获取代币显示信息
  const getTokenInfo = (address?: string) => {
    if (!address) return { symbol: 'MyToken', name: 'MyToken' }
    if (address === '0x0000000000000000000000000000000000000000') {
      return { symbol: 'ETH', name: 'Ethereum' }
    }
    if (address === CONTRACT_ADDRESSES.MY_TOKEN) {
      return { symbol: symbol || 'MTK', name: 'MyToken' }
    }
    return { symbol: symbol || 'TOKEN', name: 'Unknown Token' }
  }

  return {
    symbol: getTokenInfo(tokenAddress).symbol,
    name: getTokenInfo(tokenAddress).name,
    isLoading: !symbol && tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000'
  }
}

export function useTokenDisplayName(tokenAddress?: string) {
  const { symbol } = useERC20Symbol(tokenAddress)
  return symbol
}
