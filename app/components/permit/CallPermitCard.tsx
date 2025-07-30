'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'

interface CallPermitCardProps {
  onCallPermit: (owner: string, spender: string, value: string, deadline: string, v: number, r: string, s: string) => Promise<void>
  isCalling: boolean
  isContractDataReady: boolean
  // 用于自动填充的参数
  owner?: string
  spender?: string
  value?: string
  deadline?: string
  v?: number
  r?: string
  s?: string
}

export function CallPermitCard({ 
  onCallPermit, 
  isCalling, 
  isContractDataReady,
  owner = '',
  spender = '',
  value = '',
  deadline = '',
  v = 0,
  r = '',
  s = ''
}: CallPermitCardProps) {
  const [permitOwner, setPermitOwner] = useState(owner)
  const [permitSpender, setPermitSpender] = useState(spender)
  const [permitValue, setPermitValue] = useState(value)
  const [permitDeadline, setPermitDeadline] = useState(deadline)
  const [permitV, setPermitV] = useState(v.toString())
  const [permitR, setPermitR] = useState(r)
  const [permitS, setPermitS] = useState(s)

  // 当外部参数变化时更新内部状态
  useState(() => {
    setPermitOwner(owner)
    setPermitSpender(spender)
    setPermitValue(value)
    setPermitDeadline(deadline)
    setPermitV(v.toString())
    setPermitR(r)
    setPermitS(s)
  })

  const handleCallPermit = async () => {
    if (!permitOwner || !permitSpender || !permitValue || !permitDeadline || !permitV || !permitR || !permitS) {
      alert('请填写所有参数')
      return
    }

    // 验证输入数值
    const numericValue = parseFloat(permitValue)
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('请输入有效的数量')
      return
    }

    const vNumber = parseInt(permitV)
    if (isNaN(vNumber)) {
      alert('请输入有效的 v 值')
      return
    }

    await onCallPermit(permitOwner, permitSpender, permitValue, permitDeadline, vNumber, permitR, permitS)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-purple-400" />
          执行 Token 授权
        </CardTitle>
        <CardDescription className="text-gray-400">
          使用签名参数调用 permit 函数执行授权
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="permit-owner" className="text-white">Owner (持有者地址)</Label>
            <Input
              id="permit-owner"
              placeholder="0x..."
              value={permitOwner}
              onChange={(e) => setPermitOwner(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permit-spender" className="text-white">Spender (授权地址)</Label>
            <Input
              id="permit-spender"
              placeholder="0x..."
              value={permitSpender}
              onChange={(e) => setPermitSpender(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="permit-value" className="text-white">Value (数量)</Label>
            <Input
              id="permit-value"
              type="number"
              placeholder="1.0"
              value={permitValue}
              onChange={(e) => setPermitValue(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permit-deadline" className="text-white">Deadline (截止时间戳)</Label>
            <Input
              id="permit-deadline"
              placeholder="1706612400"
              value={permitDeadline}
              onChange={(e) => setPermitDeadline(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="permit-v" className="text-white">v</Label>
            <Input
              id="permit-v"
              placeholder="27"
              value={permitV}
              onChange={(e) => setPermitV(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permit-r" className="text-white">r</Label>
            <Input
              id="permit-r"
              placeholder="0x..."
              value={permitR}
              onChange={(e) => setPermitR(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permit-s" className="text-white">s</Label>
            <Input
              id="permit-s"
              placeholder="0x..."
              value={permitS}
              onChange={(e) => setPermitS(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <Button
          onClick={handleCallPermit}
          disabled={!permitOwner || !permitSpender || !permitValue || !permitDeadline || !permitV || !permitR || !permitS || isCalling || !isContractDataReady}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isCalling ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              执行中...
            </>
          ) : (
            '执行 Permit 授权'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
