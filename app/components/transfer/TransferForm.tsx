'use client'

// 转账功能组件 - 处理ERC20代币转账操作
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { useERC20Transfer, useERC20TokenInfo } from '../../contracts/hooks/useERC20Transfer'
import { CONTRACT_ADDRESSES } from '../../contracts/addresses'
import ClientWrapper from '../ClientWrapper'

export default function TransferForm() {
  const { address, isConnected } = useAccount()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<string>(CONTRACT_ADDRESSES.MY_TOKEN)
  const [customTokenAddress, setCustomTokenAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // 加载状态的fallback内容
  const fallbackContent = (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-white">💸 转账功能</h2>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-10 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  )
  
  const { transferERC20, hash, isPending, isConfirming, isSuccess } = useERC20Transfer()
  const tokenAddress = selectedToken === 'custom' ? customTokenAddress : selectedToken
  const { symbol } = useERC20TokenInfo(tokenAddress)

  // 验证地址格式
  const isValidAddress = (addr: string) => {
    return addr && isAddress(addr)
  }

  // 处理转账操作
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !toAddress || !isConnected) {
      alert('请填写完整信息并确保钱包已连接')
      return
    }

    if (!isValidAddress(toAddress)) {
      alert('请输入有效的以太坊地址')
      return
    }

    if (toAddress.toLowerCase() === address?.toLowerCase()) {
      alert('不能向自己转账')
      return
    }

    try {
      setIsLoading(true)
      
      // 执行ERC20代币转账
      const finalTokenAddress = selectedToken === 'custom' ? customTokenAddress : selectedToken
      await transferERC20(toAddress, amount, finalTokenAddress)
      
    } catch (error) {
      console.error('ERC20转账失败:', error)
      alert('转账失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 重置表单
  const resetForm = () => {
    setToAddress('')
    setAmount('')
  }

  if (!isConnected) {
    return (
      <ClientWrapper fallback={fallbackContent}>
        <div className="flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4 text-white">💸 转账功能</h2>
          <p className="text-gray-500">请先连接钱包使用转账功能</p>
        </div>
      </ClientWrapper>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-white">💸 转账功能</h2>
      
      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label htmlFor="transfer-to" className="block text-sm font-medium text-gray-700 mb-2">
            接收地址
          </label>
          <input
            id="transfer-to"
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              toAddress && !isValidAddress(toAddress) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={isLoading || isPending || isConfirming}
          />
          {toAddress && !isValidAddress(toAddress) && (
            <p className="text-red-500 text-sm mt-1">请输入有效的以太坊地址</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择代币
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            disabled={isLoading || isPending || isConfirming}
          >
            <option value={CONTRACT_ADDRESSES.MY_TOKEN}>MTK - MyToken</option>
            <option value="custom">自定义代币地址</option>
          </select>
          
          {selectedToken === 'custom' && (
            <input
              type="text"
              value={customTokenAddress}
              placeholder="请输入ERC20代币合约地址"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              disabled={isLoading || isPending || isConfirming}
            />
          )}
        </div>

        <div>
          <label htmlFor="transfer-amount" className="block text-sm font-medium text-gray-700 mb-2">
            转账金额 ({symbol || 'MTK'})
          </label>
          <input
            id="transfer-amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="请输入转账金额"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || isPending || isConfirming}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!amount || !toAddress || !isValidAddress(toAddress) || isLoading || isPending || isConfirming}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/25"
          >
            {isPending || isConfirming ? '处理中...' : '确认转账'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
        </div>
      </form>

      {/* 交易状态显示 */}
      {hash && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            交易哈希: {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
          {isConfirming && (
            <p className="text-blue-600 text-sm mt-1">⏳ 等待交易确认...</p>
          )}
          {isSuccess && (
            <p className="text-green-600 text-sm mt-1">✅ 转账成功！</p>
          )}
        </div>
      )}

      {/* 安全提示 */}
      <div className="mt-4 p-4 bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-500/30 rounded-lg">
        <p className="text-orange-200 text-sm font-medium mb-1">🔒 安全提示：</p>
        <ul className="text-orange-100/80 text-sm space-y-1">
          <li>• 请仔细核对接收地址</li>
          <li>• 转账操作不可撤销</li>
          <li>• 确保网络费用充足</li>
          <li>• 建议先小额测试</li>
        </ul>
      </div>
    </div>
  )
}
