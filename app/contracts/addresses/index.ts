// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // MyToken合约地址
  MY_TOKEN: '0x304e1260f58f501b5ad37c2fb064c4ff3a3de9df' as `0x${string}`,
  
  // TokenBank合约地址
  TOKEN_BANK: '0xbb4498b24fc56157de369214b271588c401173fb' as `0x${string}`,

  // NFTMarket合约地址
  NFT_MARKET: '0x8a950fe1239daf682ed010e39660b9c4b3397ed9' as `0x${string}`,

  // MyERC721合约地址
  MY_ERC721: '0x3135e708310121e5ed78f0d4d8881ee8abe104c8' as `0x${string}`,

  // PermitTokenBank合约地址
  PERMIT_TOKEN_BANK: '0xce458dc1e0a42b6a4f529d9d416776897eb25dbf' as `0x${string}`,

  // PermitERC20合约地址
  PERMIT_ERC20: '0xc88e2e568cc88940067c73a6fa2740ffe2034e79' as `0x${string}`,
} as const

// 导出类型
export type ContractAddress = typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES]
