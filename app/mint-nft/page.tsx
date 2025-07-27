'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCard, FadeInUp } from '../components/animations/AnimatedCard'
import { useNFTMint } from '../contracts/hooks/useNFTMint'

export default function MintNFTPage() {
  const { address, isConnected } = useAccount()
  const [isClient, setIsClient] = useState(false)
  const [tokenURI, setTokenURI] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { mintNFT, isLoading } = useNFTMint()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!address) {
      setError('请先连接钱包')
      return
    }

    if (!tokenURI.trim()) {
      setError('请输入NFT元数据URI')
      return
    }

    try {
      await mintNFT(address, tokenURI)
      setSuccess('NFT铸造成功！请等待交易确认')
      setTokenURI('')
    } catch (error: any) {
      console.error('铸造失败:', error)
      setError(error.message || '铸造失败，请重试')
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent mb-4">
              铸造 NFT
            </h1>
            <p className="text-gray-400 text-lg">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <FadeInUp>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25"
            >
              <span className="text-2xl">🎨</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">
              铸造 NFT
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              创建您的独特数字资产
            </p>
          </div>
        </FadeInUp>

        {/* 铸造表单 */}
        <AnimatedCard delay={0.4}>
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                铸造新的NFT
              </CardTitle>
              <CardDescription className="text-gray-400">
                填写NFT信息并铸造您的数字资产
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-2xl font-bold text-white mb-2">请连接钱包</h3>
                  <p className="text-gray-400">连接钱包后即可铸造NFT</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      NFT元数据URI
                    </label>
                    <input
                      type="url"
                      value={tokenURI}
                      onChange={(e) => setTokenURI(e.target.value)}
                      placeholder="例如: https://example.com/metadata.json"
                      disabled={isLoading}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      输入指向NFT元数据JSON文件的URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      接收地址
                    </label>
                    <input
                      type="text"
                      value={address || ''}
                      disabled
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      NFT将铸造到您当前连接的钱包地址
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
                    >
                      <p className="text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
                    >
                      <p className="text-green-400">{success}</p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading || !tokenURI.trim()}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>铸造中...</span>
                      </div>
                    ) : (
                      '铸造 NFT'
                    )}
                  </motion.button>
                </form>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* 使用说明 */}
        <AnimatedCard delay={0.6} className="mt-8">
          <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur-xl border border-blue-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <span className="text-2xl">💡</span>
                铸造说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-blue-300 font-medium">📋 元数据格式</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm">
                    <pre className="text-gray-300">{`{
  "name": "My NFT",
  "description": "NFT描述",
  "image": "https://...",
  "attributes": [...]
}`}</pre>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-blue-300 font-medium">🔗 示例URI</h4>
                  <ul className="text-blue-200/80 text-sm space-y-2">
                    <li>• IPFS: ipfs://QmHash...</li>
                    <li>• HTTP: https://api.example.com/metadata/1</li>
                    <li>• Arweave: ar://transaction-id</li>
                  </ul>
                  <div className="mt-4">
                    <h4 className="text-blue-300 font-medium mb-2">✨ 铸造后</h4>
                    <p className="text-blue-200/80 text-sm">
                      铸造成功后，您可以在"NFT市场"页面的"我的NFT"标签中查看和管理您的NFT。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  )
}
