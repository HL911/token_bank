'use client'

import { isAddress } from 'viem'

/**
 * 验证以太坊地址格式是否正确
 */
export function isValidEthereumAddress(address: string): boolean {
  return isAddress(address)
}

/**
 * 验证是否为零地址（ETH原生代币）
 */
export function isZeroAddress(address: string): boolean {
  return address === '0x0000000000000000000000000000000000000000'
}

/**
 * 格式化地址显示（缩短显示）
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * 验证ERC20代币地址
 */
export function validateTokenAddress(address: string): {
  isValid: boolean
  error?: string
} {
  if (!address) {
    return { isValid: false, error: '请输入代币地址' }
  }

  if (!isValidEthereumAddress(address)) {
    return { isValid: false, error: '无效的以太坊地址格式' }
  }

  return { isValid: true }
}
