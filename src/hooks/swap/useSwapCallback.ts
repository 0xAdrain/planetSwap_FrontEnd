import { useCallback, useMemo } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, parseUnits, formatUnits } from 'viem'
import { getCurrentContracts } from '../../lib/wagmi'
import PlanetRouterABI from '../../contracts/abis/PlanetRouter.json'

export interface SwapParameters {
  amountIn: string
  amountOutMin: string
  path: Address[]
  to: Address
  deadline: bigint
}

export interface SwapCallbacks {
  swapExactETHForTokens: (params: Omit<SwapParameters, 'path'> & { path: Address[] }) => void
  swapExactTokensForETH: (params: SwapParameters) => void  
  swapExactTokensForTokens: (params: SwapParameters) => void
}

/**
 * 🥞 PancakeSwap风格的Swap回调钩子
 * 参考PancakeSwap实现，处理V2 Router合约交互
 */
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
