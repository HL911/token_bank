'use client'

import { useNFTMarketEvents } from '../contracts/hooks/useNFTMarketEvents'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'

export default function NFTMarketPage() {
  const [isClient, setIsClient] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { 
    listedEvents, 
    soldEvents, 
    cancelledEvents, 
    isListening,
    startListening,
    stopListening,
    clearEvents 
  } = useNFTMarketEvents()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 防止水合错误，在客户端渲染完成前显示加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">NFT 市场事件监听</h1>
            <p className="text-gray-600 text-lg">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">NFT 市场事件监听</h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isListening ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {isListening ? '正在监听中...' : '监听已停止'}
              </span>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex gap-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <span>▶️</span>
                  开始监听
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <span>⏹️</span>
                  停止监听
                </button>
              )}
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span>📊</span>
                {showHistory ? '隐藏历史' : '查看历史'}
              </button>
              
              <button
                onClick={clearEvents}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span>🗑️</span>
                清空历史
              </button>
            </div>
          </div>
        </div>

        {/* 事件统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">上架事件</p>
                <p className="text-2xl font-bold text-blue-600">{listedEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">售出事件</p>
                <p className="text-2xl font-bold text-green-600">{soldEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">取消事件</p>
                <p className="text-2xl font-bold text-red-600">{cancelledEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* 历史记录切换提示 */}
        {!showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">📊 事件历史记录</h2>
              <p className="text-gray-600 mb-4">点击上方"查看历史"按钮可以查看详细的事件监听历史记录</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-800">📝 上架事件历史</div>
                  <div className="text-blue-600">查看所有NFT上架记录</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-800">💰 售出事件历史</div>
                  <div className="text-green-600">查看所有NFT交易记录</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="font-medium text-red-800">❌ 取消事件历史</div>
                  <div className="text-red-600">查看所有取消上架记录</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 事件列表 - 仅在显示历史时展示 */}
        {showHistory && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📊 事件历史记录</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span>👁️</span>
                隐藏历史
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NFT 上架事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span>
              NFT 上架事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {listedEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无上架事件</p>
              ) : (
                listedEvents.map((event, index) => (
                  <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-blue-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">卖家:</span>
                        <span className="font-mono text-xs">{event.seller.slice(0, 6)}...{event.seller.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono">#{event.tokenId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">价格:</span>
                        <span className="font-bold text-blue-600">{formatEther(event.price)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NFT 售出事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span>
              NFT 售出事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {soldEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无售出事件</p>
              ) : (
                soldEvents.map((event, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-green-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">买家:</span>
                        <span className="font-mono text-xs">{event.buyer.slice(0, 6)}...{event.buyer.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">卖家:</span>
                        <span className="font-mono text-xs">{event.seller.slice(0, 6)}...{event.seller.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono">#{event.tokenId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">成交价:</span>
                        <span className="font-bold text-green-600">{formatEther(event.price)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NFT 取消上架事件 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>❌</span>
              取消上架事件
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cancelledEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无取消事件</p>
              ) : (
                cancelledEvents.map((event, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上架ID:</span>
                        <span className="font-mono text-red-600">#{event.listingId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">时间:</span>
                        <span className="text-xs">{new Date(event.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-red-200">
                        <a 
                          href={`https://etherscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-700 text-xs underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📝</span>
              <div>
                <p className="font-medium text-gray-800">上架事件</p>
                <p>当有 NFT 在市场上架时，会实时显示上架信息，包括卖家、价格等详情。</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">💰</span>
              <div>
                <p className="font-medium text-gray-800">售出事件</p>
                <p>当 NFT 成功售出时，会显示买家、卖家和成交价格等交易信息。</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500">❌</span>
              <div>
                <p className="font-medium text-gray-800">取消事件</p>
                <p>当卖家取消 NFT 上架时，会记录取消上架的相关信息。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
