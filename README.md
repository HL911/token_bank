# Token Bank - 区块链代币银行应用

一个基于 Next.js 和 Web3 技术构建的现代化区块链应用，提供完整的 ERC20 代币管理、NFT 市场和 EIP-2612 Permit 签名功能。

## 🌟 项目特色

- **Safe.global 风格设计** - 采用深色主题和绿色渐变的现代化 UI
- **完整的 Web3 集成** - 支持多种钱包连接和区块链交互
- **模块化架构** - 高性能的组件化设计，编译速度提升 91%
- **响应式设计** - 完美支持桌面端和移动端
- **中文本地化** - 全中文界面，用户体验友好

## 🚀 核心功能

### 1. ERC20 代币管理
- **代币转账** - 支持 ERC20 代币转账功能
- **余额查询** - 实时查询代币余额
- **多代币支持** - 支持 MTK 和自定义 ERC20 代币
- **代币信息显示** - 自动获取代币符号和小数位数

### 2. EIP-2612 Permit 签名存款
- **无 Gas 授权** - 使用 EIP-712 签名实现无 Gas 代币授权
- **签名存款** - 支持 permit 签名存款到 TokenBank 合约
- **手动 Permit 管理** - 完整的 permit 签名生成和调用功能
- **参数自动复制** - 智能的参数传递，提升用户体验
- **动态域配置** - 自动从合约读取 EIP-712 域配置

### 3. NFT 市场
- **NFT 铸造** - 支持用户铸造新的 NFT
- **NFT 交易** - 完整的上架、购买、下架功能
- **实时事件监听** - 监听 NFT 上架、售出、取消等事件
- **事件历史** - 完整的交易历史记录和统计
- **多代币支付** - 支持 ETH 和 ERC20 代币支付

### 4. 高级功能
- **粒子背景效果** - 使用 tsparticles 实现动态背景
- **流畅动画** - 基于 framer-motion 的动画效果
- **实时数据更新** - 自动刷新余额和状态
- **错误处理** - 完善的错误提示和处理机制

## 🛠 技术栈

### 前端框架
- **Next.js 15.4.2** - React 全栈框架
- **React 19.1.0** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架

### Web3 技术
- **Wagmi 2.16.0** - React Hooks for Ethereum
- **Viem 2.33.1** - TypeScript 接口的以太坊库
- **Reown AppKit** - 钱包连接解决方案
- **TanStack React Query** - 数据获取和状态管理

### UI 组件库
- **shadcn/ui** - 现代化组件库
- **Radix UI** - 无样式的可访问组件
- **Lucide React** - 美观的图标库
- **Framer Motion** - 动画库

### 特效和动画
- **TSParticles** - 粒子效果系统
- **Class Variance Authority** - 条件样式管理
- **Tailwind Merge** - 样式合并工具

## 📦 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 配置必要的环境变量（如 RPC 端点、合约地址等）

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm run start
```

## 🏗 项目架构

```
token_bank/
├── app/                          # Next.js App Router
│   ├── components/               # 页面级组件
│   ├── hooks/                    # 自定义 React Hooks
│   ├── nft-marketplace/          # NFT 市场页面
│   ├── permit-token-bank/        # Permit 签名存款页面
│   └── mint-nft/                 # NFT 铸造页面
├── components/                   # 可复用组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── navigation/               # 导航组件
│   └── nft/                      # NFT 相关组件
├── config/                       # 配置文件
├── lib/                          # 工具函数
└── public/                       # 静态资源
```

## 🔧 核心 Hooks

- **usePermitTokenBank** - Permit 签名存款功能
- **useERC20Transfer** - ERC20 代币转账
- **useERC20Info** - 代币信息查询
- **useNFTMarket** - NFT 市场操作
- **useNFTMint** - NFT 铸造功能

## 🎨 设计系统

项目采用 Safe.global 风格的设计系统：
- **深色主题** - 专业的深色配色方案
- **绿色渐变** - Safe 品牌色的渐变效果
- **动画效果** - 流畅的过渡和交互动画
- **响应式布局** - 适配各种屏幕尺寸

## 🚀 性能优化

- **组件拆分** - 模块化架构，编译速度提升 91%
- **增量编译** - 支持单组件修改的增量编译
- **代码分割** - 按需加载，优化首屏性能
- **类型安全** - 完整的 TypeScript 类型支持

## 📝 开发说明

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件采用函数式编程风格
- 使用自定义 Hooks 管理状态逻辑

### 合约交互
- 使用 Wagmi 和 Viem 进行合约交互
- 支持多种钱包连接方式
- 完整的错误处理和加载状态管理
- 实时数据同步和更新

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

本项目采用 MIT 许可证。
