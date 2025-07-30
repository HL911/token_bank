'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coins } from 'lucide-react'

interface TokenBankDepositCardProps {
  onPermitDeposit: (owner: string, value: string, deadline: string, v: number, r: string, s: string) => Promise<void>
  isDepositing: boolean
  isContractDataReady: boolean
  tokenBalance?: string
  onRefreshBalance: () => void
}

export function TokenBankDepositCard({ 
  onPermitDeposit, 
  isDepositing, 
  isContractDataReady,
  tokenBalance,
  onRefreshBalance
}: TokenBankDepositCardProps) {
  const [depositOwner, setDepositOwner] = useState('')
  const [depositValue, setDepositValue] = useState('')
  const [depositDeadline, setDepositDeadline] = useState('')
  const [depositV, setDepositV] = useState('')
  const [depositR, setDepositR] = useState('')
  const [depositS, setDepositS] = useState('')

  const handleDeposit = async () => {
    if (!depositOwner || !depositValue || !depositDeadline || !depositV || !depositR || !depositS) {
      alert('请填写所有参数')
      return
    }

    // 验证输入数值
    const numericValue = parseFloat(depositValue)
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('请输入有效的存款数量')
      return
    }

    const vNumber = parseInt(depositV)
    if (isNaN(vNumber)) {
      alert('请输入有效的 v 值')
      return
    }

    // 验证时间格式
    const deadlineTimestamp = Number(depositDeadline)
    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= 0) {
      alert('请输入有效的截止时间戳')
      return
    }

    if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      alert('截止时间必须在当前时间之后')
      return
    }

    await onPermitDeposit(depositOwner, depositValue, depositDeadline, vNumber, depositR, depositS)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-green-400" />
          TokenBank 签名存款
        </CardTitle>
        <CardDescription className="text-gray-400">
          使用签名参数执行 TokenBank 的 permitDeposit 存款
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 余额显示 */}
        <div className="bg-gray-700/30 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">当前 Token 余额:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">
                {tokenBalance || '加载中...'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshBalance}
                className="bg-gray-600/50 border-gray-500 text-gray-300 hover:bg-gray-500/50"
              >
                刷新
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit-owner" className="text-white">Owner (持有者地址)</Label>
          <Input
            id="deposit-owner"
            placeholder="0x..."
            value={depositOwner}
            onChange={(e) => setDepositOwner(e.target.value)}
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-value" className="text-white">Value (存款数量)</Label>
            <Input
              id="deposit-value"
              type="number"
              placeholder="1.0"
              value={depositValue}
              onChange={(e) => setDepositValue(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-deadline" className="text-white">Deadline (截止时间戳)</Label>
            <Input
              id="deposit-deadline"
              placeholder="1706612400"
              value={depositDeadline}
              onChange={(e) => setDepositDeadline(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-v" className="text-white">v</Label>
            <Input
              id="deposit-v"
              placeholder="27"
              value={depositV}
              onChange={(e) => setDepositV(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-r" className="text-white">r</Label>
            <Input
              id="deposit-r"
              placeholder="0x..."
              value={depositR}
              onChange={(e) => setDepositR(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-s" className="text-white">s</Label>
            <Input
              id="deposit-s"
              placeholder="0x..."
              value={depositS}
              onChange={(e) => setDepositS(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/30 p-3 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>提示:</strong> 您可以从上方的"生成 TokenBank 授权签名"卡片中复制签名参数，
            或者使用其他工具生成的签名参数来执行存款操作。
          </p>
        </div>

        <Button
          onClick={handleDeposit}
          disabled={!depositOwner || !depositValue || !depositDeadline || !depositV || !depositR || !depositS || isDepositing || !isContractDataReady}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isDepositing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              存款中...
            </>
          ) : (
            '执行签名存款'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
