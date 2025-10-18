import { useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, Address } from 'viem'
import { ChainId } from '../../config/chains/chainId'
import { getContractAddresses } from '../../config/chains/contracts'
import { Token } from '../contracts/useTokens'
import { useRouterAddress, TradeInfo, RouteType } from './useRouterAddress'

// SmartRouter ABI - 从PlanetSmartRouter.json中提取关键函数
const SMART_ROUTER_ABI = [
  // V2 functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // V3 functions
  {
    "inputs": [
      {
        "components": [
          {"internalType": "address", "name": "tokenIn", "type": "address"},
          {"internalType": "address", "name": "tokenOut", "type": "address"},
          {"internalType": "uint24", "name": "fee", "type": "uint24"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
          {"internalType": "uint256", "name": "amountOutMinimum", "type": "uint256"},
          {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"}
        ],
        "internalType": "struct IV3SwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // Multi-hop V3
  {
    "inputs": [
      {
        "components": [
          {"internalType": "bytes", "name": "path", "type": "bytes"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
          {"internalType": "uint256", "name": "amountOutMinimum", "type": "uint256"}
        ],
        "internalType": "struct IV3SwapRouter.ExactInputParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInput",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // Multicall for complex routes
  {
    "inputs": [{"internalType": "bytes[]", "name": "data", "type": "bytes[]"}],
    "name": "multicall",
    "outputs": [{"internalType": "bytes[]", "name": "results", "type": "bytes[]"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const

// V2 Router ABI - 现有的简单V2功能
const V2_ROUTER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactETHForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// ERC20 Approval ABI
const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export interface SmartSwapParams {
  inputToken: Token
  outputToken: Token
  inputAmount: string
  outputAmountMin: string
  recipient: Address
  deadline: number
  slippage: number
  routeType?: RouteType
  feeTier?: number  // For V3 trades
}

/**
 * 🧠 Smart Router Swap Hook
 * 参考PancakeSwap的智能路由架构，支持V2/V3混合交易
 */
export function useSmartRouterCallback() {
  const { writeContract: writeSwap, data: swapTxHash, isPending: isSwapPending, error: swapError } = useWriteContract()
  const { writeContract: writeApproval, data: approvalTxHash, isPending: isApprovalPending, error: approvalError } = useWriteContract()
  
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapTxHash,
  })
  
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })

  // 🎯 执行代币授权
  const executeApproval = useCallback(async (token: Token, spenderAddress: Address, amount: string) => {
    console.log('🔐 Executing approval for:', token.symbol, 'Amount:', amount, 'Spender:', spenderAddress)
    
    try {
      const parsedAmount = parseUnits(amount, token.decimals)
      
      const result = await writeApproval({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, parsedAmount],
      })
      
      console.log('✅ Approval transaction sent:', result)
      return result
    } catch (error) {
      console.error('❌ Approval failed:', error)
      throw error
    }
  }, [writeApproval])

  // 🧠 智能交换执行
  const executeSmartSwap = useCallback(async (params: SmartSwapParams) => {
    console.log('🧠 Executing smart swap:', params)

    // 构建交易信息用于路由选择
    const tradeInfo: TradeInfo = {
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      routeType: params.routeType
    }

    // 🎯 智能选择Router地址
    const routerAddress = useRouterAddress(tradeInfo)
    const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
    
    const isUsingSmartRouter = routerAddress === contracts.PLANET_SMART_ROUTER
    
    try {
      if (isUsingSmartRouter) {
        return await executeSmartRouterSwap(params, routerAddress)
      } else {
        return await executeV2RouterSwap(params, routerAddress)
      }
    } catch (error) {
      console.error('❌ Smart swap failed:', error)
      throw error
    }
  }, [writeSwap])

  // 🔄 V2 Router交换
  const executeV2RouterSwap = useCallback(async (params: SmartSwapParams, routerAddress: Address) => {
    console.log('🔄 Executing V2 Router swap')
    
    const parsedAmountIn = parseUnits(params.inputAmount, params.inputToken.decimals)
    const parsedAmountOutMin = parseUnits(params.outputAmountMin, params.outputToken.decimals)
    
    // 构建V2路径
    const path = [params.inputToken.address, params.outputToken.address] as Address[]
    
    const result = await writeSwap({
      address: routerAddress,
      abi: V2_ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [
        parsedAmountIn,
        parsedAmountOutMin,
        path,
        params.recipient,
        BigInt(params.deadline)
      ],
    })
    
    console.log('✅ V2 swap transaction sent:', result)
    return result
  }, [writeSwap])

  // 🧠 SmartRouter交换
  const executeSmartRouterSwap = useCallback(async (params: SmartSwapParams, routerAddress: Address) => {
    console.log('🧠 Executing SmartRouter swap')
    
    const parsedAmountIn = parseUnits(params.inputAmount, params.inputToken.decimals)
    const parsedAmountOutMin = parseUnits(params.outputAmountMin, params.outputToken.decimals)
    
    // 根据路由类型选择执行方式
    if (params.routeType === RouteType.V3) {
      return await executeV3SingleSwap(params, routerAddress, parsedAmountIn, parsedAmountOutMin)
    } else {
      // 默认使用V2功能 (SmartRouter向下兼容)
      return await executeV2CompatibleSwap(params, routerAddress, parsedAmountIn, parsedAmountOutMin)
    }
  }, [writeSwap])

  // 🎯 V3单池交换
  const executeV3SingleSwap = useCallback(async (
    params: SmartSwapParams, 
    routerAddress: Address, 
    amountIn: bigint, 
    amountOutMin: bigint
  ) => {
    console.log('🎯 Executing V3 single swap')
    
    const v3Params = {
      tokenIn: params.inputToken.address as Address,
      tokenOut: params.outputToken.address as Address,
      fee: params.feeTier || 3000, // 默认0.3%手续费
      recipient: params.recipient,
      amountIn: amountIn,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0n // 不设价格限制
    }
    
    const result = await writeSwap({
      address: routerAddress,
      abi: SMART_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [v3Params],
    })
    
    console.log('✅ V3 swap transaction sent:', result)
    return result
  }, [writeSwap])

  // 🔄 V2兼容交换 (通过SmartRouter)
  const executeV2CompatibleSwap = useCallback(async (
    params: SmartSwapParams, 
    routerAddress: Address, 
    amountIn: bigint, 
    amountOutMin: bigint
  ) => {
    console.log('🔄 Executing V2-compatible swap via SmartRouter')
    
    const path = [params.inputToken.address, params.outputToken.address] as Address[]
    
    const result = await writeSwap({
      address: routerAddress,
      abi: SMART_ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [
        amountIn,
        amountOutMin,
        path,
        params.recipient
      ],
    })
    
    console.log('✅ V2-compatible swap transaction sent:', result)
    return result
  }, [writeSwap])

  return {
    // 🔐 授权相关
    executeApproval,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalSuccess,
    approvalTxHash,
    approvalError,
    
    // 🧠 智能交换相关
    executeSmartSwap,
    isSwapPending,
    isSwapConfirming, 
    isSwapSuccess,
    swapTxHash,
    swapError,
    
    // 📊 状态汇总
    isLoading: isApprovalPending || isSwapPending || isApprovalConfirming || isSwapConfirming,
    isSuccess: isSwapSuccess,
    error: swapError || approvalError
  }
}
