'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { usePermitTokenBank } from '@/app/hooks/usePermitTokenBank'
import { CONTRACT_ADDRESSES } from '@/app/contracts/addresses'
import { ManualPermitCard } from '@/app/components/permit/ManualPermitCard'
import { CallPermitCard } from '@/app/components/permit/CallPermitCard'
import { TokenBankSignatureCard } from '@/app/components/permit/TokenBankSignatureCard'
import { TokenBankDepositCard } from '@/app/components/permit/TokenBankDepositCard'

export default function PermitTokenBankPage() {
  const { address, isConnected } = useAccount()
  const {
    balance,
    getBalance,
    isContractDataReady,
    generateManualPermitSignature,
    callManualPermit,
    generateBankSignature,
    permitDeposit,
    isGeneratingManualSignature,
    isCallingManualPermit,
    isGeneratingBankSignature,
    isPermitDepositLoading
  } = usePermitTokenBank()

  // 状态管理：自动填充参数
  const [autoFillParams, setAutoFillParams] = useState({
    owner: '',
    spender: '',
    value: '',
    deadline: '',
    v: 0,
    r: '',
    s: ''
  })

  // 处理生成签名成功后的自动填充
  const handleGenerateSignatureSuccess = (params: any) => {
    setAutoFillParams({
      owner: params.owner,
      spender: params.spender,
      value: params.value,
      deadline: params.deadline,
      v: params.v,
      r: params.r,
      s: params.s
    })
  }

  // 包装生成签名函数以支持自动填充
  const handleGenerateSignature = async (owner: string, spender: string, value: string, deadline: string) => {
    await generateManualPermitSignature(owner, spender, value, deadline, handleGenerateSignatureSuccess)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-4">请连接钱包</h1>
          <p className="text-gray-400">您需要连接钱包才能使用 Permit 签名存款功能</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Permit 签名存款
          </h1>
          <p className="text-gray-400 text-lg">
            使用 EIP-2612 Permit 签名实现无需预先授权的代币存款
          </p>
        </motion.div>

        {/* 状态指示器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 mb-8"
        >
          <Badge variant={isConnected ? "default" : "secondary"} className="px-3 py-1">
            {isConnected ? "✅ 钱包已连接" : "❌ 钱包未连接"}
          </Badge>
          <Badge variant={isContractDataReady ? "default" : "secondary"} className="px-3 py-1">
            {isContractDataReady ? "✅ 合约数据就绪" : "⏳ 加载合约数据"}
          </Badge>
        </motion.div>

        {/* 余额显示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-300">当前 Token 余额:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-lg">
                {balance ? formatEther(balance) : '0.0'} MTK
              </span>
              <button
                onClick={getBalance}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 主要功能标签页 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
              <TabsTrigger 
                value="manual" 
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                手动 Permit 管理
              </TabsTrigger>
              <TabsTrigger 
                value="tokenbank" 
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                TokenBank 操作
              </TabsTrigger>
            </TabsList>

            {/* 手动 Permit 管理标签页 */}
            <TabsContent value="manual" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ManualPermitCard
                  onGenerateSignature={handleGenerateSignature}
                  isGenerating={isGeneratingManualSignature}
                  isContractDataReady={isContractDataReady}
                />
                <CallPermitCard
                  onCallPermit={callManualPermit}
                  isCalling={isCallingManualPermit}
                  isContractDataReady={isContractDataReady}
                  owner={autoFillParams.owner}
                  spender={autoFillParams.spender}
                  value={autoFillParams.value}
                  deadline={autoFillParams.deadline}
                  v={autoFillParams.v}
                  r={autoFillParams.r}
                  s={autoFillParams.s}
                />
              </div>
            </TabsContent>

            {/* TokenBank 操作标签页 */}
            <TabsContent value="tokenbank" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TokenBankSignatureCard
                  onGenerateBankSignature={generateBankSignature}
                  isGenerating={isGeneratingBankSignature}
                  isContractDataReady={isContractDataReady}
                  tokenBankAddress={CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK}
                />
                <TokenBankDepositCard
                  onPermitDeposit={permitDeposit}
                  isDepositing={isPermitDepositLoading}
                  isContractDataReady={isContractDataReady}
                  tokenBalance={balance ? formatEther(balance) + ' MTK' : undefined}
                  onRefreshBalance={getBalance}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
