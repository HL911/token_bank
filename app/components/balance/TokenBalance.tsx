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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Token余额</h2>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Token余额</h2>
          <p className="text-gray-500">请先连接钱包查看余额</p>
        </div>
      </ClientWrapper>
    )
  }

  return (
    <ClientWrapper fallback={fallbackContent}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Token余额</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          刷新
        </button>
      </div>

      <div className="space-y-4">
        {/* ETH余额 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">ETH</h3>
              <p className="text-sm text-gray-600">以太坊</p>
            </div>
            <div className="text-right">
              {ethLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-800">
                    {formatBalance(ethBalance?.value)} ETH
                  </p>
                  <p className="text-sm text-gray-600">
                    ${ethBalance?.value ? (parseFloat(formatBalance(ethBalance.value)) * 2000).toFixed(2) : '0.00'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MyToken余额 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">{tokenSymbol || 'MyToken'}</h3>
              <p className="text-sm text-gray-600">{tokenName || 'My Token'}</p>
            </div>
            <div className="text-right">
              {myTokenLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-800">
                    {myTokenBalance ? formatUnits(myTokenBalance as bigint, tokenDecimals || 18) : '0.0000'} {tokenSymbol || 'MTK'}
                  </p>
                  <p className="text-sm text-gray-600">
                    钱包余额
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TokenBank中的余额 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">银行存款</h3>
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
