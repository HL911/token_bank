'use client'

import { motion } from 'framer-motion'
import { AnimatedCard, FadeInUp, SlideInLeft, PulseGlow } from './components/animations/AnimatedCard'
import WalletConnect from './components/wallet/WalletConnect'
import TokenBalance from './components/balance/TokenBalance'
import DepositForm from './components/deposit/DepositForm'
import WithdrawForm from './components/withdraw/WithdrawForm'
import TransferForm from './components/transfer/TransferForm'
import QueryForm from './components/query/QueryForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-8">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center">
          <FadeInUp>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25"
            >
              <span className="text-3xl">🏦</span>
            </motion.div>
          </FadeInUp>
          
          <FadeInUp delay={0.3}>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent mb-4">
              Token Bank
            </h1>
          </FadeInUp>
          
          <FadeInUp delay={0.5}>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              基于区块链的数字资产银行 - 安全、透明、去中心化的金融服务
            </p>
          </FadeInUp>
          
          <FadeInUp delay={0.7}>
            <motion.div 
              className="w-32 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 40px rgba(34, 197, 94, 0.8)',
                  '0 0 20px rgba(34, 197, 94, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </FadeInUp>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 钱包连接模块 */}
        <AnimatedCard delay={0.8} className="mb-8">
          <WalletConnect />
        </AnimatedCard>
        
        {/* 功能模块网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧列 */}
          <div className="space-y-8">
            {/* 余额显示模块 */}
            <SlideInLeft delay={1.0}>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <TokenBalance />
              </div>
            </SlideInLeft>
            
            {/* 存款功能模块 */}
            <SlideInLeft delay={1.2}>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <DepositForm />
              </div>
            </SlideInLeft>
            
            {/* 取款功能模块 */}
            <SlideInLeft delay={1.4}>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <WithdrawForm />
              </div>
            </SlideInLeft>
          </div>
          
          {/* 右侧列 */}
          <div className="space-y-8">
            {/* 转账功能模块 */}
            <AnimatedCard delay={1.1}>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <TransferForm />
              </div>
            </AnimatedCard>
            
            {/* 查询功能模块 */}
            <AnimatedCard delay={1.3}>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <QueryForm />
              </div>
            </AnimatedCard>
          </div>
        </div>
        
        {/* 页面底部信息 */}
        <AnimatedCard delay={1.5} className="mt-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl text-center">
            <motion.h3 
              className="text-2xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚀 功能特性
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="flex items-center justify-center space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-green-300 font-medium">模块化架构设计</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-400 text-xl">🔗</span>
                <span className="text-blue-300 font-medium">基于 viem 和 wagmi</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center space-x-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-purple-400 text-xl">🔐</span>
                <span className="text-purple-300 font-medium">安全的钱包连接</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-6 pt-6 border-t border-gray-700/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <p className="text-sm text-gray-400">
                💡 提示：这是演示版本，实际使用需要连接到真实的智能合约和区块链网络
              </p>
            </motion.div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
