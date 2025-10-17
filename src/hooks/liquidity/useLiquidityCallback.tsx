import { useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Token } from '../contracts/useTokens'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'

export interface LiquidityParams {
  tokenA: Token
  tokenB: Token
  amountA: string
  amountB: string
  slippage: number
}

/**
 * 🥞 PancakeSwap风格的Liquidity managementHook
 * 处理V2流动性的添加和移除操作
 */
export function useLiquidityCallback() {
  const { address } = useAccount()
  
  // 🎯 合约交互
  const { writeContract: writeApproval, data: approvalTxHash } = useWriteContract()
  const { writeContract: writeLiquidity, data: liquidityTxHash } = useWriteContract()
  
  // 🎯 Trade confirmation监听
  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess, error: approvalError } = 
    useWaitForTransactionReceipt({ hash: approvalTxHash })
  
  const { isLoading: isLiquidityLoading, isSuccess: isLiquiditySuccess, error: liquidityError } = 
    useWaitForTransactionReceipt({ hash: liquidityTxHash })

  // 🎯 获取合约地址
  const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
  const routerAddress = contracts.PLANET_ROUTER

  console.log('🔧 LiquidityCallback使用合约地址:', {
    routerAddress,
    contracts
  })

  // 🎯 执行代币授权
  const executeApproval = useCallback(async (token: Token, amount: string) => {
    if (!address || !routerAddress) {
      console.error('❌ 缺少地址信息:', { address, routerAddress })
      return false
    }

    try {
      console.log('🔐 执行代币授权:', {
        token: token.symbol,
        amount,
        spender: routerAddress
      })

      const amountWei = parseUnits(amount, token.decimals)

      writeApproval({
        address: token.address as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { type: 'address', name: 'spender' },
              { type: 'uint256', name: 'amount' }
            ],
            outputs: [{ type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [routerAddress as `0x${string}`, amountWei]
      })

      return true
    } catch (error: any) {
      console.error('❌ 授权失败:', error)
      return false
    }
  }, [address, routerAddress, writeApproval])

  // 🎯 Add liquidity
  const executeAddLiquidity = useCallback(async (params: LiquidityParams) => {
    if (!address || !routerAddress) {
      console.error('❌ 缺少地址信息:', { address, routerAddress })
      return false
    }

    try {
      console.log('💧 执行Add liquidity:', params)

      const { tokenA, tokenB, amountA, amountB, slippage } = params
      
      // 🎯 计算最小数量（考虑滑点）
      const amountAWei = parseUnits(amountA, tokenA.decimals)
      const amountBWei = parseUnits(amountB, tokenB.decimals)
      
      const slippageMultiplier = 1 - (slippage / 100)
      const amountAMin = BigInt(Math.floor(Number(amountAWei) * slippageMultiplier))
      const amountBMin = BigInt(Math.floor(Number(amountBWei) * slippageMultiplier))

      // 🎯 计算截止时间（20分钟后）
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)

      console.log('📊 流动性参数:', {
        tokenA: tokenA.address,
        tokenB: tokenB.address,
        amountADesired: amountAWei.toString(),
        amountBDesired: amountBWei.toString(),
        amountAMin: amountAMin.toString(),
        amountBMin: amountBMin.toString(),
        deadline: deadline.toString(),
        to: address
      })

      writeLiquidity({
        address: routerAddress as `0x${string}`,
        abi: [
          {
            name: 'addLiquidity',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { type: 'address', name: 'tokenA' },
              { type: 'address', name: 'tokenB' },
              { type: 'uint256', name: 'amountADesired' },
              { type: 'uint256', name: 'amountBDesired' },
              { type: 'uint256', name: 'amountAMin' },
              { type: 'uint256', name: 'amountBMin' },
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'deadline' }
            ],
            outputs: [
              { type: 'uint256', name: 'amountA' },
              { type: 'uint256', name: 'amountB' },
              { type: 'uint256', name: 'liquidity' }
            ]
          }
        ],
        functionName: 'addLiquidity',
        args: [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
          amountAWei,
          amountBWei,
          amountAMin,
          amountBMin,
          address as `0x${string}`,
          deadline
        ]
      })

      return true
    } catch (error: any) {
      console.error('❌ Add liquidity失败:', error)
      return false
    }
  }, [address, routerAddress, writeLiquidity])

  // 🎯 Remove liquidity
  const executeRemoveLiquidity = useCallback(async (
    tokenA: Token,
    tokenB: Token,
    liquidityAmount: string,
    slippage: number
  ) => {
    if (!address || !routerAddress) {
      console.error('❌ 缺少地址信息:', { address, routerAddress })
      return false
    }

    try {
      console.log('📤 执行Remove liquidity:', {
        tokenA: tokenA.symbol,
        tokenB: tokenB.symbol,
        liquidityAmount,
        slippage
      })

      // TODO: 实现Remove liquidity逻辑
      // 需要获取LP代币合约地址和余额
      
      return true
    } catch (error: any) {
      console.error('❌ Remove liquidity失败:', error)
      return false
    }
  }, [address, routerAddress])

  return {
    // 🎯 执行函数
    executeApproval,
    executeAddLiquidity,
    executeRemoveLiquidity,
    
    // 🎯 Trading state
    approvalTxHash,
    liquidityTxHash,
    isApprovalLoading,
    isApprovalSuccess,
    isLiquidityLoading,
    isLiquiditySuccess,
    approvalError,
    liquidityError,
    
    // 🎯 合约地址
    routerAddress
  }
}
