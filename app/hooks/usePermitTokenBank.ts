import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSignTypedData } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/config'
import { parseUnits, formatUnits, getAddress } from 'viem'
import { CONTRACT_ADDRESSES } from '@/app/contracts/addresses'
import permitTokenBankAbi from '@/app/contracts/abis/permitTokenBank.json'
import permitERC20Abi from '@/app/contracts/abis/PermitERC20.json'

export function usePermitTokenBank() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signTypedDataAsync } = useSignTypedData()
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 读取用户在 PermitTokenBank 中的余额
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK,
    abi: permitTokenBankAbi,
    functionName: 'balances',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // 读取代币信息
  const { data: tokenDecimals, isLoading: isDecimalsLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.PERMIT_ERC20,
    abi: permitERC20Abi,
    functionName: 'decimals',
  })

  const { data: nonces, isLoading: isNoncesLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.PERMIT_ERC20,
    abi: permitERC20Abi,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: domainSeparator, isLoading: isDomainSeparatorLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.PERMIT_ERC20,
    abi: permitERC20Abi,
    functionName: 'DOMAIN_SEPARATOR',
  })

  // 写入合约
  const { 
    writeContract, 
    data: hash, 
    error: writeError,
    isPending: isWritePending 
  } = useWriteContract()

  // 等待交易确认
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash,
  })

  // 更新余额
  useEffect(() => {
    if (balanceData && tokenDecimals) {
      const formattedBalance = formatUnits(balanceData as bigint, tokenDecimals as number)
      setBalance(formattedBalance)
    }
  }, [balanceData, tokenDecimals])

  // 检查合约数据是否加载完成
  const isContractDataLoading = isDecimalsLoading || isNoncesLoading || isDomainSeparatorLoading
  const isContractDataReady = !!(address && nonces !== undefined && domainSeparator && tokenDecimals !== undefined)

  // 生成 EIP-712 签名
  const generatePermitSignature = useCallback(async (
    amount: string,
    deadline: bigint
  ) => {
    if (!address) {
      throw new Error('请先连接钱包')
    }
    
    if (!isContractDataReady) {
      throw new Error('合约数据加载中，请稍后重试')
    }
    
    if (nonces === undefined || !domainSeparator || tokenDecimals === undefined) {
      throw new Error('无法获取合约信息，请检查网络连接')
    }

    const value = parseUnits(amount, tokenDecimals as number)
    
    // 从合约读取正确的EIP-712域配置
    let domain;
    try {
      // 尝试从合约读取eip712Domain
      const domainData = await readContract(config, {
        address: CONTRACT_ADDRESSES.PERMIT_ERC20,
        abi: permitERC20Abi,
        functionName: 'eip712Domain',
      }) as [string, string, string, bigint, `0x${string}`, `0x${string}`, bigint[]];
      
      const [fields, name, version, chainIdFromContract, verifyingContract, salt, extensions] = domainData;
      
      domain = {
        name,
        version,
        chainId: chainId, // 使用当前链的chainId
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      };
      
      console.log('从合约读取的域配置 (signAndDeposit):', domain);
    } catch (error) {
      console.warn('无法从合约读取eip712Domain，使用默认配置 (signAndDeposit):', error);
      // 回退到默认配置
      domain = {
        name: 'MyToken',
        version: '1',
        chainId: chainId,
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      };
    }

    // EIP-712 类型
    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    }

    // 消息数据 - 将BigInt转换为字符串以避免序列化错误
    const message = {
      owner: getAddress(address),
      spender: getAddress(CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK),
      value: value.toString(),
      nonce: (nonces as bigint).toString(),
      deadline: deadline.toString(),
    }

    // EIP-712 签名数据
    const typedData = {
      domain,
      types,
      primaryType: 'Permit',
      message
    }

    try {
      // 请求用户签名
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Permit',
        message,
      })

      if (!signature) {
        throw new Error('用户取消了签名')
      }

      // 解析签名
      const sig = signature.slice(2)
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)

      return {
        v,
        r: r as `0x${string}`,
        s: s as `0x${string}`,
        value,
        deadline,
      }
    } catch (error) {
      console.error('签名失败:', error)
      throw new Error('签名失败，请重试')
    }
  }, [address, nonces, domainSeparator, tokenDecimals, isContractDataReady])

  // 执行签名存款（支持外部签名参数）
  const permitDeposit = useCallback(async (
    owner: string,
    value: string,
    deadline: string,
    v: number,
    r: string,
    s: string
  ) => {
    if (!address) {
      throw new Error('请先连接钱包')
    }

    if (!isContractDataReady) {
      throw new Error('合约数据加载中，请稍后重试')
    }

    if (!tokenDecimals) {
      throw new Error('代币信息未加载')
    }

    // 验证输入参数
    if (!owner || !value || !deadline || !r || !s) {
      throw new Error('请填写所有必要参数')
    }

    const numericValue = parseFloat(value)
    if (isNaN(numericValue) || numericValue <= 0) {
      throw new Error('请输入有效的存款金额')
    }

    // 验证deadline参数
    const deadlineNum = Number(deadline)
    if (isNaN(deadlineNum) || deadlineNum <= 0) {
      throw new Error('无效的截止时间参数')
    }

    if (deadlineNum <= Math.floor(Date.now() / 1000)) {
      throw new Error('截止时间必须在当前时间之后')
    }

    try {
      console.log('开始执行 TokenBank permitDeposit...')
      console.log('参数:', { owner, value, deadline, v, r, s })

      const valueInWei = parseUnits(value, tokenDecimals as number)
      const deadlineBigInt = BigInt(deadlineNum)

      // 调用合约的 permitDeposit 函数
      writeContract({
        address: CONTRACT_ADDRESSES.PERMIT_TOKEN_BANK,
        abi: permitTokenBankAbi,
        functionName: 'permitDeposit',
        args: [
          getAddress(owner),
          valueInWei,
          deadlineBigInt,
          v,
          r as `0x${string}`,
          s as `0x${string}`,
        ],
      })

      console.log('TokenBank permitDeposit 交易已提交')

    } catch (error) {
      console.error('TokenBank permitDeposit 失败:', error)
      throw error
    }
  }, [address, writeContract, isContractDataReady, tokenDecimals])

  // 获取余额
  const getBalance = useCallback(async () => {
    await refetchBalance()
  }, [refetchBalance])

  // 监听交易状态变化
  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false)
      // 刷新余额
      refetchBalance()
      console.log('签名存款成功！')
    }
  }, [isConfirmed, refetchBalance])

  useEffect(() => {
    if (writeError || confirmError) {
      setError(writeError || confirmError)
      setIsLoading(false)
    }
  }, [writeError, confirmError])

  // 手动生成 permit 签名
  const generateManualPermitSignature = useCallback(async (
    owner: string,
    spender: string,
    value: string,
    deadline: string,
    onSuccess?: (params: {
      owner: string;
      spender: string;
      value: string;
      deadline: string;
      v: number;
      r: string;
      s: string;
    }) => void
  ) => {
    if (!address) {
      throw new Error('请先连接钱包')
    }
    
    if (!isContractDataReady) {
      throw new Error('合约数据加载中，请稍后重试')
    }
    
    if (nonces === undefined || !domainSeparator || tokenDecimals === undefined) {
      throw new Error('无法获取合约信息，请检查网络连接')
    }

    // 验证owner地址与当前连接的钱包地址是否一致
    if (getAddress(owner) !== getAddress(address)) {
      throw new Error(`Owner地址必须与当前连接的钱包地址一致。\n当前钱包: ${address}\n输入的Owner: ${owner}`)
    }

    const valueInWei = parseUnits(value, tokenDecimals as number)
    
    // 验证deadline参数
    const deadlineNum = Number(deadline)
    if (isNaN(deadlineNum) || deadlineNum <= 0) {
      throw new Error('无效的截止时间参数')
    }
    
    const deadlineBigInt = BigInt(deadlineNum)
    
    // 从合约读取正确的EIP-712域配置
    let domain;
    try {
      // 尝试从合约读取eip712Domain
      const domainData = await readContract(config, {
        address: CONTRACT_ADDRESSES.PERMIT_ERC20,
        abi: permitERC20Abi,
        functionName: 'eip712Domain',
      }) as [string, string, string, bigint, `0x${string}`, `0x${string}`, bigint[]];
      
      const [fields, name, version, chainIdFromContract, verifyingContract, salt, extensions] = domainData;
      
      domain = {
        name,
        version,
        chainId: chainId, // 使用当前链的chainId
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      };
      
      console.log('从合约读取的域配置:', domain);
    } catch (error) {
      console.warn('无法从合约读取eip712Domain，使用默认配置:', error);
      // 如果读取失败，使用默认配置
      domain = {
        name: 'MyToken',
        version: '1',
        chainId: chainId,
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      };
    }
    
    // 调试信息：打印签名域配置
    console.log('=== EIP-712 签名域配置调试 ===');
    console.log('Domain:', domain);
    console.log('Current chainId:', chainId);
    console.log('Contract address:', CONTRACT_ADDRESSES.PERMIT_ERC20);
    console.log('Current wallet address:', address);
    console.log('Owner address:', owner);
    console.log('Spender address:', spender);
    console.log('Value:', value);
    console.log('Deadline:', deadline);
    console.log('Nonce:', nonces?.toString());
    console.log('================================');

    // EIP-712 类型
    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    }

    // 消息数据 - 将BigInt转换为字符串以避免序列化错误
    const message = {
      owner: getAddress(owner),
      spender: getAddress(spender),
      value: valueInWei.toString(),
      nonce: (nonces as bigint).toString(),
      deadline: deadlineBigInt.toString(),
    }

    // EIP-712 签名数据
    const typedData = {
      domain,
      types,
      primaryType: 'Permit',
      message
    }

    try {
      // 请求用户签名
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Permit',
        message,
      })

      if (!signature) {
        throw new Error('用户取消了签名')
      }

      // 解析签名
      const sig = signature.slice(2)
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)

      const result = {
        v,
        r: r as `0x${string}`,
        s: s as `0x${string}`,
        value: valueInWei,
        deadline: deadlineBigInt,
        nonce: nonces as bigint,
      }

      // 调用成功回调，自动复制参数到调用Permit表单
      if (onSuccess) {
        onSuccess({
          owner,
          spender,
          value,
          deadline,
          v,
          r,
          s,
        })
      }

      return result
    } catch (error) {
      console.error('手动签名失败:', error)
      throw new Error('签名失败，请重试')
    }
  }, [address, nonces, domainSeparator, tokenDecimals, isContractDataReady, chainId])

  // 手动调用 permit 函数
  const callManualPermit = useCallback(async (
    owner: string,
    spender: string,
    value: string,
    deadline: string,
    v: number,
    r: string,
    s: string
  ) => {
    if (!address) {
      throw new Error('请先连接钱包')
    }
    
    if (!tokenDecimals) {
      throw new Error('代币信息未加载')
    }

    // 注意：permit函数可以由任何人调用，不需要是token owner
    // 只要提供正确的签名参数即可

    const valueInWei = parseUnits(value, tokenDecimals as number)
    
    // 验证deadline参数
    const deadlineNum = Number(deadline)
    if (isNaN(deadlineNum) || deadlineNum <= 0) {
      throw new Error('无效的截止时间参数')
    }
    
    const deadlineBigInt = BigInt(deadlineNum)

    try {
      // 调用 ERC20 token 的 permit 函数
      writeContract({
        address: CONTRACT_ADDRESSES.PERMIT_ERC20,
        abi: permitERC20Abi,
        functionName: 'permit',
        args: [
          getAddress(owner),
          getAddress(spender),
          valueInWei,
          deadlineBigInt,
          v,
          r as `0x${string}`,
          s as `0x${string}`,
        ],
      })
    } catch (error) {
      console.error('调用 permit 失败:', error)
      throw error
    }
  }, [writeContract, tokenDecimals])

  // 生成 TokenBank 授权签名
  const generateBankSignature = useCallback(async (
    owner: string,
    spender: string,
    value: string,
    deadline: string
  ) => {
    if (!address) {
      throw new Error('请先连接钱包')
    }
    
    if (!isContractDataReady) {
      throw new Error('合约数据加载中，请稍后重试')
    }
    
    if (nonces === undefined || !domainSeparator || tokenDecimals === undefined) {
      throw new Error('无法获取合约信息，请检查网络连接')
    }

    // 验证owner地址与当前连接的钱包地址是否一致
    if (getAddress(owner) !== getAddress(address)) {
      throw new Error(`Owner地址必须与当前连接的钱包地址一致。\n当前钱包: ${address}\n输入的Owner: ${owner}`)
    }

    const valueInWei = parseUnits(value, tokenDecimals as number)
    
    // 验证deadline参数
    const deadlineNum = Number(deadline)
    if (isNaN(deadlineNum) || deadlineNum <= 0) {
      throw new Error('无效的截止时间参数')
    }
    
    const deadlineBigInt = BigInt(deadlineNum)

    let domain
    try {
      // 动态读取EIP-712域配置
      const domainData = await readContract(config, {
        address: CONTRACT_ADDRESSES.PERMIT_ERC20,
        abi: permitERC20Abi,
        functionName: 'eip712Domain',
      })
      
      const [fields, name, version, chainIdFromContract, verifyingContract, salt, extensions] = domainData as readonly [string, string, string, bigint, string, string, readonly bigint[]]
      
      domain = {
        name,
        version,
        chainId: chainId,
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      }
      
      console.log('TokenBank签名使用的域配置:', domain)
    } catch (error) {
      console.warn('无法读取域配置，使用默认配置:', error)
      domain = {
        name: 'PermitToken',
        version: '1',
        chainId: chainId,
        verifyingContract: getAddress(CONTRACT_ADDRESSES.PERMIT_ERC20),
      }
    }

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    }

    // 消息数据 - 将BigInt转换为字符串以避免序列化错误
    const message = {
      owner: getAddress(owner),
      spender: getAddress(spender),
      value: valueInWei.toString(),
      nonce: (nonces as bigint).toString(),
      deadline: deadlineBigInt.toString(),
    }

    try {
      console.log('开始生成 TokenBank 授权签名...')
      console.log('签名参数:', { owner, spender, value, deadline })
      
      // 请求用户签名
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Permit',
        message,
      })

      if (!signature) {
        throw new Error('用户取消了签名')
      }

      // 解析签名
      const sig = signature.slice(2)
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)


      return {
        v,
        r: r as `0x${string}`,
        s: s as `0x${string}`,
        value: valueInWei,
        deadline: deadlineBigInt,
        nonce: nonces as bigint
      }
    } catch (error) {
      console.error('TokenBank 授权签名失败:', error)
      throw error
    }
  }, [address, nonces, domainSeparator, tokenDecimals, isContractDataReady, chainId, signTypedDataAsync])

  return {
    // 状态
    balance,
    isLoading,
    error,
    
    // 合约数据状态
    isContractDataLoading,
    isContractDataReady,
    nonces,
    tokenDecimals,
    domainSeparator,
    
    // 交易状态
    isPermitDepositLoading: isWritePending || isConfirming,
    permitDepositError: writeError || confirmError,
    isPermitDepositSuccess: isConfirmed,
    transactionHash: hash,
    
    // 方法
    permitDeposit,
    getBalance,
    generateManualPermitSignature,
    callManualPermit,
    generateBankSignature,
  }
}
