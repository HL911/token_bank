// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // MyToken合约地址
  MY_TOKEN: '0x499255FBf73AD93ba0ECaeAED0c5D7066E338781' as `0x${string}`,
  
  // TokenBank合约地址
  TOKEN_BANK: '0xbb4498b24fc56157de369214b271588c401173fb' as `0x${string}`,

  // NFTMarket合约地址（旧版本）
  NFT_MARKET_OLD: '0x1D3639015ecB705AAe899fB0163B5E264d468d6a' as `0x${string}`,
  
  // PermitNFTMarket合约地址（新版本，支持白名单购买）
  NFT_MARKET: '0x1D3639015ecB705AAe899fB0163B5E264d468d6a' as `0x${string}`,

  // MyERC721合约地址
  MY_ERC721: '0x3135e708310121e5ed78f0d4d8881ee8abe104c8' as `0x${string}`,

  // PermitTokenBank合约地址
  PERMIT_TOKEN_BANK: '0x1D3639015ecB705AAe899fB0163B5E264d468d6a' as `0x${string}`,

  // PermitERC20合约地址
  PERMIT_ERC20: '0x499255FBf73AD93ba0ECaeAED0c5D7066E338781' as `0x${string}`,
} as const

// 导出类型
export type ContractAddress = typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES]
