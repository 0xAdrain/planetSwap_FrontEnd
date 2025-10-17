import { useCallback, useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Address, parseUnits, formatUnits } from 'viem'
import { getCurrentContracts } from '../../lib/wagmi'
import { Token } from '../contracts/useTokens'
import PlanetRouterABI from '../../contracts/abis/PlanetRouter.json'

export interface PriceData {
  inputAmount: string
  outputAmount: string
  executionPrice: string
  priceImpact: string
  route: Token[]
}

/**
 * 🥞 PancakeSwap风格的价格数据钩子
 * 参考PancakeSwap实现，获取Router的价格信息
 */
export function usePriceData(
  inputToken: Token | null,
  outputToken: Token | null,
  inputAmount: string,
  slippageTolerance: number = 0.5
): {
  priceData: PriceData | null
  isLoading: boolean
  error: string | null
} {
  const publicClient = usePublicClient()
  const contracts = getCurrentContracts()
  
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPriceData = useCallback(async () => {
    if (!inputToken || !outputToken || !inputAmount || !publicClient) {
      setPriceData(null)
      return
    }

    const amountIn = parseFloat(inputAmount)
    if (amountIn <= 0) {
      setPriceData(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 🛣️ 构建交易路径
      let path: Address[]
      
      // 处理原生代币
      if (inputToken.isNative) {
        path = [contracts.WETH as Address, outputToken.address as Address]
      } else if (outputToken.isNative) {
        path = [inputToken.address as Address, contracts.WETH as Address]
      } else {
        path = [inputToken.address as Address, outputToken.address as Address]
      }

      // 🎯 调用Router获取输出数量
      const amountInBigInt = parseUnits(inputAmount, inputToken.decimals)
      
      const amounts = await publicClient.readContract({
        address: contracts.PLANET_ROUTER as Address,
        abi: PlanetRouterABI,
        functionName: 'getAmountsOut',
        args: [amountInBigInt, path],
      }) as bigint[]

      const amountOut = amounts[amounts.length - 1]
      const outputAmount = formatUnits(amountOut, outputToken.decimals)

      // 📊 计算执行价格
      const executionPrice = (parseFloat(outputAmount) / amountIn).toFixed(6)

      // 📉 简化的价格影响计算
      const priceImpact = amountIn > 1000 ? '~1%' : '<0.1%'

      setPriceData({
        inputAmount,
        outputAmount,
        executionPrice,
        priceImpact,
        route: [inputToken, outputToken],
      })

    } catch (err) {
      console.error('Price fetch error:', err)
      setError(err instanceof Error ? err.message : 'Price calculation failed')
      setPriceData(null)
    } finally {
      setIsLoading(false)
    }
  }, [inputToken, outputToken, inputAmount, publicClient, contracts])

  // 🔄 防抖更新价格
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPriceData()
    }, 500) // 500ms防抖

    return () => clearTimeout(timeoutId)
  }, [fetchPriceData])

  return {
    priceData,
    isLoading,
    error,
  }
}
