/**
 * 🧠 Swap Callback Hook - Based on PancakeSwap architecture
 * Handles wallet interaction and transaction execution
 */

import { useCallback, useMemo } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi'
import { parseUnits, Address, encodeFunctionData } from 'viem'
import { Token } from '../contracts/useTokens'
import { useRouterAddress, TradeInfo, RouteType } from './useRouterAddress'

export enum SwapCallbackState {
  INVALID = 'INVALID',
  LOADING = 'LOADING', 
  VALID = 'VALID',
  REVERTED = 'REVERTED',
}

export interface SwapCallbackParams {
  inputToken: Token | null
  outputToken: Token | null
  inputAmount: string
  outputAmountMin: string
  recipient: Address
  deadline: number
  routeType?: RouteType
  feeTier?: number
  path?: Address[]  // 🔄 完整的多跳路径
}

interface UseSwapCallbackReturns {
  state: SwapCallbackState
  callback?: () => Promise<{ hash: Address }>
  error?: string
  isLoading: boolean
}

// Router ABIs
const V2_ROUTER_ABI = [
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

const V3_ROUTER_ABI = [
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
  }
] as const

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

/**
 * 🎯 Main Swap Callback Hook - PancakeSwap Style
 */
export function useSwapCallback(params: SwapCallbackParams): UseSwapCallbackReturns {
  console.log('🔍 [ENTRY] useSwapCallback called!')
  
  // React hooks must be called at top level
  const { address: account, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  
  console.log('🔍 useSwapCallback hooks initialized:', {
    account,
    isConnected,
    hasSendTransaction: !!sendTransactionAsync
  })
  
  console.log('🔍 useSwapCallback params:', {
    hasInputToken: !!params?.inputToken,
    hasOutputToken: !!params?.outputToken,
    inputAmount: params?.inputAmount,
    recipient: params?.recipient
  })
  
  // Build trade info for router selection
  const tradeInfo = useMemo<TradeInfo | undefined>(() => {
    console.log('🔍 Building tradeInfo:', {
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      hasInputAmount: !!params.inputAmount,
      routeType: params.routeType
    })
    
    if (!params.inputToken || !params.outputToken || !params.inputAmount) {
      console.log('❌ tradeInfo: Missing required parameters')
      return undefined
    }
    
    const info = {
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      routeType: params.routeType
    }
    
    console.log('✅ tradeInfo created:', info)
    return info
  }, [params.inputToken, params.outputToken, params.inputAmount, params.routeType])
  
  // Get router address (called at top level)
  const routerAddress = useRouterAddress(tradeInfo)
  
  console.log('🔍 routerAddress from useRouterAddress:', routerAddress)
  
  // Build swap transaction data
  const swapCall = useMemo(() => {
    console.log('🔍 Building swapCall:', {
      hasTradeInfo: !!tradeInfo,
      routerAddress,
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      routeType: params.routeType
    })
    
    if (!tradeInfo || !routerAddress || !params.inputToken || !params.outputToken) {
      console.log('❌ Missing required parameters for swapCall')
      return null
    }
    
    try {
      const parsedAmountIn = parseUnits(params.inputAmount, params.inputToken.decimals)
      const parsedAmountOutMin = parseUnits(params.outputAmountMin, params.outputToken.decimals)
      
      if (params.routeType === RouteType.V3) {
        // V3 swap
        const v3Params = {
          tokenIn: params.inputToken.address as Address,
          tokenOut: params.outputToken.address as Address,
          fee: params.feeTier || 3000,
          recipient: params.recipient,
          amountIn: parsedAmountIn,
          amountOutMinimum: parsedAmountOutMin,
          sqrtPriceLimitX96: 0n
        }
        
        const calldata = encodeFunctionData({
          abi: V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [v3Params]
        })
        
        return {
          to: routerAddress,
          data: calldata,
          value: 0n
        }
      } else {
        // V2 swap or Smart Router
        // 🔄 使用传入的完整路径，或者默认直接路径
        const path = params.path || [params.inputToken.address, params.outputToken.address] as Address[]
        
        console.log('🔍 使用路径:', {
          hasCustomPath: !!params.path,
          pathLength: path.length,
          path: path.map((addr, i) => `${i}: ${addr}`),
          isMultiHop: path.length > 2
        })
        
        // 🧠 智能判断：如果是Smart Router，使用兼容的V2函数调用
        // Smart Router通常支持V2的标准接口
        const calldata = encodeFunctionData({
          abi: V2_ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [
            parsedAmountIn,
            parsedAmountOutMin,
            path,
            params.recipient,
            BigInt(params.deadline)
          ]
        })
        
        console.log('🔍 V2/Smart Router call details:', {
          router: routerAddress,
          function: 'swapExactTokensForTokens',
          amountIn: parsedAmountIn.toString(),
          amountOutMin: parsedAmountOutMin.toString(),
          path: path.map((addr, i) => `${i}: ${addr.slice(0,6)}...${addr.slice(-4)}`),
          pathLength: path.length,
          isMultiHop: path.length > 2,
          recipient: params.recipient,
          deadline: params.deadline
        })
        
        return {
          to: routerAddress,
          data: calldata,
          value: 0n
        }
      }
    } catch (error) {
      console.error('❌ Failed to build swap call:', error)
      return null
    }
  }, [tradeInfo, routerAddress, params])
  
  // Main swap callback
  const callback = useCallback(async () => {
    if (!swapCall || !sendTransactionAsync) {
      throw new Error('Missing swap parameters')
    }
    
    console.log('🚀 Executing swap transaction:', swapCall)
    
    const result = await sendTransactionAsync({
      to: swapCall.to,
      data: swapCall.data,
      value: swapCall.value
    })
    
    console.log('✅ Swap transaction sent:', result)
    return { hash: result }
  }, [swapCall, sendTransactionAsync])
  
  // Determine callback state
  const state = useMemo(() => {
    console.log('🔍 [START] useSwapCallback state calculation')
    console.log('🔍 useSwapCallback state check:', {
      isConnected,
      account,
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      hasInputAmount: !!params.inputAmount,
      hasSwapCall: !!swapCall,
      routerAddress
    })
    
    let result
    
    if (!isConnected || !account) {
      console.log('❌ Wallet not connected or no account')
      result = SwapCallbackState.INVALID
    } else if (!params.inputToken || !params.outputToken || !params.inputAmount) {
      console.log('❌ Missing token or amount parameters')
      result = SwapCallbackState.INVALID
    } else if (!swapCall) {
      console.log('⏳ SwapCall not ready, loading...')
      result = SwapCallbackState.LOADING
    } else {
      console.log('✅ SwapCallback state: VALID')
      result = SwapCallbackState.VALID
    }
    
    console.log('🔍 [END] State calculation result:', result)
    return result
  }, [isConnected, account, params, swapCall, routerAddress])
  
  // 🔧 Debug: Force state to see what's happening
  const stateString = state ? state.toString() : 'undefined_state'
  
  try {
    const result = {
      state: stateString,
      callback: state === SwapCallbackState.VALID ? callback : undefined,
      isLoading: state === SwapCallbackState.LOADING,
      error: state === SwapCallbackState.INVALID ? 'Invalid swap parameters' : undefined
    }
    
    console.log('🔍 useSwapCallback returning:', {
      state: result.state,
      hasCallback: !!result.callback,
      isLoading: result.isLoading,
      error: result.error
    })
    
    return result
  } catch (error) {
    console.error('❌ Error in useSwapCallback final return:', error)
    return {
      state: 'INVALID',
      callback: undefined,
      isLoading: false,
      error: 'Hook execution failed'
    }
  }
}

/**
 * 🔐 Token Approval Hook
 */
export function useTokenApproval() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  const approve = useCallback(async (token: Token, spender: Address, amount: string) => {
    const parsedAmount = parseUnits(amount, token.decimals)
    
    console.log('🔐 Approving token:', token.symbol, 'Amount:', amount, 'Spender:', spender)
    
    return await writeContract({
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, parsedAmount],
    })
  }, [writeContract])
  
  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
    isLoading: isPending || isConfirming
  }
}
      console.log('❌ tradeInfo: Missing required parameters')
      return undefined
    }
    
    const info = {
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      routeType: params.routeType
    }
    
    console.log('✅ tradeInfo created:', info)
    return info
  }, [params.inputToken, params.outputToken, params.inputAmount, params.routeType])
  
  // Get router address (called at top level)
  const routerAddress = useRouterAddress(tradeInfo)
  
  console.log('🔍 routerAddress from useRouterAddress:', routerAddress)
  
  // Build swap transaction data
  const swapCall = useMemo(() => {
    console.log('🔍 Building swapCall:', {
      hasTradeInfo: !!tradeInfo,
      routerAddress,
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      routeType: params.routeType
    })
    
    if (!tradeInfo || !routerAddress || !params.inputToken || !params.outputToken) {
      console.log('❌ Missing required parameters for swapCall')
      return null
    }
    
    try {
      const parsedAmountIn = parseUnits(params.inputAmount, params.inputToken.decimals)
      const parsedAmountOutMin = parseUnits(params.outputAmountMin, params.outputToken.decimals)
      
      if (params.routeType === RouteType.V3) {
        // V3 swap
        const v3Params = {
          tokenIn: params.inputToken.address as Address,
          tokenOut: params.outputToken.address as Address,
          fee: params.feeTier || 3000,
          recipient: params.recipient,
          amountIn: parsedAmountIn,
          amountOutMinimum: parsedAmountOutMin,
          sqrtPriceLimitX96: 0n
        }
        
        const calldata = encodeFunctionData({
          abi: V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [v3Params]
        })
        
        return {
          to: routerAddress,
          data: calldata,
          value: 0n
        }
      } else {
        // V2 swap or Smart Router
        // 🔄 使用传入的完整路径，或者默认直接路径
        const path = params.path || [params.inputToken.address, params.outputToken.address] as Address[]
        
        console.log('🔍 使用路径:', {
          hasCustomPath: !!params.path,
          pathLength: path.length,
          path: path.map((addr, i) => `${i}: ${addr}`),
          isMultiHop: path.length > 2
        })
        
        // 🧠 智能判断：如果是Smart Router，使用兼容的V2函数调用
        // Smart Router通常支持V2的标准接口
        const calldata = encodeFunctionData({
          abi: V2_ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [
            parsedAmountIn,
            parsedAmountOutMin,
            path,
            params.recipient,
            BigInt(params.deadline)
          ]
        })
        
        console.log('🔍 V2/Smart Router call details:', {
          router: routerAddress,
          function: 'swapExactTokensForTokens',
          amountIn: parsedAmountIn.toString(),
          amountOutMin: parsedAmountOutMin.toString(),
          path: path.map((addr, i) => `${i}: ${addr.slice(0,6)}...${addr.slice(-4)}`),
          pathLength: path.length,
          isMultiHop: path.length > 2,
          recipient: params.recipient,
          deadline: params.deadline
        })
        
        return {
          to: routerAddress,
          data: calldata,
          value: 0n
        }
      }
    } catch (error) {
      console.error('❌ Failed to build swap call:', error)
      return null
    }
  }, [tradeInfo, routerAddress, params])
  
  // Main swap callback
  const callback = useCallback(async () => {
    if (!swapCall || !sendTransactionAsync) {
      throw new Error('Missing swap parameters')
    }
    
    console.log('🚀 Executing swap transaction:', swapCall)
    
    const result = await sendTransactionAsync({
      to: swapCall.to,
      data: swapCall.data,
      value: swapCall.value
    })
    
    console.log('✅ Swap transaction sent:', result)
    return { hash: result }
  }, [swapCall, sendTransactionAsync])
  
  // Determine callback state
  const state = useMemo(() => {
    console.log('🔍 [START] useSwapCallback state calculation')
    console.log('🔍 useSwapCallback state check:', {
      isConnected,
      account,
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      hasInputAmount: !!params.inputAmount,
      hasSwapCall: !!swapCall,
      routerAddress
    })
    
    let result
    
    if (!isConnected || !account) {
      console.log('❌ Wallet not connected or no account')
      result = SwapCallbackState.INVALID
    } else if (!params.inputToken || !params.outputToken || !params.inputAmount) {
      console.log('❌ Missing token or amount parameters')
      result = SwapCallbackState.INVALID
    } else if (!swapCall) {
      console.log('⏳ SwapCall not ready, loading...')
      result = SwapCallbackState.LOADING
    } else {
      console.log('✅ SwapCallback state: VALID')
      result = SwapCallbackState.VALID
    }
    
    console.log('🔍 [END] State calculation result:', result)
    return result
  }, [isConnected, account, params, swapCall, routerAddress])
  
  // 🔧 Debug: Force state to see what's happening
  const stateString = state ? state.toString() : 'undefined_state'
  
  try {
    const result = {
      state: stateString,
      callback: state === SwapCallbackState.VALID ? callback : undefined,
      isLoading: state === SwapCallbackState.LOADING,
      error: state === SwapCallbackState.INVALID ? 'Invalid swap parameters' : undefined
    }
    
    console.log('🔍 useSwapCallback returning:', {
      state: result.state,
      hasCallback: !!result.callback,
      isLoading: result.isLoading,
      error: result.error
    })
    
    return result
  } catch (error) {
    console.error('❌ Error in useSwapCallback final return:', error)
    return {
      state: 'INVALID',
      callback: undefined,
      isLoading: false,
      error: 'Hook execution failed'
    }
  }
}

/**
 * 🔐 Token Approval Hook
 */
export function useTokenApproval() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  const approve = useCallback(async (token: Token, spender: Address, amount: string) => {
    const parsedAmount = parseUnits(amount, token.decimals)
    
    console.log('🔐 Approving token:', token.symbol, 'Amount:', amount, 'Spender:', spender)
    
    return await writeContract({
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, parsedAmount],
    })
  }, [writeContract])
  
  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
    isLoading: isPending || isConfirming
  }
}
export function useSwapCallback(): {
  callbacks: SwapCallbacks
  state: {
    isLoading: boolean
    hash: Address | undefined
    isSuccess: boolean
    error: Error | null
  }
} {
  const { address: account } = useAccount()
  const contracts = getCurrentContracts()

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error,
  } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // 🔄 ETH → Token swap
  const swapExactETHForTokens = useCallback(
    (params: Omit<SwapParameters, 'path'> & { path: Address[] }) => {
      if (!account) return

      writeContract({
        address: contracts.PLANET_ROUTER as Address,
        abi: PlanetRouterABI,
        functionName: 'swapExactETHForTokens',
        args: [params.amountOutMin, params.path, params.to, params.deadline],
        value: parseUnits(params.amountIn, 18), // ETH是18位小数
      })
    },
    [account, contracts.PLANET_ROUTER, writeContract]
  )

  // 🔄 Token → ETH swap  
  const swapExactTokensForETH = useCallback(
    (params: SwapParameters) => {
      if (!account) return

      writeContract({
        address: contracts.PLANET_ROUTER as Address,
        abi: PlanetRouterABI,
        functionName: 'swapExactTokensForETH',
        args: [
          parseUnits(params.amountIn, 18), // 假设是18位小数，实际需要根据token调整
          params.amountOutMin,
          params.path,
          params.to,
          params.deadline,
        ],
      })
    },
    [account, contracts.PLANET_ROUTER, writeContract]
  )

  // 🔄 Token → Token swap
  const swapExactTokensForTokens = useCallback(
    (params: SwapParameters) => {
      if (!account) return

      writeContract({
        address: contracts.PLANET_ROUTER as Address,
        abi: PlanetRouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          parseUnits(params.amountIn, 18), // 假设是18位小数，实际需要根据token调整
          params.amountOutMin,
          params.path,
          params.to,
          params.deadline,
        ],
      })
    },
    [account, contracts.PLANET_ROUTER, writeContract]
  )

  const callbacks = useMemo(
    () => ({
      swapExactETHForTokens,
      swapExactTokensForETH,
      swapExactTokensForTokens,
    }),
    [swapExactETHForTokens, swapExactTokensForETH, swapExactTokensForTokens]
  )

  return {
    callbacks,
    state: {
      isLoading,
      hash,
      isSuccess,
      error,
    },
  }
}
