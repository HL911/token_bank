'use client'

// 钱包连接组件 - 处理钱包的连接和断开
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  // 处理钱包连接
  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true)
      await connect({ connector })
    } catch (error) {
      console.error('钱包连接失败:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // 处理钱包断开
  const handleDisconnect = () => {
    disconnect()
  }

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">🔗 钱包连接</h2>
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-300 mb-6">请选择钱包进行连接：</p>
          {connectors
            .map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending || isConnecting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isConnecting ? '🔄 连接中...' : `连接 ${connector.name}`}
              </button>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
            <p className="text-green-300 font-medium flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              钱包已连接
            </p>
            <p className="text-green-200/80 text-sm mt-2 font-mono">
              地址: {formatAddress(address!)}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105"
          >
            🔌 断开钱包
          </button>
        </div>
      )}
    </div>
  )
}
