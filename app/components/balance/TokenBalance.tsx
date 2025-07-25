'use client'

// Token余额显示组件 - 显示当前钱包的token余额
import { useAccount, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatEther, formatUnits } from 'viem'
import { useMyTokenBalance, useMyTokenInfo } from '../../contracts/hooks/useMyToken'
import { useTokenBankBalance } from '../../contracts/hooks/useTokenBank'
import ClientWrapper from '../ClientWrapper'

export default function TokenBalance() {
  const { address, isConnected } = useAccount()
  const [refreshKey, setRefreshKey] = useState(0)

  // 获取ETH余额
  const { data: ethBalance, isLoading: ethLoading, refetch: refetchEth } = useBalance({
    address: address,
  })

  // 获取MyToken信息
  const { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals } = useMyTokenInfo()

  // 获取MyToken余额
  const { data: myTokenBalance, isLoading: myTokenLoading, refetch: refetchMyToken } = useMyTokenBalance(address)

  // 获取TokenBank中的余额
  const { data: bankBalance, isLoading: bankLoading, refetch: refetchBank } = useTokenBankBalance(address)

  // 刷新余额
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetchEth()
    refetchMyToken()
    refetchBank()
  }

  // 格式化余额显示
  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0.0000'
    const formatted = formatEther(balance)
    return parseFloat(formatted).toFixed(4)
  }

  const fallbackContent = (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-white">Token余额</h2>
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isConnected) {
    return (
      <ClientWrapper fallback={fallbackContent}>
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-white">Token余额</h2>
          <p className="text-gray-500">请先连接钱包查看余额</p>
        </div>
      </ClientWrapper>
    )
  }

  return (
    <ClientWrapper fallback={fallbackContent}>
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Token余额</h2>
        <button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-green-500/25"
        >
          刷新
        </button>
      </div>

      <div className="space-y-3">
        {/* ETH余额 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            {ethLoading ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-300 rounded w-12"></div>
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-300 rounded w-24"></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white">ETH</h3>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-400">以太坊</p>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-bold text-white">
                    {formatBalance(ethBalance?.value)} ETH
                  </p>
                  <p className="text-sm text-gray-400">
                    ${ethBalance?.value ? (parseFloat(formatBalance(ethBalance.value)) * 2000).toFixed(2) : '0.00'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MyToken余额 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            {myTokenLoading ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-300 rounded w-16"></div>
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-300 rounded w-28"></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white">{tokenSymbol || 'MyToken'}</h3>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-400">{tokenName || 'My Token'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-bold text-white">
                    {myTokenBalance ? formatUnits(myTokenBalance as bigint, tokenDecimals || 18) : '0.0000'} {tokenSymbol || 'MTK'}
                  </p>
                  <p className="text-sm text-gray-400">
                    钱包余额
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TokenBank中的余额 */}
        <div className="bg-green-900/30 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-white">银行存款</h3>
              <p className="text-sm text-gray-600">TokenBank中的{tokenSymbol || 'MyToken'}余额</p>
            </div>
            <div className="text-right">
              {bankLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-green-600">
                    {bankBalance ? formatUnits(bankBalance as bigint, tokenDecimals || 18) : '0.0000'} {tokenSymbol || 'MTK'}
                  </p>
                  <p className="text-sm text-gray-600">
                    银行存款
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </ClientWrapper>
  )
}
