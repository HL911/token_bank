'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard, FadeInUp } from '../components/animations/AnimatedCard'
import { useNFTPermitBuy } from '../contracts/hooks/useNFTPermitBuy'
import { useNFTMarket } from '../contracts/hooks/useNFTMarket'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'

export default function WhitelistAdminPage() {
  const { address, isConnected } = useAccount()
  const [isClient, setIsClient] = useState(false)
  const [buyerAddress, setBuyerAddress] = useState('')
  const [listingId, setListingId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [generatedSignature, setGeneratedSignature] = useState<any>(null)
  const [error, setError] = useState('')
  
  const { generatePermitBuySignature, getDefaultDeadline, isLoading } = useNFTPermitBuy()
  const { permitBuyNFT, isLoading: isBuying } = useNFTMarket()

  useEffect(() => {
    setIsClient(true)
    // 设置默认截止时间（1小时后）
    const defaultDeadline = getDefaultDeadline()
    setDeadline(defaultDeadline.toString())
  }, [getDefaultDeadline])

  const handleGenerateSignature = async () => {
    setError('')
    
    if (!buyerAddress || !listingId || !deadline) {
      setError('请填写所有必需字段')
      return
    }

    try {
      const signature = await generatePermitBuySignature(
        buyerAddress,
        listingId,
        BigInt(deadline)
      )
      setGeneratedSignature(signature)
    } catch (error: any) {
      console.error('生成签名失败:', error)
      setError(error.message || '生成签名失败')
    }
  }

  const handleTestPermitBuy = async () => {
    if (!generatedSignature) {
      setError('请先生成签名')
      return
    }

    try {
      await permitBuyNFT(
        listingId,
        generatedSignature.deadline,
        generatedSignature.v,
        generatedSignature.r,
        generatedSignature.s
      )
      alert('白名单购买成功！')
      setGeneratedSignature(null)
      setBuyerAddress('')
      setListingId('')
    } catch (error: any) {
      console.error('白名单购买失败:', error)
      setError(error.message || '白名单购买失败')
    }
  }

  const copySignatureToClipboard = () => {
    if (!generatedSignature) return
    
    const signatureData = {
      listingId,
      buyerAddress,
      deadline: generatedSignature.deadline.toString(),
      v: generatedSignature.v,
      r: generatedSignature.r,
      s: generatedSignature.s
    }
    
    navigator.clipboard.writeText(JSON.stringify(signatureData, null, 2))
    alert('签名数据已复制到剪贴板')
  }

  if (!isClient) {
    return <div>加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <FadeInUp delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              🔐 白名单管理后台
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              项目方专用：为特定用户生成NFT白名单购买授权签名
            </p>
          </div>
        </FadeInUp>

        {/* 连接状态检查 */}
        {!isConnected ? (
          <AnimatedCard delay={0.3}>
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50">
              <CardContent className="text-center py-20">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-white mb-2">请连接钱包</h3>
                <p className="text-gray-400">只有项目方（合约owner）才能生成白名单购买签名</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 签名生成卡片 */}
            <AnimatedCard delay={0.3}>
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-400">📝 生成白名单签名</CardTitle>
                  <CardDescription className="text-gray-400">
                    为特定买家和NFT生成购买授权签名
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 买家地址 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      买家地址 *
                    </label>
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors font-mono text-sm"
                    />
                  </div>

                  {/* Listing ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      NFT Listing ID *
                    </label>
                    <input
                      type="text"
                      value={listingId}
                      onChange={(e) => setListingId(e.target.value)}
                      placeholder="例如: 1"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                    />
                  </div>

                  {/* 截止时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      签名截止时间 (Unix时间戳) *
                    </label>
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="Unix时间戳"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors font-mono text-sm"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      当前时间戳: {Math.floor(Date.now() / 1000)} (默认设置为1小时后)
                    </p>
                  </div>

                  {/* 错误信息 */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* 生成签名按钮 */}
                  <motion.button
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onClick={handleGenerateSignature}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-medium hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '生成中...' : '🔐 生成白名单签名'}
                  </motion.button>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* 签名结果卡片 */}
            <AnimatedCard delay={0.5}>
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-400">✅ 签名结果</CardTitle>
                  <CardDescription className="text-gray-400">
                    生成的白名单购买授权签名
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!generatedSignature ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-400">请先生成签名</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 签名参数 */}
                      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">Listing ID:</label>
                          <p className="font-mono text-sm text-white break-all">{listingId}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">买家地址:</label>
                          <p className="font-mono text-sm text-white break-all">{buyerAddress}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">截止时间:</label>
                          <p className="font-mono text-sm text-white">{generatedSignature.deadline.toString()}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">v:</label>
                          <p className="font-mono text-sm text-white">{generatedSignature.v}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">r:</label>
                          <p className="font-mono text-sm text-white break-all">{generatedSignature.r}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">s:</label>
                          <p className="font-mono text-sm text-white break-all">{generatedSignature.s}</p>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={copySignatureToClipboard}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                        >
                          📋 复制签名数据
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: isBuying ? 1 : 1.02 }}
                          whileTap={{ scale: isBuying ? 1 : 0.98 }}
                          onClick={handleTestPermitBuy}
                          disabled={isBuying}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-black px-6 py-3 rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBuying ? '购买中...' : '🛒 测试白名单购买'}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        )}

        {/* 使用说明 */}
        <AnimatedCard delay={0.7}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-blue-300">📖 使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-200/80">
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">项目方操作流程:</h4>
                  <ul className="space-y-1">
                    <li>• 1. 确保当前钱包是合约的owner</li>
                    <li>• 2. 输入买家地址和NFT的Listing ID</li>
                    <li>• 3. 设置签名截止时间（默认1小时后）</li>
                    <li>• 4. 点击生成签名，使用MetaMask签名</li>
                    <li>• 5. 将签名数据提供给买家</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">买家使用流程:</h4>
                  <ul className="space-y-1">
                    <li>• 1. 获得项目方提供的签名数据</li>
                    <li>• 2. 在NFT市场找到对应的白名单NFT</li>
                    <li>• 3. 使用签名参数调用permitBuy函数</li>
                    <li>• 4. 完成白名单购买</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  )
}
