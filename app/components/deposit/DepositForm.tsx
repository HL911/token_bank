'use client'

// 存款功能组件 - 处理token存款操作
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { useMyTokenBalance, useMyTokenInfo, useApproveMyToken, useMyTokenAllowance } from '../../contracts/hooks/useMyToken'
import { useTokenBankDeposit, useTokenBankBalance } from '../../contracts/hooks/useTokenBank'
import ClientWrapper from '../ClientWrapper'

export default function DepositForm() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'input' | 'approve' | 'deposit'>('input')
  
  // 获取MyToken信息
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useMyTokenInfo()
  const { data: myTokenBalance, refetch: refetchBalance } = useMyTokenBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useMyTokenAllowance(address)
  
  // 获取TokenBank余额信息
  const { refetch: refetchBankBalance } = useTokenBankBalance(address)
  
  // 授权和存款hooks
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming, isConfirmed: isApproveConfirmed, error: approveError } = useApproveMyToken()
  const { deposit, isPending: isDepositing, isConfirming: isDepositConfirming, isConfirmed: isDepositConfirmed, error: depositError } = useTokenBankDeposit()

  // 监听授权确认状态
  useEffect(() => {
    if (isApproveConfirmed) {
      setStep('deposit')
      refetchAllowance()
    }
  }, [isApproveConfirmed, refetchAllowance])

  // 监听存款确认状态
  useEffect(() => {
    if (isDepositConfirmed) {
      setStep('input')
      setAmount('')
      refetchBalance()
      refetchAllowance()
      refetchBankBalance() // 刷新银行余额
    }
  }, [isDepositConfirmed, refetchBalance, refetchAllowance, refetchBankBalance])

  // 处理存款操作
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !isConnected || !tokenDecimals) {
      alert('请输入有效金额并确保钱包已连接')
      return
    }

    const amountInWei = parseUnits(amount, tokenDecimals)
    const currentAllowance = typeof allowance === 'bigint' ? allowance : BigInt(0)

    // 检查余额是否足够
    if (myTokenBalance && typeof myTokenBalance === 'bigint' && amountInWei > myTokenBalance) {
      alert('余额不足')
      return
    }

    // 如果授权额度不够，先进行授权
    if (currentAllowance < amountInWei) {
      setStep('approve')
      approve(amountInWei)
    } else {
      // 授权额度足够，直接存款
      setStep('deposit')
      deposit(amountInWei)
    }
  }

  // 重置表单
  const resetForm = () => {
    setAmount('')
  }

  const fallbackContent = (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">💰 存款功能</h2>
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
          <h2 className="text-xl font-bold mb-4 text-gray-800">💰 存款功能</h2>
          <p className="text-gray-500">请先连接钱包使用存款功能</p>
        </div>
      </ClientWrapper>
    )
  }

  return (
    <ClientWrapper fallback={fallbackContent}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">💰 存款功能</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700 mb-2">
            存款金额 ({tokenSymbol || 'MyToken'})
          </label>
          <input
            id="deposit-amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`请输入存款金额 (${tokenSymbol || 'MyToken'})`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={step !== 'input'}
          />
          {myTokenBalance && typeof myTokenBalance === 'bigint' && (
            <p className="text-sm text-gray-500 mt-1">
              可用余额: {formatUnits(myTokenBalance, typeof tokenDecimals === 'number' ? tokenDecimals : 18)} {tokenSymbol || 'MTK'}
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!amount || (step !== 'input' && step !== 'deposit') || isApproving || isApproveConfirming || isDepositing || isDepositConfirming}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {step === 'approve' && (isApproving || isApproveConfirming) ? '授权中...' :
             step === 'deposit' && (isDepositing || isDepositConfirming) ? '存款中...' :
             '确认存款'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            disabled={step !== 'input'}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            重置
          </button>
        </div>
      </form>

      {/* 交易状态显示 */}
      {step === 'approve' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">步骤 1/2: 授权Token</p>
          {isApproving && <p className="text-yellow-600 text-sm mt-1">⏳ 请在钱包中确认授权...</p>}
          {isApproveConfirming && <p className="text-yellow-600 text-sm mt-1">⏳ 等待授权确认...</p>}
          {isApproveConfirmed && <p className="text-green-600 text-sm mt-1">✅ 授权成功！准备存款...</p>}
        </div>
      )}
      
      {step === 'deposit' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">步骤 2/2: 执行存款</p>
          {isDepositing && <p className="text-blue-600 text-sm mt-1">⏳ 请在钱包中确认存款...</p>}
          {isDepositConfirming && <p className="text-blue-600 text-sm mt-1">⏳ 等待存款确认...</p>}
          {isDepositConfirmed && <p className="text-green-600 text-sm mt-1">✅ 存款成功！</p>}
        </div>
      )}
      
      {/* 错误显示 */}
      {(approveError || depositError) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">❌ 操作失败</p>
          <p className="text-red-600 text-sm mt-1">
            {approveError?.message || depositError?.message || '未知错误'}
          </p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700 text-sm font-medium mb-2">💡 存款流程说明：</p>
        <ol className="text-gray-600 text-sm space-y-1">
          <li>1. 输入要存款的{tokenSymbol || 'MyToken'}数量</li>
          <li>2. 如需要，系统会先请求授权Token使用权限</li>
          <li>3. 授权完成后，执行存款操作将Token转入银行合约</li>
          <li>4. 存款成功后，可在余额模块查看银行存款</li>
        </ol>
      </div>
      </div>
    </ClientWrapper>
  )
}
