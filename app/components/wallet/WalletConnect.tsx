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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">钱包连接</h2>
      
      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-gray-600 mb-4">请选择钱包进行连接：</p>
          {connectors
            // .filter(connector => connector.name === 'MetaMask')
            .map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending || isConnecting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isConnecting ? '连接中...' : `连接 ${connector.name}`}
              </button>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✅ 钱包已连接</p>
            <p className="text-green-600 text-sm mt-1">
              地址: {formatAddress(address!)}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            断开钱包
          </button>
        </div>
      )}
    </div>
  )
}
