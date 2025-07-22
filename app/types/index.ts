// Token银行应用的类型定义
export interface WalletInfo {
  address: string;
  isConnected: boolean;
  chainId: number;
}

// Token信息接口
export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  address: string;
}

// 交易记录接口
export interface Transaction {
  hash: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: string;
  token: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

// 存款参数接口
export interface DepositParams {
  amount: string;
  tokenAddress: string;
}

// 取款参数接口
export interface WithdrawParams {
  amount: string;
  tokenAddress: string;
}

// 转账参数接口
export interface TransferParams {
  to: string;
  amount: string;
  tokenAddress: string;
}

// 查询参数接口
export interface QueryParams {
  address?: string;
  tokenAddress?: string;
  transactionHash?: string;
}
