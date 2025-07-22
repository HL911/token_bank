'use client'

// 取款功能组件 - 处理token取款操作
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { useMyTokenInfo, useMyTokenBalance } from '../../contracts/hooks/useMyToken'
import { useTokenBankBalance, useTokenBankWithdraw } from '../../contracts/hooks/useTokenBank'
import ClientWrapper from '../ClientWrapper'

export default function WithdrawForm() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  
  // 获取MyToken信息
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useMyTokenInfo()
  
  // 获取MyToken余额
  const { refetch: refetchMyTokenBalance } = useMyTokenBalance(address)
  
  // 获取TokenBank中的余额
  const { data: bankBalance, refetch: refetchBankBalance } = useTokenBankBalance(address)
  
  // 取款hook
  const { withdraw, isPending: isWithdrawing, isConfirming: isWithdrawConfirming, isConfirmed: isWithdrawConfirmed, error: withdrawError } = useTokenBankWithdraw()

  // 监听取款确认状态
  useEffect(() => {
    if (isWithdrawConfirmed) {
      setAmount('')
      refetchBankBalance()      // 刷新银行余额
      refetchMyTokenBalance()   // 刷新钱包余额
    }
  }, [isWithdrawConfirmed, refetchBankBalance, refetchMyTokenBalance])

  // 处理取款操作
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !isConnected || !tokenDecimals) {
      alert('请输入有效金额并确保钱包已连接')
      return
    }

    const amountInWei = parseUnits(amount, tokenDecimals)
    
    // 检查银行余额是否足够
    if (bankBalance && amountInWei > (bankBalance as bigint)) {
      alert('银行存款余额不足')
      return
    }

    // 执行取款
    withdraw(amountInWei)
  }

  // 重置表单
  const resetForm = () => {
    setAmount('')
  }

  const fallbackContent = (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">💸 取款功能</h2>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  )

  if (!isConnected) {
    return (
      <ClientWrapper fallback={fallbackContent}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">💸 取款功能</h2>
          <p className="text-gray-500">请先连接钱包使用取款功能</p>
        </div>
      </ClientWrapper>
    )
  }

  return (
    <ClientWrapper fallback={fallbackContent}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">💸 取款功能</h2>
      
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 mb-2">
            取款金额 ({tokenSymbol || 'MyToken'})
          </label>
          <input
            id="withdraw-amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`请输入取款金额 (${tokenSymbol || 'MyToken'})`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={isWithdrawing || isWithdrawConfirming}
          />
          {bankBalance && (
            <p className="text-sm text-gray-500 mt-1">
              银行存款余额: {formatUnits(bankBalance as bigint, tokenDecimals || 18)} {tokenSymbol || 'MTK'}
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!amount || isWithdrawing || isWithdrawConfirming}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isWithdrawing || isWithdrawConfirming ? '取款中...' : '确认取款'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            disabled={isWithdrawing || isWithdrawConfirming}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            重置
          </button>
        </div>
      </form>

      {/* 交易状态显示 */}
      {(isWithdrawing || isWithdrawConfirming || isWithdrawConfirmed) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">取款状态</p>
          {isWithdrawing && <p className="text-blue-600 text-sm mt-1">⏳ 请在钱包中确认取款...</p>}
          {isWithdrawConfirming && <p className="text-blue-600 text-sm mt-1">⏳ 等待取款确认...</p>}
          {isWithdrawConfirmed && <p className="text-green-600 text-sm mt-1">✅ 取款成功！</p>}
        </div>
      )}
      
      {/* 错误显示 */}
      {withdrawError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">❌ 取款失败</p>
          <p className="text-red-600 text-sm mt-1">
            {(withdrawError as any)?.message || '未知错误'}
          </p>
        </div>
      )}

      {/* 安全提示 */}
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm font-medium mb-1">🔒 安全提示：</p>
        <ul className="text-red-700 text-sm space-y-1">
          <li>• 请确认取款金额无误</li>
          <li>• 取款操作不可撤销</li>
          <li>• 确保网络费用充足</li>
        </ul>
      </div>

      {/* 使用说明 */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700 text-sm font-medium mb-2">💡 取款流程说明：</p>
        <ol className="text-gray-600 text-sm space-y-1">
          <li>1. 输入要取款的{tokenSymbol || 'MyToken'}数量</li>
          <li>2. 系统会检查您在银行的存款余额</li>
          <li>3. 确认取款操作，Token将从银行合约转回您的钱包</li>
          <li>4. 取款成功后，余额会自动更新</li>
        </ol>
      </div>
      </div>
    </ClientWrapper>
  )
}
