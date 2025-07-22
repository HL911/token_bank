import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'
import MyTokenABI from '../abis/MyToken.json'

// 查询MyToken余额
export function useMyTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// 查询MyToken基本信息
export function useMyTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'decimals',
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'totalSupply',
  })

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    totalSupply: totalSupply as bigint,
  }
}

// 授权TokenBank使用MyToken
export function useApproveMyToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.MY_TOKEN,
      abi: MyTokenABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.TOKEN_BANK, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// 查询授权额度
export function useMyTokenAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MY_TOKEN,
    abi: MyTokenABI,
    functionName: 'allowance',
    args: owner ? [owner, CONTRACT_ADDRESSES.TOKEN_BANK] : undefined,
    query: {
      enabled: !!owner,
    },
  })
}
