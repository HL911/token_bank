import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../addresses'
import TokenBankABI from '../abis/TokenBank.json'

// 查询用户在TokenBank中的余额
export function useTokenBankBalance(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_BANK,
    abi: TokenBankABI,
    functionName: 'getUserBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

// 查询TokenBank总余额
export function useTokenBankTotalBalance() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_BANK,
    abi: TokenBankABI,
    functionName: 'getBankTokenBalance',
  })
}

// 存款功能
export function useTokenBankDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_BANK,
      abi: TokenBankABI,
      functionName: 'deposit',
      args: [amount],
    })
  }

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// 取款功能
export function useTokenBankWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const withdraw = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_BANK,
      abi: TokenBankABI,
      functionName: 'withdraw',
      args: [amount],
    })
  }

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
