import { useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseUnits, maxUint256 } from 'viem';
import { useTokenAllowance } from './useTokens';
import ERC20ABI from '../../contracts/abis/ERC20.json';

// 🔐 授权类型
export type ApprovalType = 'exact' | 'infinite';

// 🔧 useApproval Hook
export function useApproval(tokenAddress: Address, spenderAddress: Address) {
  const { address: userAddress } = useAccount();
  
  // 📊 获取当前授权额度
  const { allowance, needsApproval, refetch: refetchAllowance } = useTokenAllowance(
    tokenAddress, 
    spenderAddress
  );

  // 📝 合约写入
  const { 
    writeContract, 
    data: hash, 
    isPending: isApprovePending,
    error: approveError 
  } = useWriteContract();

  // ⏳ 等待Trade confirmation
  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // ✅ 执行授权
  const approve = useCallback(async (
    amount: string,
    decimals: number,
    type: ApprovalType = 'infinite'
  ): Promise<void> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    let approvalAmount: bigint;

    if (type === 'infinite') {
      // 无限授权
      approvalAmount = maxUint256;
    } else {
      // 精确授权
      approvalAmount = parseUnits(amount, decimals);
    }

    await writeContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spenderAddress, approvalAmount],
    });
  }, [writeContract, tokenAddress, spenderAddress, userAddress]);

  // 🔄 撤销授权
  const revoke = useCallback(async (): Promise<void> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    await writeContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spenderAddress, BigInt(0)],
    });
  }, [writeContract, tokenAddress, spenderAddress, userAddress]);

  // 🔍 Check if approval is needed
  const checkNeedsApproval = useCallback((amount: string, decimals: number): boolean => {
    return needsApproval(amount, decimals);
  }, [needsApproval]);

  return {
    // 状态
    allowance,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    approveError,

    // 方法
    approve,
    revoke,
    checkNeedsApproval,
    refetchAllowance,
  };
}

// 🔧 useMultiApproval Hook - 批量授权多个代币
export function useMultiApproval() {
  const { address: userAddress } = useAccount();
  
  const { 
    writeContract, 
    data: hash, 
    isPending,
    error 
  } = useWriteContract();

  // 📊 批量授权状态
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // ✅ 批量授权函数
  const approveMultiple = useCallback(async (
    approvals: Array<{
      tokenAddress: Address;
      spenderAddress: Address;
      amount?: string;
      decimals?: number;
      type?: ApprovalType;
    }>
  ): Promise<void> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // 注意：这里需要使用Multicall合约来批量执行
    // 暂时先抛出错误，提醒需要实现
    throw new Error('Batch approval not yet implemented');
  }, [userAddress]);

  return {
    // 状态
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,

    // 方法
    approveMultiple,
  };
}

// 🛠️ 工具函数：检查授权状态
export function getApprovalStatus(
  allowance: bigint | undefined,
  amount: string,
  decimals: number
): 'approved' | 'insufficient' | 'unknown' {
  if (!allowance) return 'unknown';
  
  try {
    const amountBigInt = parseUnits(amount, decimals);
    return allowance >= amountBigInt ? 'approved' : 'insufficient';
  } catch {
    return 'unknown';
  }
}

// 🛠️ 工具函数：格式化授权额度
export function formatAllowance(
  allowance: bigint | undefined,
  decimals: number,
  symbol: string
): string {
  if (!allowance) return 'Unknown';
  
  if (allowance === maxUint256) {
    return `Unlimited ${symbol}`;
  }
  
  if (allowance === BigInt(0)) {
    return `No ${symbol} approved`;
  }
  
  // 如果额度很大，显示为 "Large amount"
  const threshold = parseUnits('1000000', decimals); // 100万
  if (allowance > threshold) {
    return `Large amount of ${symbol}`;
  }
  
  // 否则显示具体数量
  const formatted = parseFloat(allowance.toString()) / Math.pow(10, decimals);
  return `${formatted.toFixed(4)} ${symbol}`;
}
