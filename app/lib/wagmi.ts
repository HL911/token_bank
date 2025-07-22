// Wagmi配置文件 - 用于钱包连接和区块链交互
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// 创建wagmi配置
export const config = createConfig({
  chains: [mainnet, sepolia], // 支持的区块链网络
  connectors: [
    injected(), // 注入式钱包连接器
    metaMask(), // MetaMask连接器
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id' 
    }), // WalletConnect连接器
  ],
  transports: {
    [mainnet.id]: http(), // 主网传输层
    [sepolia.id]: http(), // 测试网传输层
  },
})

// 导出wagmi配置类型
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
