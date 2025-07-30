import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  value: string
  onChange: (timestamp: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export function DateTimePicker({ 
  value, 
  onChange, 
  label = "选择时间",
  placeholder = "选择截止时间",
  className = ""
}: DateTimePickerProps) {
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')

  // 将时间戳转换为日期和时间
  useEffect(() => {
    if (value && !isNaN(Number(value))) {
      const timestamp = Number(value) * 1000 // 转换为毫秒
      const date = new Date(timestamp)
      
      // 格式化日期 (YYYY-MM-DD)
      const formattedDate = date.toISOString().split('T')[0]
      
      // 格式化时间 (HH:MM)
      const formattedTime = date.toTimeString().slice(0, 5)
      
      setDateValue(formattedDate)
      setTimeValue(formattedTime)
    }
  }, [value])

  // 处理日期变化
  const handleDateChange = (newDate: string) => {
    setDateValue(newDate)
    updateTimestamp(newDate, timeValue)
  }

  // 处理时间变化
  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    updateTimestamp(dateValue, newTime)
  }

  // 更新时间戳
  const updateTimestamp = (date: string, time: string) => {
    if (date && time) {
      const datetime = new Date(`${date}T${time}:00`)
      const timestamp = Math.floor(datetime.getTime() / 1000).toString()
      onChange(timestamp)
    }
  }

  // 设置快捷时间
  const setQuickTime = (hours: number) => {
    const now = new Date()
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000)
    
    const formattedDate = futureTime.toISOString().split('T')[0]
    const formattedTime = futureTime.toTimeString().slice(0, 5)
    
    setDateValue(formattedDate)
    setTimeValue(formattedTime)
    
    const timestamp = Math.floor(futureTime.getTime() / 1000).toString()
    onChange(timestamp)
  }

  // 获取当前时间戳显示
  const getTimestampDisplay = () => {
    if (value && !isNaN(Number(value))) {
      const date = new Date(Number(value) * 1000)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    return ''
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-white">{label}</Label>
      
      {/* 日期时间输入 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-gray-700/50 border-gray-600 text-white pl-10"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-gray-700/50 border-gray-600 text-white pl-10"
          />
        </div>
      </div>

      {/* 快捷时间按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickTime(1)}
          className="text-xs bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-600/50"
        >
          1小时后
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickTime(24)}
          className="text-xs bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-600/50"
        >
          1天后
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickTime(24 * 7)}
          className="text-xs bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-600/50"
        >
          1周后
        </Button>
      </div>

      {/* 时间戳显示 */}
      {value && (
        <div className="bg-gray-700/20 rounded-lg p-3 space-y-1">
          <div className="text-sm text-gray-400">时间戳: 
            <span className="text-green-400 font-mono ml-2">{value}</span>
          </div>
          <div className="text-sm text-gray-400">时间: 
            <span className="text-blue-400 ml-2">{getTimestampDisplay()}</span>
          </div>
        </div>
      )}

      {/* 直接输入时间戳 */}
      <div className="space-y-2">
        <Label className="text-gray-400 text-sm">或直接输入时间戳</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-mono"
        />
      </div>
    </div>
  )
}
