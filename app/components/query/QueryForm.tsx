'use client'

// 查询功能组件 - 处理交易和余额查询
import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { isAddress } from 'viem'

interface QueryResult {
  type: 'balance' | 'transaction' | 'address'
  data: any
  timestamp: number
}

export default function QueryForm() {
  const { address, isConnected } = useAccount()
  const [queryType, setQueryType] = useState<'balance' | 'transaction' | 'address'>('balance')
  const [queryInput, setQueryInput] = useState('')
  const [queryResults, setQueryResults] = useState<QueryResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 查询余额
  const { data: queriedBalance, refetch: refetchBalance } = useBalance({
    address: queryInput as `0x${string}`,
    query: { enabled: false }
  })

  // 处理查询操作
  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!queryInput.trim()) {
      alert('请输入查询内容')
      return
    }

    setIsLoading(true)

    try {
      let result: QueryResult

      switch (queryType) {
        case 'balance':
          if (!isAddress(queryInput)) {
            alert('请输入有效的以太坊地址')
            return
          }
          
          const balanceData = await refetchBalance()
          result = {
            type: 'balance',
            data: {
              address: queryInput,
              balance: balanceData.data?.formatted || '0',
              symbol: balanceData.data?.symbol || 'ETH'
            },
            timestamp: Date.now()
          }
          break

        case 'transaction':
          // 这里应该调用区块链API查询交易信息
          result = {
            type: 'transaction',
            data: {
              hash: queryInput,
              status: '演示数据',
              message: '实际应用需要连接区块链API'
            },
            timestamp: Date.now()
          }
          break

        case 'address':
          if (!isAddress(queryInput)) {
            alert('请输入有效的以太坊地址')
            return
          }
          
          result = {
            type: 'address',
            data: {
              address: queryInput,
              isValid: true,
              type: 'EOA', // 外部拥有账户
              message: '地址格式有效'
            },
            timestamp: Date.now()
          }
          break

        default:
          throw new Error('未知查询类型')
      }

      setQueryResults(prev => [result, ...prev.slice(0, 9)]) // 保留最近10条查询结果
      
    } catch (error) {
      console.error('查询失败:', error)
      alert('查询失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 清空查询结果
  const clearResults = () => {
    setQueryResults([])
  }

  // 格式化时间显示
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🔍 查询功能</h2>
      
      <form onSubmit={handleQuery} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            查询类型
          </label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="balance">余额查询</option>
            <option value="transaction">交易查询</option>
            <option value="address">地址验证</option>
          </select>
        </div>

        <div>
          <label htmlFor="query-input" className="block text-sm font-medium text-gray-700 mb-2">
            {queryType === 'balance' && '钱包地址'}
            {queryType === 'transaction' && '交易哈希'}
            {queryType === 'address' && '以太坊地址'}
          </label>
          <input
            id="query-input"
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={
              queryType === 'balance' ? '0x...' :
              queryType === 'transaction' ? '0x...' :
              '0x...'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!queryInput.trim() || isLoading}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? '查询中...' : '开始查询'}
          </button>
          
          <button
            type="button"
            onClick={() => setQueryInput('')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            清空
          </button>
        </div>
      </form>

      {/* 查询结果 */}
      {queryResults.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">查询结果</h3>
            <button
              onClick={clearResults}
              className="text-sm text-red-600 hover:text-red-800"
            >
              清空结果
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {queryResults.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {result.type === 'balance' && '💰 余额查询'}
                    {result.type === 'transaction' && '📋 交易查询'}
                    {result.type === 'address' && '🏷️ 地址验证'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(result.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-800">
                  {result.type === 'balance' && (
                    <div>
                      <p><strong>地址:</strong> {result.data.address.slice(0, 10)}...{result.data.address.slice(-8)}</p>
                      <p><strong>余额:</strong> {result.data.balance} {result.data.symbol}</p>
                    </div>
                  )}
                  
                  {result.type === 'transaction' && (
                    <div>
                      <p><strong>哈希:</strong> {result.data.hash.slice(0, 10)}...{result.data.hash.slice(-8)}</p>
                      <p><strong>状态:</strong> {result.data.status}</p>
                      <p className="text-yellow-600">{result.data.message}</p>
                    </div>
                  )}
                  
                  {result.type === 'address' && (
                    <div>
                      <p><strong>地址:</strong> {result.data.address.slice(0, 10)}...{result.data.address.slice(-8)}</p>
                      <p><strong>状态:</strong> <span className="text-green-600">✅ {result.data.message}</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          💡 提示：查询功能支持余额查询、交易查询和地址验证。实际应用中需要连接到区块链API获取完整数据。
        </p>
      </div>
    </div>
  )
}
