'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { DateTimePicker } from '@/app/components/ui/datetime-picker'

interface ManualPermitCardProps {
  onGenerateSignature: (owner: string, spender: string, value: string, deadline: string) => Promise<void>
  isGenerating: boolean
  isContractDataReady: boolean
}

export function ManualPermitCard({ 
  onGenerateSignature, 
  isGenerating, 
  isContractDataReady 
}: ManualPermitCardProps) {
  const { address } = useAccount()
  const [manualOwner, setManualOwner] = useState('')
  const [manualSpender, setManualSpender] = useState('')
  const [manualValue, setManualValue] = useState('')
  const [manualDeadline, setManualDeadline] = useState('')

  const handleGenerate = async () => {
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

    await onGenerateSignature(manualOwner, manualSpender, manualValue, deadlineToUse)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          生成 Token 授权签名
        </CardTitle>
        <CardDescription className="text-gray-400">
          生成 ERC20 token 的 permit 签名参数 (v, r, s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner" className="text-white">Owner (持有者地址)</Label>
            <div className="flex gap-2">
              <Input
                id="owner"
                placeholder="0x..."
                value={manualOwner}
                onChange={(e) => setManualOwner(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => address && setManualOwner(address)}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 whitespace-nowrap"
              >
                当前钱包
              </Button>
            </div>
            <p className="text-xs text-gray-500">必须与当前钱包地址一致</p>
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="md:col-span-1">
            <DateTimePicker
              value={manualDeadline}
              onChange={setManualDeadline}
              label="Deadline (截止时间)"
              placeholder="请设置截止时间"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!manualOwner || !manualSpender || !manualValue || !manualDeadline || isGenerating || !isContractDataReady}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              生成中...
            </>
          ) : (
            '生成 Permit 签名'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
