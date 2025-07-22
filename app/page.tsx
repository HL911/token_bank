'use client'

// Token Bank 主页面 - 集成所有功能模块
import WalletConnect from './components/wallet/WalletConnect'
import TokenBalance from './components/balance/TokenBalance'
import DepositForm from './components/deposit/DepositForm'
import WithdrawForm from './components/withdraw/WithdrawForm'
import TransferForm from './components/transfer/TransferForm'
import QueryForm from './components/query/QueryForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* 页面标题 */}
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏦 Token Bank</h1>
          <p className="text-gray-600 text-lg">基于区块链的数字资产银行</p>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded"></div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 钱包连接模块 */}
        <WalletConnect />
        
        {/* 功能模块网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧列 */}
          <div className="space-y-6">
            {/* 余额显示模块 */}
            <TokenBalance />
            
            {/* 存款功能模块 */}
            <DepositForm />
            
            {/* 取款功能模块 */}
            <WithdrawForm />
          </div>
          
          {/* 右侧列 */}
          <div className="space-y-6">
            {/* 转账功能模块 */}
            <TransferForm />
            
            {/* 查询功能模块 */}
            <QueryForm />
          </div>
        </div>
        
        {/* 页面底部信息 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 功能特性</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>模块化架构设计</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-blue-500">🔗</span>
                <span>基于 viem 和 wagmi</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-purple-500">🔐</span>
                <span>安全的钱包连接</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 提示：这是演示版本，实际使用需要连接到真实的智能合约和区块链网络
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
