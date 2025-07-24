'use client'

// 钱包连接组件 - 处理钱包的连接和断开
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'

// 格式化地址显示
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletConnect() {
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true)
      await connect({ connector })
    } catch (error) {
      console.error('连接钱包失败:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      console.log('开始断开钱包连接...')
      await disconnect()
      console.log('钱包连接已断开')
    } catch (error) {
      console.error('断开钱包失败:', error)
    }
  }

  // 服务器端渲染时显示加载状态
  if (!isClient) {
    return (
      <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">钱包连接</h2>
        <div className="space-y-4">
          <p className="text-gray-300 mb-6 text-center">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-500/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">钱包连接</h2>
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
            {address ? (
              <p className="text-green-200/80 text-sm mt-2 font-mono">
                地址: {formatAddress(address)}
              </p>
            ) : (
              <p className="text-green-200/80 text-sm mt-2 font-mono">
                地址加载中...
              </p>
            )}
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
