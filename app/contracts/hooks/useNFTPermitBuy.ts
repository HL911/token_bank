'use client'

import { useState, useCallback } from 'react'
import { useAccount, useChainId, useSignTypedData } from 'wagmi'
import { getAddress } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'

// 以太坊提供者类型
type EthereumProvider = {
  request: (args: { method: string; params: any[] }) => Promise<any>
}

// EIP-712 域配置
const DOMAIN_NAME = 'NFTMarket'
const DOMAIN_VERSION = '1'

// EIP-712 类型定义
const PERMIT_BUY_TYPES = {
  PermitBuy: [
    { name: 'buyer', type: 'address' },
    { name: 'listingId', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
}

export interface PermitBuySignature {
  v: number
  r: string
  s: string
  deadline: bigint
}

export function useNFTPermitBuy() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signTypedDataAsync } = useSignTypedData()
  const [isLoading, setIsLoading] = useState(false)

  // 生成白名单购买签名
  const generatePermitBuySignature = useCallback(async (
    buyerAddress: string,
    listingId: string,
    deadline: bigint
  ): Promise<PermitBuySignature> => {
    if (!address) throw new Error('请先连接钱包')

    setIsLoading(true)
    try {
      // 构建EIP-712域 - 参考usePermitTokenBank的成功实现
      const domain = {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: BigInt(chainId),
        verifyingContract: getAddress(CONTRACT_ADDRESSES.NFT_MARKET)
      } as const

      // EIP-712 类型定义
      const types = {
        PermitBuy: [
          { name: 'buyer', type: 'address' },
          { name: 'listingId', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      } as const

      // 构建签名消息 - wagmi需要BigInt类型，不是字符串
      const message = {
        buyer: getAddress(buyerAddress),
        listingId: BigInt(listingId),
        deadline: deadline
      }

      // 调试信息：打印签名域配置
      console.log('=== NFT PermitBuy EIP-712 签名域配置调试 ===')
      console.log('Domain:', domain)
      console.log('Current chainId:', chainId)
      console.log('Contract address:', CONTRACT_ADDRESSES.NFT_MARKET)
      console.log('Current wallet address:', address)
      console.log('Buyer address:', buyerAddress)
      console.log('Listing ID:', listingId)
      console.log('Deadline:', deadline.toString())
      console.log('Message:', message)
      console.log('Types:', types)
      console.log('=================================================')

      // 使用wagmi的signTypedDataAsync - 与usePermitTokenBank相同的成功模式
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'PermitBuy',
        message,
      })

      if (!signature) {
        throw new Error('用户取消了签名')
      }

      // 解析签名 - 与usePermitTokenBank相同的解析方式
      const sig = signature.slice(2)
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)

      console.log('PermitBuy签名生成成功:', { v, r, s, deadline })

      return { 
        v, 
        r: r as `0x${string}`, 
        s: s as `0x${string}`, 
        deadline 
      }
    } catch (error) {
      console.error('生成PermitBuy签名失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId, signTypedDataAsync])

  // 生成默认截止时间 (1小时后)
  const getDefaultDeadline = useCallback(() => {
    return BigInt(Math.floor(Date.now() / 1000) + 3600) // 1小时后
  }, [])

  return {
    generatePermitBuySignature,
    getDefaultDeadline,
    isLoading
  }
}
