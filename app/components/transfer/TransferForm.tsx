'use client'

// 转账功能组件 - 处理token转账操作
import { useState } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, isAddress } from 'viem'

export default function TransferForm() {
  const { address, isConnected } = useAccount()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendTransaction, data: hash, isPending } = useSendTransaction()
  
  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

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
      
      // 执行转账交易
      await sendTransaction({
        to: toAddress as `0x${string}`,
        value: parseEther(amount),
      })
      
    } catch (error) {
      console.error('转账失败:', error)
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
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-white">💸 转账功能</h2>
        <p className="text-gray-500">请先连接钱包使用转账功能</p>
      </div>
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
          <label htmlFor="transfer-amount" className="block text-sm font-medium text-gray-700 mb-2">
            转账金额 (ETH)
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
