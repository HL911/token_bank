import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/app/contracts/addresses'
import permitERC20Abi from '@/app/contracts/abis/PermitERC20.json'

export function useERC20Info(tokenAddress?: `0x${string}`) {
  // 读取代币符号
  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: permitERC20Abi,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
    },
  })

  // 读取代币名称
  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: permitERC20Abi,
    functionName: 'name',
    query: {
      enabled: !!tokenAddress,
    },
  })

  // 读取代币小数位数
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: permitERC20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
    },
  })

  return {
    symbol: symbol as string,
    name: name as string,
    decimals: decimals as number,
  }
}

// 获取代币显示名称的 hook
export function useTokenDisplayName(tokenAddress?: `0x${string}`) {
  const { symbol, name } = useERC20Info(tokenAddress)

  // 如果是 ETH 地址或未定义，返回 ETH
  if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
    return 'ETH'
  }

  // 如果是 MyToken 合约地址
  if (tokenAddress.toLowerCase() === CONTRACT_ADDRESSES.MY_TOKEN.toLowerCase()) {
    return 'MTK'
  }

  // 如果是 PermitERC20 合约地址
  if (tokenAddress.toLowerCase() === CONTRACT_ADDRESSES.PERMIT_ERC20.toLowerCase()) {
    return symbol || 'PERC20'
  }

  // 返回从合约读取的符号，如果没有则返回地址的简短形式
  return symbol || `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`
}

// 获取 ERC20 代币符号的 hook
export function useERC20Symbol(tokenAddress?: `0x${string}`) {
  const { symbol } = useERC20Info(tokenAddress)
  
  // 特殊处理一些已知的代币
  if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
    return 'ETH'
  }
  
  if (tokenAddress.toLowerCase() === CONTRACT_ADDRESSES.MY_TOKEN.toLowerCase()) {
    return 'MTK'
  }

  if (tokenAddress.toLowerCase() === CONTRACT_ADDRESSES.PERMIT_ERC20.toLowerCase()) {
    return symbol || 'PERC20'
  }
  
  return symbol || 'TOKEN'
}
