'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CONTRACT_ADDRESSES } from '@/app/contracts/addresses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { DateTimePicker } from '@/app/components/ui/datetime-picker'

interface SignatureResult {
  v: number
  r: string
  s: string
  owner: string
  spender: string
  value: string
  deadline: string
}

interface TokenBankSignatureCardProps {
  onGenerateBankSignature: (owner: string, spender: string, value: string, deadline: string) => Promise<SignatureResult>
  isGenerating: boolean
  isContractDataReady: boolean
  tokenBankAddress: string
}

export function TokenBankSignatureCard({ 
  onGenerateBankSignature, 
  isGenerating, 
  isContractDataReady,
  tokenBankAddress 
}: TokenBankSignatureCardProps) {
  const { address } = useAccount()
  const [bankOwner, setBankOwner] = useState('')
  const [bankValue, setBankValue] = useState('')
  const [bankDeadline, setBankDeadline] = useState('')
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null)

  const handleGenerate = async () => {
    if (!bankOwner || !bankValue || !bankDeadline) {
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
      const result = await onGenerateBankSignature(bankOwner, tokenBankAddress, bankValue, bankDeadline)
      setSignatureResult({
        ...result,
        owner: bankOwner,
        spender: tokenBankAddress,
        value: bankValue,
        deadline: bankDeadline
      })
    } catch (error) {
      console.error('生成签名失败:', error)
      setSignatureResult(null)
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-400" />
          生成 TokenBank 授权签名
        </CardTitle>
        <CardDescription className="text-gray-400">
          生成针对 TokenBank 合约的 permit 签名参数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bank-owner" className="text-white">Owner (持有者地址)</Label>
          <div className="flex gap-2">
            <Input
              id="bank-owner"
              placeholder="0x..."
              value={bankOwner}
              onChange={(e) => setBankOwner(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => address && setBankOwner(address)}
              className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 whitespace-nowrap"
            >
              当前钱包
            </Button>
          </div>
          <p className="text-xs text-gray-500">必须与当前钱包地址一致</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank-spender" className="text-white">Spender (TokenBank 合约)</Label>
          <Input
            id="bank-spender"
            value={tokenBankAddress}
            readOnly
            className="bg-gray-700/30 border-gray-600 text-gray-300 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">自动设置为 TokenBank 合约地址</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank-value" className="text-white">Value (授权数量)</Label>
            <Input
              id="bank-value"
              type="number"
              placeholder="1.0"
              value={bankValue}
              onChange={(e) => setBankValue(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="md:col-span-1">
            <DateTimePicker
              value={bankDeadline}
              onChange={setBankDeadline}
              label="Deadline (截止时间)"
              placeholder="请设置截止时间"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!bankOwner || !bankValue || !bankDeadline || isGenerating || !isContractDataReady}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              生成中...
            </>
          ) : (
            '生成 TokenBank 授权签名'
          )}
        </Button>

        {/* 签名结果显示区域 */}
        {signatureResult && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              TokenBank 授权签名生成成功
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-green-200 text-xs">Owner (持有者)</Label>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300 break-all">
                    {signatureResult.owner}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-green-200 text-xs">Spender (TokenBank)</Label>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300 break-all">
                    {signatureResult.spender}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-green-200 text-xs">Value (数量)</Label>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300">
                    {signatureResult.value}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-green-200 text-xs">Deadline (截止时间)</Label>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300">
                    {signatureResult.deadline}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-green-200 text-sm font-semibold">签名参数 (Signature Parameters)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-green-200 text-xs">v</Label>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300">
                      {signatureResult.v}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-green-200 text-xs">r</Label>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300 break-all">
                      {signatureResult.r}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-green-200 text-xs">s</Label>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300 break-all">
                      {signatureResult.s}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/30 p-3 rounded-lg mt-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>使用提示:</strong> 您可以复制上述签名参数到右侧的"TokenBank 签名存款"卡片中执行存款操作。
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
