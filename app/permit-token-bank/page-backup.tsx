'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { usePermitTokenBank } from '@/app/hooks/usePermitTokenBank'
import { CONTRACT_ADDRESSES } from '@/config'
import { ManualPermitCard } from '@/app/components/permit/ManualPermitCard'
import { CallPermitCard } from '@/app/components/permit/CallPermitCard'
import { TokenBankSignatureCard } from '@/app/components/permit/TokenBankSignatureCard'
import { TokenBankDepositCard } from '@/app/components/permit/TokenBankDepositCard'
import { DateTimePicker } from '@/app/components/ui/datetime-picker'
import { Wallet, FileSignature, CheckCircle, AlertCircle, RefreshCw, Key } from 'lucide-react'

export default function PermitTokenBankPage() {
  const { address, isConnected } = useAccount()
  const { balance, permitDeposit, getBalance, isPermitDepositLoading, permitDepositError, isContractDataLoading, isContractDataReady, nonces, tokenDecimals, domainSeparator } = usePermitTokenBank()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // 手动签名状态
  const [manualOwner, setManualOwner] = useState('')
  const [manualSpender, setManualSpender] = useState('')
  const [manualValue, setManualValue] = useState('')
  const [manualDeadline, setManualDeadline] = useState('')
  const [generatedSignature, setGeneratedSignature] = useState<{
    v: number
    r: string
    s: string
    value: bigint
    deadline: bigint
    nonce: bigint
  } | null>(null)
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false)
  
  // 手动permit调用状态
  const [permitOwner, setPermitOwner] = useState('')
  const [permitSpender, setPermitSpender] = useState('')
  const [permitValue, setPermitValue] = useState('')
  const [permitDeadline, setPermitDeadline] = useState('')
  const [permitV, setPermitV] = useState('')
  const [permitR, setPermitR] = useState('')
  const [permitS, setPermitS] = useState('')
  const [isCallingPermit, setIsCallingPermit] = useState(false)
  
  // TokenBank授权签名状态
  const [bankOwner, setBankOwner] = useState('')
  const [bankValue, setBankValue] = useState('')
  const [bankDeadline, setBankDeadline] = useState('')
  const [bankGeneratedSignature, setBankGeneratedSignature] = useState<{
    v: number
    r: string
    s: string
    value: bigint
    deadline: bigint
    nonce: bigint
  } | null>(null)
  const [isGeneratingBankSignature, setIsGeneratingBankSignature] = useState(false)
  
  // TokenBank签名存款状态
  const [depositAmount, setDepositAmount] = useState('')
  const [depositDeadline, setDepositDeadline] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositSignature, setDepositSignature] = useState<{
    owner: string
    spender: string
    value: string
    deadline: string
    v: number
    r: string
    s: string
  } | null>(null)
  const [isCallingPermitDeposit, setIsCallingPermitDeposit] = useState(false)
  
  const {
    balance,
    permitDeposit,
    getBalance,
    isPermitDepositLoading,
    permitDepositError,
    isContractDataLoading,
    isContractDataReady,
    nonces,
    tokenDecimals,
    domainSeparator,
    generateManualPermitSignature,
    callManualPermit
  } = usePermitTokenBank()

  const { symbol: tokenSymbol } = useERC20Info(CONTRACT_ADDRESSES.PERMIT_ERC20)

  const handlePermitDeposit = async () => {
    if (!amount || !address) return
    
    try {
      setIsLoading(true)
      await permitDeposit(amount)
      setAmount('')
      // 刷新余额
      await getBalance()
    } catch (error) {
      console.error('签名存款失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshBalance = async () => {
    await getBalance()
  }

  // 处理手动生成签名
  const handleGenerateSignature = async () => {
    if (!manualOwner || !manualSpender || !manualValue || !manualDeadline) {
      alert('请填写所有必要参数')
      return
    }

    // 验证输入数值
    const numericValue = parseFloat(manualValue)
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('请输入有效的数量')
      return
    }

    // 验证时间格式（如果是时间字符串）
    let deadlineToUse = manualDeadline
    if (isNaN(Number(manualDeadline))) {
      // 如果不是数字，尝试作为日期字符串解析
      const deadlineDate = new Date(manualDeadline)
      if (isNaN(deadlineDate.getTime())) {
        alert('请输入有效的截止时间（时间戳或日期格式）')
        return
      }
      deadlineToUse = Math.floor(deadlineDate.getTime() / 1000).toString()
    } else {
      // 如果是数字，验证是否大于当前时间
      const deadlineTimestamp = Number(manualDeadline)
      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        alert('截止时间必须在当前时间之后')
        return
      }
    }

    try {
      setIsGeneratingSignature(true)
      const signature = await generateManualPermitSignature(
        manualOwner,
        manualSpender,
        manualValue,
        deadlineToUse,
        // 成功回调：自动复制参数到右侧调用Permit表单
        (params) => {
          setPermitOwner(params.owner)
          setPermitSpender(params.spender)
          setPermitValue(params.value)
          setPermitDeadline(params.deadline)
          setPermitV(params.v.toString())
          setPermitR(params.r)
          setPermitS(params.s)
          
          // 显示成功提示
          setTimeout(() => {
            alert('✅ 签名生成成功！参数已自动复制到右侧“手动调用 Permit 函数”表单中。')
          }, 500)
        }
      )
      setGeneratedSignature(signature)
    } catch (error) {
      console.error('生成签名失败:', error)
      alert(`生成签名失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingSignature(false)
    }
  }

  // 处理手动调用permit
  const handleCallPermit = async () => {
    if (!permitOwner || !permitSpender || !permitValue || !permitDeadline || !permitV || !permitR || !permitS) {
      alert('请填写所有必要参数')
      return
    }

    try {
      setIsCallingPermit(true)
      await callManualPermit(
        permitOwner,
        permitSpender,
        permitValue,
        permitDeadline,
        parseInt(permitV),
        permitR,
        permitS
      )
    } catch (error) {
      console.error('调用permit失败:', error)
      alert(`调用permit失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsCallingPermit(false)
    }
  }

  // 使用生成的签名填充permit调用表单
  const useGeneratedSignature = () => {
    if (!generatedSignature) return
    
    setPermitOwner(manualOwner)
    setPermitSpender(manualSpender)
    setPermitValue(manualValue)
    setPermitDeadline(manualDeadline)
    setPermitV(generatedSignature.v.toString())
    setPermitR(generatedSignature.r)
    setPermitS(generatedSignature.s)
  }

  // 处理生成TokenBank授权签名
  const handleGenerateBankSignature = async () => {
    if (!bankValue || !bankDeadline || !address) {
      alert('请填写所有必要参数')
      return
    }

    // 验证输入数值
    const numericValue = parseFloat(bankValue)
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('请输入有效的数量')
      return
    }

    // 验证时间格式（DateTimePicker返回的是时间戳字符串）
    const deadlineTimestamp = Number(bankDeadline)
    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= 0) {
      alert('请选择有效的截止时间')
      return
    }

    if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      alert('截止时间必须在当前时间之后')
      return
    }

    try {
      setIsGeneratingBankSignature(true)
      
      // 生成针对TokenBank的授权签名
      await generateManualPermitSignature(
        bankOwner || address, // 默认使用当前钱包地址
        CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK, // spender固定为TokenBank合约
        bankValue,
        deadlineTimestamp.toString(),
        (result) => {
          // 成功回调，保存签名结果
          setBankGeneratedSignature(result as any) // 使用any类型避免类型错误
          alert('TokenBank授权签名生成成功！')
        }
      )
    } catch (error) {
      console.error('生成TokenBank授权签名失败:', error)
      alert(`生成签名失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingBankSignature(false)
    }
  }

  // 处理TokenBank签名存款
  const handleSignAndDeposit = async () => {
    if (!depositAmount || !depositDeadline || !address) {
      alert('请填写所有必要参数')
      return
    }

    // 验证输入数值
    const numericAmount = parseFloat(depositAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('请输入有效的存款金额')
      return
    }

    // 验证时间格式（DateTimePicker返回的是时间戳字符串）
    const deadlineTimestamp = Number(depositDeadline)
    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= 0) {
      alert('请选择有效的截止时间')
      return
    }

    if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      alert('截止时间必须在当前时间之后')
      return
    }

    try {
      setIsDepositing(true)
      
      // 调用permitDeposit函数（已经包含签名生成和存款逻辑）
      // 注意：permitDeposit函数内部会自动处理deadline
      await permitDeposit(depositAmount)
      
      // 清空表单
      setDepositAmount('')
      setDepositDeadline('')
      
      alert('签名存款成功！')
      
      // 刷新余额
      await getBalance()
    } catch (error) {
      console.error('TokenBank签名存款失败:', error)
      alert(`签名存款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsDepositing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-white">连接钱包</CardTitle>
            <CardDescription className="text-gray-400">
              请先连接您的钱包以使用签名存款功能
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            PermitTokenBank
          </h1>
          <p className="text-gray-400 text-lg">
            通过签名授权进行安全便捷的代币存款
          </p>
        </motion.div>

        {/* 余额卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-400" />
                账户余额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {balance || '0'} {tokenSymbol || 'TOKENS'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    当前存款余额
                  </p>
                </div>
                <Button
                  onClick={handleRefreshBalance}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 主要功能区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border-gray-700">
              <TabsTrigger 
                value="deposit" 
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                签名存款
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Permit管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-green-400" />
                    签名存款
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    使用 EIP-2612 签名授权进行安全存款，无需预先批准交易
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 存款金额输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      存款金额
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="请输入存款金额"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-20"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {tokenSymbol || 'TOKENS'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 签名存款说明 */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileSignature className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-400 font-medium mb-2">签名存款流程</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• 1. 输入存款金额</li>
                          <li>• 2. 点击"签名存款"按钮</li>
                          <li>• 3. 在钱包中签名授权消息</li>
                          <li>• 4. 系统自动执行存款交易</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 错误提示 */}
                  {permitDepositError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <h4 className="text-red-400 font-medium mb-1">操作失败</h4>
                          <p className="text-gray-300 text-sm">
                            {permitDepositError.message || '签名存款失败，请重试'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 合约数据加载状态 */}
                  {isContractDataLoading && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <div>
                          <h4 className="text-blue-400 font-medium mb-1">加载中</h4>
                          <p className="text-gray-300 text-sm">
                            正在获取合约信息，请稍候...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 存款按钮 */}
                  <Button
                    onClick={handlePermitDeposit}
                    disabled={!amount || isLoading || isPermitDepositLoading || !isContractDataReady}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading || isPermitDepositLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        处理中...
                      </div>
                    ) : !isContractDataReady ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        加载中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileSignature className="w-5 h-5" />
                        签名存款
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 手动Permit管理标签页 - 合并生成签名和调用permit */}
            <TabsContent value="manual" className="mt-6">
              {/* 2x2 卡片布局 - 完整的Permit管理功能 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧卡片 - 生成签名 */}
                <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-blue-400" />
                    生成 Token 授权签名
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    使用 EIP-2612 生成 permit 签名，允许第三方代理调用 token 授权
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 合约信息显示 */}
                  {isContractDataReady && (
                    <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                      <h4 className="text-white font-medium mb-2">当前合约信息</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Nonce: </span>
                          <span className="text-green-400 font-mono">{nonces?.toString() || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Decimals: </span>
                          <span className="text-green-400 font-mono">{tokenDecimals?.toString() || '18'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Token: </span>
                          <span className="text-green-400 font-mono text-xs">
                            {CONTRACT_ADDRESSES.PERMIT_ERC20.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 参数输入 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner" className="text-white">
                        Owner (所有者地址)
                        <span className="text-xs text-gray-400 ml-2">• 必须与当前钱包地址一致</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="owner"
                          placeholder={address || "0x..."}
                          value={manualOwner || address || ''}
                          onChange={(e) => setManualOwner(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                        {address && (
                          <button
                            type="button"
                            onClick={() => setManualOwner(address)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            使用当前钱包
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spender" className="text-white">Spender (授权地址)</Label>
                      <Input
                        id="spender"
                        placeholder="0x..."
                        value={manualSpender}
                        onChange={(e) => setManualSpender(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value" className="text-white">Value (数量)</Label>
                      <Input
                        id="value"
                        type="number"
                        placeholder="1.0"
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <DateTimePicker
                        value={manualDeadline}
                        onChange={setManualDeadline}
                        label="Deadline (截止时间)"
                        placeholder="请设置截止时间"
                      />
                    </div>
                  </div>

                  {/* 生成按钮 */}
                  <Button
                    onClick={handleGenerateSignature}
                    disabled={!manualOwner || !manualSpender || !manualValue || !manualDeadline || isGeneratingSignature || !isContractDataReady}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-6"
                  >
                    {isGeneratingSignature ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        生成中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileSignature className="w-5 h-5" />
                        生成 Permit 签名
                      </div>
                    )}
                  </Button>

                  {/* 签名结果显示 */}
                  {generatedSignature && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h4 className="text-green-400 font-medium">签名生成成功</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">v: </span>
                          <span className="text-green-400 font-mono">{generatedSignature.v}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">r: </span>
                          <span className="text-green-400 font-mono text-xs break-all">{generatedSignature.r}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">s: </span>
                          <span className="text-green-400 font-mono text-xs break-all">{generatedSignature.s}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">nonce: </span>
                          <span className="text-green-400 font-mono">{generatedSignature.nonce.toString()}</span>
                        </div>
                      </div>
                      <Button
                        onClick={useGeneratedSignature}
                        className="w-full mt-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                        variant="outline"
                      >
                        使用此签名调用 Permit
                      </Button>
                    </div>
                  )}
                </CardContent>
                </Card>

                {/* 右侧卡片 - 调用Permit */}
                <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    执行 Token 授权
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    使用签名参数执行 permit 函数，完成 token 授权操作
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 参数输入 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permitOwner" className="text-white">
                        Owner (所有者地址)
                        <span className="text-xs text-gray-400 ml-2">• 必须与当前钱包地址一致</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="permitOwner"
                          placeholder={address || "0x..."}
                          value={permitOwner || address || ''}
                          onChange={(e) => setPermitOwner(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                        {address && (
                          <button
                            type="button"
                            onClick={() => setPermitOwner(address)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            使用当前钱包
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permitSpender" className="text-white">Spender</Label>
                      <Input
                        id="permitSpender"
                        placeholder="0x..."
                        value={permitSpender}
                        onChange={(e) => setPermitSpender(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permitValue" className="text-white">Value</Label>
                      <Input
                        id="permitValue"
                        type="number"
                        placeholder="1.0"
                        value={permitValue}
                        onChange={(e) => setPermitValue(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <DateTimePicker
                        value={permitDeadline}
                        onChange={setPermitDeadline}
                        label="Deadline (截止时间)"
                        placeholder="请设置截止时间"
                      />
                    </div>
                  </div>

                  {/* 签名参数 */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">签名参数</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="permitV" className="text-white">v</Label>
                        <Input
                          id="permitV"
                          type="number"
                          placeholder="27 or 28"
                          value={permitV}
                          onChange={(e) => setPermitV(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permitR" className="text-white">r</Label>
                        <Input
                          id="permitR"
                          placeholder="0x..."
                          value={permitR}
                          onChange={(e) => setPermitR(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permitS" className="text-white">s</Label>
                        <Input
                          id="permitS"
                          placeholder="0x..."
                          value={permitS}
                          onChange={(e) => setPermitS(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 调用按钮 */}
                  <Button
                    onClick={handleCallPermit}
                    disabled={!permitOwner || !permitSpender || !permitValue || !permitDeadline || !permitV || !permitR || !permitS || isCallingPermit || isPermitDepositLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6"
                  >
                    {isCallingPermit || isPermitDepositLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        调用中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        调用 Permit 函数
                      </div>
                    )}
                  </Button>

                  {/* 说明信息 */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="text-purple-400 font-medium mb-2">调用 Permit 说明</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Permit 函数允许通过签名授权代币转移</li>
                          <li>• 成功调用后，spender 将获得指定数量的代币授权</li>
                          <li>• 请确保签名参数正确且未过期</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
                
                {/* 第三个卡片 - 生成TokenBank授权签名 */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-orange-400" />
                      生成 TokenBank 授权签名
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      专门针对 TokenBank 合约生成 permit 授权签名
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 参数输入 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankOwner" className="text-white">
                          Owner (所有者地址)
                          <span className="text-xs text-gray-400 ml-2">• 默认为当前钱包</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="bankOwner"
                            placeholder={address || "0x..."}
                            value={bankOwner || address || ''}
                            onChange={(e) => setBankOwner(e.target.value)}
                            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                          />
                          {address && (
                            <button
                              type="button"
                              onClick={() => setBankOwner(address)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                            >
                              使用当前钱包
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bankSpender" className="text-white">
                          Spender (授权地址)
                          <span className="text-xs text-green-400 ml-2">• 固定为TokenBank</span>
                        </Label>
                        <Input
                          id="bankSpender"
                          value={CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK}
                          disabled
                          className="bg-gray-700/30 border-gray-600 text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankValue" className="text-white">
                          Value (授权数量)
                        </Label>
                        <Input
                          id="bankValue"
                          type="number"
                          placeholder="请输入授权数量"
                          value={bankValue}
                          onChange={(e) => setBankValue(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bankDeadline" className="text-white">
                          Deadline (截止时间)
                        </Label>
                        <DateTimePicker
                          value={bankDeadline}
                          onChange={setBankDeadline}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    {/* 生成签名按钮 */}
                    <Button
                      onClick={handleGenerateBankSignature}
                      disabled={!bankValue || !bankDeadline || isGeneratingBankSignature || !isContractDataReady}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isGeneratingBankSignature ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          正在生成...
                        </>
                      ) : (
                        <>
                          <FileSignature className="w-4 h-4 mr-2" />
                          生成 TokenBank 授权签名
                        </>
                      )}
                    </Button>

                    {/* 签名结果显示 */}
                    {bankGeneratedSignature && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <h4 className="text-orange-400 font-medium mb-2">生成的签名参数</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">v: </span>
                            <span className="text-orange-400 font-mono">{bankGeneratedSignature.v}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">r: </span>
                            <span className="text-orange-400 font-mono text-xs break-all">{bankGeneratedSignature.r}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">s: </span>
                            <span className="text-orange-400 font-mono text-xs break-all">{bankGeneratedSignature.s}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 功能说明 */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                      <h4 className="text-orange-400 font-medium mb-2">功能说明</h4>
                      <div className="text-gray-300 text-sm space-y-1">
                        <ul className="space-y-1">
                          <li>• 专门针对 TokenBank 合约生成授权签名</li>
                          <li>• Owner 默认为当前钱包，Spender 固定为 TokenBank</li>
                          <li>• 可用于后续的 permitDeposit 操作</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 第四个卡片 - TokenBank 签名存款 */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-green-400" />
                    TokenBank 签名存款
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    使用已有的 permit 签名参数直接调用 permitDeposit 函数完成存款
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 存款参数输入 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permitDepositAmount" className="text-white">
                        存款金额
                      </Label>
                      <Input
                        id="permitDepositAmount"
                        type="number"
                        placeholder="请输入存款金额"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permitDepositDeadline" className="text-white">
                        截止时间
                      </Label>
                      <Input
                        id="permitDepositDeadline"
                        type="number"
                        placeholder="时间戳（秒）"
                        value={depositDeadline}
                        onChange={(e) => setDepositDeadline(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* 签名参数输入 */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">签名参数</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="permitDepositV" className="text-white">v</Label>
                        <Input
                          id="permitDepositV"
                          type="number"
                          placeholder="27 或 28"
                          value={depositSignature?.v || ''}
                          onChange={(e) => setDepositSignature(prev => prev ? {...prev, v: Number(e.target.value)} : null)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permitDepositR" className="text-white">r</Label>
                        <Input
                          id="permitDepositR"
                          placeholder="0x..."
                          value={depositSignature?.r || ''}
                          onChange={(e) => setDepositSignature(prev => prev ? {...prev, r: e.target.value} : null)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permitDepositS" className="text-white">s</Label>
                        <Input
                          id="permitDepositS"
                          placeholder="0x..."
                          value={depositSignature?.s || ''}
                          onChange={(e) => setDepositSignature(prev => prev ? {...prev, s: e.target.value} : null)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 调用permitDeposit按钮 */}
                  <Button
                    onClick={async () => {
                      if (!depositAmount || !depositDeadline || !depositSignature?.v || !depositSignature?.r || !depositSignature?.s) {
                        alert('请填写所有必要参数')
                        return
                      }
                      
                      try {
                        setIsCallingPermitDeposit(true)
                        
                        // 使用签名参数调用permitDeposit
                        // 这里需要调用hook中的permitDeposit函数，传入签名参数
                        alert('正在实现permitDeposit调用逻辑...')
                        
                      } catch (error) {
                        console.error('调用permitDeposit失败:', error)
                        alert(`调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
                      } finally {
                        setIsCallingPermitDeposit(false)
                      }
                    }}
                    disabled={!depositAmount || !depositDeadline || !depositSignature?.v || !depositSignature?.r || !depositSignature?.s || isCallingPermitDeposit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCallingPermitDeposit ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        调用中...
                      </>
                    ) : (
                      <>
                        <FileSignature className="w-4 h-4 mr-2" />
                        调用 permitDeposit 存款
                      </>
                    )}
                  </Button>

                  {/* 功能说明 */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2">功能说明</h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <ul className="space-y-1">
                        <li>• 使用已有的 permit 签名参数直接调用 permitDeposit 函数完成存款</li>
                        <li>• 无需预先批准，一步完成授权和存款</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  </div>
  )
}
