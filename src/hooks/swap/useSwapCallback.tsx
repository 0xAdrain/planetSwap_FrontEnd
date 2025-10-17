import { useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, Address } from 'viem'
import { ChainId } from '../../config/chains/chainId'
import { getContractAddresses } from '../../config/chains/contracts'
import { Token } from '../contracts/useTokens'

// PlanetRouter ABI - 只包含需要的swap函数
const PLANET_ROUTER_ABI = [
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
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForETH",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// ERC20 Token Approval ABI
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
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export interface SwapParams {
  inputToken: Token
  outputToken: Token
  inputAmount: string
  outputAmountMin: string
  recipient: Address
  deadline: number
  slippage: number
}

/**
 * 🥞 完全参照PancakeSwap的Swap执行逻辑
 */
export function useSwapCallback() {
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
    console.log('💰 执行代币授权:', {
      token: token.symbol,
      spender: spenderAddress,
      amount
    })

    // 🔧 只授权需要的金额，避免过度授权
    const amountWei = parseUnits(amount, token.decimals)
    console.log('📊 授权金额:', {
      amount,
      amountWei: amountWei.toString(),
      decimals: token.decimals
    })

    return writeApproval({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountWei],
    })
  }, [writeApproval])

  // 🎯 执行Swap交易 - 完全参照PancakeSwap逻辑
  const executeSwap = useCallback(async (params: SwapParams) => {
    const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
    const routerAddress = contracts.PLANET_ROUTER as Address
    const wethAddress = contracts.WETH as Address
    
    console.log('🔧 使用配置文件的合约地址:', {
      routerAddress,
      wethAddress,
      contracts
    })

    console.log('🔥 执行Swap交易:', {
      inputToken: params.inputToken.symbol,
      outputToken: params.outputToken.symbol,
      inputAmount: params.inputAmount,
      outputAmountMin: params.outputAmountMin,
      router: routerAddress,
      weth: wethAddress
    })

    // 🎯 计算交易路径 - 修复版本
    const getSwapPath = (input: Token, output: Token): Address[] => {
      console.log('🛣️ 计算交易路径:', {
        inputSymbol: input.symbol,
        inputAddress: input.address,
        inputIsNative: input.isNative,
        outputSymbol: output.symbol,
        outputAddress: output.address,
        outputIsNative: output.isNative,
        wethAddress
      })

      // 如果是原生代币到ERC20代币  
      if (input.isNative && !output.isNative) {
        const path = [wethAddress, output.address]
        console.log('📍 原生代币→ERC20路径:', path)
        return path
      }
      
      // 如果是ERC20代币到原生代币
      if (!input.isNative && output.isNative) {
        const path = [input.address, wethAddress]
        console.log('📍 ERC20→原生代币路径:', path)
        return path
      }
      
      // 如果都是ERC20代币
      if (!input.isNative && !output.isNative) {
        // 检查是否存在直接交易对
        const directPairs = [
          { token0: 'mWOKB', token1: 'mUSDT' },
          { token0: 'mWOKB', token1: 'mUSDC' },
          { token0: 'mUSDT', token1: 'mUSDC' },
          { token0: 'mWOKB', token1: 'mETH' }
        ]

        const hasDirectPair = directPairs.some(pair => 
          (pair.token0 === input.symbol && pair.token1 === output.symbol) ||
          (pair.token1 === input.symbol && pair.token0 === output.symbol)
        )

        if (hasDirectPair) {
          const path = [input.address, output.address]
          console.log('📍 直接交易路径:', path)
          return path
        }

        // 如果其中一个是mWOKB (作为基础代币)
        if (input.symbol === 'mWOKB' || output.symbol === 'mWOKB') {
          const path = [input.address, output.address]
          console.log('📍 基础代币直接路径:', path)
          return path
        }
        
        // 否则通过mWOKB中转
        const path = [input.address, wethAddress, output.address]
        console.log('📍 通过mWOKB中转路径:', path)
        return path
      }
      
      // 默认直接路径
      const path = [input.address, output.address]
      console.log('📍 默认直接路径:', path)
      return path
    }

    const path = getSwapPath(params.inputToken, params.outputToken)
    const deadline = Math.floor(Date.now() / 1000) + params.deadline * 60 // 转换为秒
    const amountInWei = parseUnits(params.inputAmount, params.inputToken.decimals)
    const amountOutMinWei = parseUnits(params.outputAmountMin, params.outputToken.decimals)

    console.log('📊 交易参数:', {
      path: path.map((addr, i) => `${i}: ${addr}`),
      amountIn: amountInWei.toString(),
      amountOutMin: amountOutMinWei.toString(),
      deadline,
      recipient: params.recipient
    })

    // 🎯 根据交易类型选择对应的函数
    if (params.inputToken.isNative) {
      // 原生代币 → ERC20代币
      console.log('🟡 执行 swapExactETHForTokens')
      return writeSwap({
        address: routerAddress,
        abi: PLANET_ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [amountOutMinWei, path, params.recipient, deadline],
        value: amountInWei, // 发送原生代币
      })
    } else if (params.outputToken.isNative) {
      // ERC20代币 → 原生代币
      console.log('💎 执行 swapExactTokensForETH')
      return writeSwap({
        address: routerAddress,
        abi: PLANET_ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [amountInWei, amountOutMinWei, path, params.recipient, deadline],
      })
    } else {
      // ERC20代币 → ERC20代币
      console.log('🔄 执行 swapExactTokensForTokens')
      return writeSwap({
        address: routerAddress,
        abi: PLANET_ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountInWei, amountOutMinWei, path, params.recipient, deadline],
      })
    }
  }, [writeSwap])

  return {
    // 授权相关
    executeApproval,
    approvalTxHash,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalSuccess,
    approvalError,
    
    // Swap相关
    executeSwap,
    swapTxHash,
    isSwapPending,
    isSwapConfirming,
    isSwapSuccess,
    swapError,
    
    // 整体状态
    isLoading: isApprovalPending || isSwapPending || isApprovalConfirming || isSwapConfirming
  }
}

export default useSwapCallback




