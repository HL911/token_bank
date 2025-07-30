import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
// 临时使用一个有效的项目ID来避免WebSocket连接错误
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'e598fe9bc526d2b1a8f34feb51c63c10'
if (!projectId) {
  throw new Error('Project ID is not defined. Please set NEXT_PUBLIC_PROJECT_ID in your .env.local file')
}

// 支持的网络配置
export const networks = [mainnet, sepolia, arbitrum]

// 项目元数据
export const metadata = {
  name: 'Token Bank',
  description: '基于区块链的数字资产银行应用',
  url: 'https://tokenbank.app', // 您的应用URL
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
  }
})

export const config = wagmiAdapter.wagmiConfig