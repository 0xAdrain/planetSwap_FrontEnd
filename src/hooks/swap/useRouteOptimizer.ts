import { useState, useCallback, useMemo } from 'react'
import { Address, formatUnits, parseUnits } from 'viem'
import { useReadContract, usePublicClient } from 'wagmi'
import { ChainId } from '../../config/chains/chainId'
import { getContractAddresses } from '../../config/chains/contracts'
import { Token } from '../../config/tokens'
import { SwapRoute, RouteType } from './useRouterAddress'
import { useV3PoolDiscovery, V3FeeTier } from './useV3PoolDiscovery'
import PlanetRouterABI from '../../contracts/abis/CometRouter.json'

// 🏭 Factory ABI for pair checking
const FACTORY_ABI = [
  {
    "constant": true,
    "inputs": [
      { "internalType": "address", "name": "tokenA", "type": "address" },
      { "internalType": "address", "name": "tokenB", "type": "address" }
    ],
    "name": "getPair",
    "outputs": [{ "internalType": "address", "name": "pair", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 💱 Pair ABI for reserves
const PAIR_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint112", "name": "reserve0", "type": "uint112" },
      { "internalType": "uint112", "name": "reserve1", "type": "uint112" },
      { "internalType": "uint32", "name": "blockTimestampLast", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token0",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token1", 
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 🌉 Bridge tokens for multi-hop routing
const BRIDGE_TOKENS = {
  [ChainId.X_LAYER_TESTNET]: [
    '0xFCF165C4C8925682aE5facEC596D474eB36CE825', // mWOKB
    '0xE196aaADEbAcCE2354Aa414D202E0AB1C907d8B5', // mUSDT
    '0x70b759Ba2ca756fAD20B232De07F583AA5E676FC', // mUSDC
    '0x4Ec24e2da05F7C6fC54C3234137E07d0A8826610'  // mDAI
  ]
}

// 📈 Route scoring weights
const ROUTE_WEIGHTS = {
  OUTPUT_AMOUNT: 0.6,  // 60% weight for output amount
  GAS_COST: 0.3,       // 30% weight for gas efficiency  
  RELIABILITY: 0.1     // 10% weight for reliability
}

// ⚡ Gas estimates for different route types
const GAS_ESTIMATES = {
  [RouteType.V2]: {
    DIRECT: BigInt(120000),
    ONE_HOP: BigInt(180000),
    TWO_HOP: BigInt(240000)
  },
  [RouteType.V3]: {
    DIRECT: BigInt(150000),
    ONE_HOP: BigInt(220000)
  },
  [RouteType.MIXED]: {
    BASE: BigInt(200000),
    PER_HOP: BigInt(80000)
  }
}

export interface RouteQuote {
  route: SwapRoute
  outputAmount: bigint
  priceImpact: number
  gasEstimate: bigint
  gasCostUSD: number
  reliability: number
  score: number
}

export interface OptimizationResult {
  bestRoute: RouteQuote | null
  allRoutes: RouteQuote[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * 🧠 Smart Route Optimizer Hook
 * 参考PancakeSwap的路径优化算法
 * 
 * 功能：
 * 1. 发现所有可能的交易路径
 * 2. 计算每条路径的预期输出和成本
 * 3. 智能选择最优路径
 */
export function useRouteOptimizer(
  inputToken: Token | null,
  outputToken: Token | null,
  inputAmount: string
): OptimizationResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<RouteQuote[]>([])

  const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
  const { discoverV3Pools, getBestV3Quote } = useV3PoolDiscovery()
  const publicClient = usePublicClient()

  // 🔍 发现所有可能的路径
  const discoverRoutes = useCallback(async (): Promise<SwapRoute[]> => {
    if (!inputToken || !outputToken || !inputAmount) return []

    const discoveredRoutes: SwapRoute[] = []

    // 1. 🎯 Direct V2 Route
    const directRoute = await checkDirectV2Route(inputToken, outputToken)
    if (directRoute) {
      discoveredRoutes.push(directRoute)
    }

    // 2. 🌉 Bridge Token Routes (V2)
    const bridgeRoutes = await discoverBridgeRoutes(inputToken, outputToken)
    discoveredRoutes.push(...bridgeRoutes)

    // 3. 🎯 V3 Routes (现在启用!)
    const v3Routes = await discoverV3Routes(inputToken, outputToken)
    discoveredRoutes.push(...v3Routes)

    console.log('🔍 Discovered routes:', discoveredRoutes.length, '(V2:', bridgeRoutes.length + (directRoute ? 1 : 0), 'V3:', v3Routes.length, ')')
    return discoveredRoutes

  }, [inputToken, outputToken, inputAmount])

  // 💱 检查直接V2交易对
  const checkDirectV2Route = async (tokenA: Token, tokenB: Token): Promise<SwapRoute | null> => {
    try {
      // 这里应该调用Factory合约检查pair是否存在
      // 简化实现：假设主要代币对存在直接pair
      
      const route: SwapRoute = {
        type: RouteType.V2,
        pools: [`${tokenA.address}-${tokenB.address}`],
        path: [tokenA.address as Address, tokenB.address as Address],
        gasEstimate: GAS_ESTIMATES[RouteType.V2].DIRECT
      }

      return route
    } catch (error) {
      console.error('❌ Error checking direct route:', error)
      return null
    }
  }

  // 🌉 发现桥接代币路径
  const discoverBridgeRoutes = async (tokenA: Token, tokenB: Token): Promise<SwapRoute[]> => {
    const routes: SwapRoute[] = []
    const bridgeTokens = BRIDGE_TOKENS[ChainId.X_LAYER_TESTNET] || []

    for (const bridgeToken of bridgeTokens) {
      // 跳过如果桥接代币就是输入或输出代币
      if (bridgeToken === tokenA.address || bridgeToken === tokenB.address) {
        continue
      }

      // 检查 tokenA -> bridgeToken -> tokenB 路径
      const route: SwapRoute = {
        type: RouteType.V2,
        pools: [
          `${tokenA.address}-${bridgeToken}`,
          `${bridgeToken}-${tokenB.address}`
        ],
        path: [tokenA.address as Address, bridgeToken as Address, tokenB.address as Address],
        gasEstimate: GAS_ESTIMATES[RouteType.V2].ONE_HOP
      }

      routes.push(route)
    }

    return routes
  }

  // 🎯 发现V3路径 (新实现!)
  const discoverV3Routes = async (tokenA: Token, tokenB: Token): Promise<SwapRoute[]> => {
    console.log('🎯 Discovering V3 routes for:', tokenA.symbol, '→', tokenB.symbol)
    
    try {
      // 发现所有V3池子
      const v3Pools = await discoverV3Pools(tokenA, tokenB)
      
      if (v3Pools.length === 0) {
        console.log('   No V3 pools found')
        return []
      }

      const v3Routes: SwapRoute[] = []

      // 为每个有效的V3池子创建路由
      for (const pool of v3Pools) {
        if (pool.exists && pool.liquidity > BigInt(0)) {
          const route: SwapRoute = {
            type: RouteType.V3,
            pools: [pool.address],
            path: [tokenA.address as Address, tokenB.address as Address],
            gasEstimate: GAS_ESTIMATES[RouteType.V3].DIRECT,
            // 存储V3特定信息
            expectedOutput: BigInt(0), // 将在报价时计算
            feeTier: pool.fee
          }
          
          v3Routes.push(route)
          console.log(`   ✅ V3 route added: ${tokenA.symbol}→${tokenB.symbol} (${pool.fee/10000}% fee)`)
        }
      }

      // TODO: 未来可以添加V3多跳路由
      // const multiHopRoutes = await discoverV3MultiHopRoutes(tokenA, tokenB)
      // v3Routes.push(...multiHopRoutes)

      console.log(`🎯 Found ${v3Routes.length} V3 routes`)
      return v3Routes

    } catch (error) {
      console.error('❌ V3 route discovery failed:', error)
      return []
    }
  }

  // 📊 计算路径报价 (支持V2和V3)
  const calculateRouteQuote = useCallback(async (route: SwapRoute): Promise<RouteQuote | null> => {
    try {
      console.log('📊 Calculating quote for route:', route.type, route.path.map(p => p.slice(0,8)).join('→'))

      // 🔢 根据路由类型获取真实报价
      let outputAmount: bigint
      let priceImpact: number
      
      if (route.type === RouteType.V3 && inputToken && outputToken && route.feeTier) {
        // V3真实报价
        const parsedAmountIn = parseUnits(inputAmount, inputToken.decimals)
        const v3Quote = await getBestV3Quote(inputToken, outputToken, parsedAmountIn)
        
        if (!v3Quote) {
          console.warn('Failed to get V3 quote')
          return null
        }
        
        outputAmount = v3Quote.amountOut
        priceImpact = v3Quote.priceImpact
        
        console.log(`   ✅ V3 Quote: ${inputAmount} ${inputToken.symbol} → ${formatUnits(outputAmount, outputToken.decimals)} ${outputToken.symbol}`)
      } else {
        // V2真实报价 (使用现有的合约调用逻辑)
        if (!publicClient || !inputToken || !outputToken) {
          console.warn('PublicClient or tokens not available')
          return null
        }

        const parsedAmountIn = parseUnits(inputAmount, inputToken.decimals)
        
        try {
          // 🛣️ 构建交易路径 (和usePriceData.ts一样的逻辑)
          const path = route.path

          // 🎯 调用Router获取输出数量 (真实合约调用!)
          const amounts = await publicClient.readContract({
            address: contracts.PLANET_ROUTER as Address,
            abi: PlanetRouterABI,
            functionName: 'getAmountsOut',
            args: [parsedAmountIn, path],
          }) as bigint[]

          outputAmount = amounts[amounts.length - 1]
          
          // 📉 简化的价格影响计算
          priceImpact = parseFloat(inputAmount) > 1000 ? 1.0 : 0.1
          
          console.log(`   ✅ V2 Quote: ${inputAmount} ${inputToken.symbol} → ${formatUnits(outputAmount, outputToken.decimals)} ${outputToken.symbol} (${route.path.length} hops)`)
          
        } catch (error) {
          console.warn('V2 quote failed:', error)
          return null
        }
      }
      
      // ⚡ Gas成本估算
      const gasEstimate = route.gasEstimate || estimateGasCost(route)
      const gasCostUSD = await estimateGasCostUSD(gasEstimate)
      
      // 🔒 可靠性评分
      const reliability = calculateReliability(route)
      
      // 🏆 综合评分 - V3和V2使用相同的评分逻辑
      const score = calculateRouteScore({
        outputAmount,
        gasEstimate,
        gasCostUSD,
        reliability,
        priceImpact
      })

      const quote = {
        route,
        outputAmount,
        priceImpact,
        gasEstimate,
        gasCostUSD,
        reliability,
        score
      }

      console.log(`   📊 Route score: ${score.toFixed(3)} (Output: ${score * 0.6}, Gas: ${score * 0.3}, Reliability: ${score * 0.1})`)
      
      return quote
    } catch (error) {
      console.error('❌ Error calculating route quote:', error)
      return null
    }
  }, [inputAmount, inputToken, outputToken, getBestV3Quote, publicClient, contracts])

  // 📊 估算输出数量 (简化实现)
  const estimateOutputAmount = async (route: SwapRoute, amountIn: string): Promise<bigint> => {
    // 简化实现：返回模拟的输出数量
    // 实际实现需要调用Router的getAmountsOut或类似函数
    
    if (!inputToken || !outputToken) return BigInt(0)
    
    const parsedAmountIn = parseUnits(amountIn, inputToken.decimals)
    
    // 模拟不同路径的输出差异
    let multiplier = 0.95 // 基础95%比率，考虑滑点和手续费
    
    if (route.type === RouteType.V2 && route.path.length === 2) {
      multiplier = 0.97 // 直接路径更好的比率
    } else if (route.path.length > 2) {
      multiplier = 0.93 // 多跳路径较低比率
    }
    
    // 简单的价格转换 (实际应该查询储备金或预言机)
    const outputAmount = BigInt(Math.floor(Number(parsedAmountIn) * multiplier))
    
    return outputAmount
  }

  // 📈 计算价格影响
  const calculatePriceImpact = (route: SwapRoute, amountIn: string, amountOut: bigint): number => {
    // 简化实现：基于路径类型估算价格影响
    if (route.path.length === 2) {
      return 0.1 // 直接路径 0.1%
    } else if (route.path.length === 3) {
      return 0.3 // 一跳路径 0.3%
    } else {
      return 0.5 // 多跳路径 0.5%
    }
  }

  // ⚡ 估算Gas成本
  const estimateGasCost = (route: SwapRoute): bigint => {
    if (route.gasEstimate) return route.gasEstimate
    
    const gasConfig = GAS_ESTIMATES[route.type]
    if ('DIRECT' in gasConfig) {
      return gasConfig.DIRECT
    } else if ('BASE' in gasConfig) {
      // MIXED route: base cost + per hop cost
      const hops = Math.max(1, route.path.length - 1)
      return gasConfig.BASE + gasConfig.PER_HOP * BigInt(hops - 1)
    }
    
    return BigInt(150000) // fallback
  }

  // 💰 估算Gas成本USD
  const estimateGasCostUSD = async (gasEstimate: bigint): Promise<number> => {
    // 简化实现：假设gas价格和OKB价格
    const gasPrice = 0.001 // gwei
    const okbPriceUSD = 50 // USD
    
    const gasCostOKB = Number(gasEstimate) * gasPrice / 1e9
    return gasCostOKB * okbPriceUSD
  }

  // 🔒 计算可靠性评分 (支持V2/V3)
  const calculateReliability = (route: SwapRoute): number => {
    let score = 1.0
    
    // 协议类型可靠性 (V3 > V2 因为流动性更集中)
    if (route.type === RouteType.V3) {
      score *= 0.98  // V3更可靠
    } else if (route.type === RouteType.V2) {
      score *= 0.95  // V2次之
    } else {
      score *= 0.90  // 混合路径最复杂
    }
    
    // 路径长度可靠性
    if (route.path.length === 2) {
      score *= 0.98  // 直接路径最可靠
    } else if (route.path.length === 3) {
      score *= 0.95  // 一跳路径
    } else {
      score *= 0.90  // 多跳路径
    }
    
    // V3特殊考虑：费率越低通常流动性越好
    if (route.type === RouteType.V3 && route.feeTier) {
      if (route.feeTier === 500) {
        score *= 1.02  // 0.05% 费率 (稳定币对)
      } else if (route.feeTier === 3000) {
        score *= 1.00  // 0.3% 费率 (标准)
      } else if (route.feeTier === 100) {
        score *= 0.98  // 0.01% 费率 (超低费率可能流动性不足)
      } else {
        score *= 0.96  // 1% 费率 (高风险对)
      }
    }
    
    return Math.min(score, 1.0) // 确保不超过1.0
  }

  // 🏆 计算综合路径评分
  const calculateRouteScore = (params: {
    outputAmount: bigint
    gasEstimate: bigint
    gasCostUSD: number
    reliability: number
    priceImpact: number
  }): number => {
    // 标准化各个指标
    const outputScore = Number(params.outputAmount) / 1e18 // 简化标准化
    const gasScore = 1 / (Number(params.gasEstimate) / 100000) // Gas越低分数越高
    const reliabilityScore = params.reliability
    
    // 加权计算综合评分
    const finalScore = 
      outputScore * ROUTE_WEIGHTS.OUTPUT_AMOUNT +
      gasScore * ROUTE_WEIGHTS.GAS_COST +
      reliabilityScore * ROUTE_WEIGHTS.RELIABILITY
    
    return finalScore
  }

  // 🧠 优化路径选择
  const optimizeRoutes = useCallback(async () => {
    if (!inputToken || !outputToken || !inputAmount) {
      setRoutes([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. 发现所有路径
      const discoveredRoutes = await discoverRoutes()
      
      // 2. 计算每条路径的报价
      const quotePromises = discoveredRoutes.map(route => calculateRouteQuote(route))
      const quoteResults = await Promise.all(quotePromises)
      
      // 3. 过滤有效报价并排序
      const validQuotes = quoteResults
        .filter((quote): quote is RouteQuote => quote !== null)
        .sort((a, b) => b.score - a.score) // 按评分降序排列
      
      setRoutes(validQuotes)
      console.log('🏆 Route optimization complete:', validQuotes.length, 'routes')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Route optimization failed'
      setError(errorMessage)
      console.error('❌ Route optimization error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [inputToken, outputToken, inputAmount, discoverRoutes, calculateRouteQuote])

  // 🎯 最优路径
  const bestRoute = useMemo(() => {
    return routes.length > 0 ? routes[0] : null
  }, [routes])

  // 🔄 自动优化路径
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     optimizeRoutes()
  //   }, 500) // 防抖延迟
  //   
  //   return () => clearTimeout(timeoutId)
  // }, [optimizeRoutes])

  return {
    bestRoute,
    allRoutes: routes,
    isLoading,
    error,
    // 手动触发优化的函数
    refresh: optimizeRoutes
  }
}

import { useReadContract, usePublicClient } from 'wagmi'
import { ChainId } from '../../config/chains/chainId'
import { getContractAddresses } from '../../config/chains/contracts'
import { Token } from '../../config/tokens'
import { SwapRoute, RouteType } from './useRouterAddress'
import { useV3PoolDiscovery, V3FeeTier } from './useV3PoolDiscovery'
import PlanetRouterABI from '../../contracts/abis/CometRouter.json'

// 🏭 Factory ABI for pair checking
const FACTORY_ABI = [
  {
    "constant": true,
    "inputs": [
      { "internalType": "address", "name": "tokenA", "type": "address" },
      { "internalType": "address", "name": "tokenB", "type": "address" }
    ],
    "name": "getPair",
    "outputs": [{ "internalType": "address", "name": "pair", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 💱 Pair ABI for reserves
const PAIR_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint112", "name": "reserve0", "type": "uint112" },
      { "internalType": "uint112", "name": "reserve1", "type": "uint112" },
      { "internalType": "uint32", "name": "blockTimestampLast", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token0",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token1", 
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 🌉 Bridge tokens for multi-hop routing
const BRIDGE_TOKENS = {
  [ChainId.X_LAYER_TESTNET]: [
    '0xFCF165C4C8925682aE5facEC596D474eB36CE825', // mWOKB
    '0xE196aaADEbAcCE2354Aa414D202E0AB1C907d8B5', // mUSDT
    '0x70b759Ba2ca756fAD20B232De07F583AA5E676FC', // mUSDC
    '0x4Ec24e2da05F7C6fC54C3234137E07d0A8826610'  // mDAI
  ]
}

// 📈 Route scoring weights
const ROUTE_WEIGHTS = {
  OUTPUT_AMOUNT: 0.6,  // 60% weight for output amount
  GAS_COST: 0.3,       // 30% weight for gas efficiency  
  RELIABILITY: 0.1     // 10% weight for reliability
}

// ⚡ Gas estimates for different route types
const GAS_ESTIMATES = {
  [RouteType.V2]: {
    DIRECT: BigInt(120000),
    ONE_HOP: BigInt(180000),
    TWO_HOP: BigInt(240000)
  },
  [RouteType.V3]: {
    DIRECT: BigInt(150000),
    ONE_HOP: BigInt(220000)
  },
  [RouteType.MIXED]: {
    BASE: BigInt(200000),
    PER_HOP: BigInt(80000)
  }
}

export interface RouteQuote {
  route: SwapRoute
  outputAmount: bigint
  priceImpact: number
  gasEstimate: bigint
  gasCostUSD: number
  reliability: number
  score: number
}

export interface OptimizationResult {
  bestRoute: RouteQuote | null
  allRoutes: RouteQuote[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * 🧠 Smart Route Optimizer Hook
 * 参考PancakeSwap的路径优化算法
 * 
 * 功能：
 * 1. 发现所有可能的交易路径
 * 2. 计算每条路径的预期输出和成本
 * 3. 智能选择最优路径
 */
export function useRouteOptimizer(
  inputToken: Token | null,
  outputToken: Token | null,
  inputAmount: string
): OptimizationResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<RouteQuote[]>([])

  const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
  const { discoverV3Pools, getBestV3Quote } = useV3PoolDiscovery()
  const publicClient = usePublicClient()

  // 🔍 发现所有可能的路径
  const discoverRoutes = useCallback(async (): Promise<SwapRoute[]> => {
    if (!inputToken || !outputToken || !inputAmount) return []

    const discoveredRoutes: SwapRoute[] = []

    // 1. 🎯 Direct V2 Route
    const directRoute = await checkDirectV2Route(inputToken, outputToken)
    if (directRoute) {
      discoveredRoutes.push(directRoute)
    }

    // 2. 🌉 Bridge Token Routes (V2)
    const bridgeRoutes = await discoverBridgeRoutes(inputToken, outputToken)
    discoveredRoutes.push(...bridgeRoutes)

    // 3. 🎯 V3 Routes (现在启用!)
    const v3Routes = await discoverV3Routes(inputToken, outputToken)
    discoveredRoutes.push(...v3Routes)

    console.log('🔍 Discovered routes:', discoveredRoutes.length, '(V2:', bridgeRoutes.length + (directRoute ? 1 : 0), 'V3:', v3Routes.length, ')')
    return discoveredRoutes

  }, [inputToken, outputToken, inputAmount])

  // 💱 检查直接V2交易对
  const checkDirectV2Route = async (tokenA: Token, tokenB: Token): Promise<SwapRoute | null> => {
    try {
      // 这里应该调用Factory合约检查pair是否存在
      // 简化实现：假设主要代币对存在直接pair
      
      const route: SwapRoute = {
        type: RouteType.V2,
        pools: [`${tokenA.address}-${tokenB.address}`],
        path: [tokenA.address as Address, tokenB.address as Address],
        gasEstimate: GAS_ESTIMATES[RouteType.V2].DIRECT
      }

      return route
    } catch (error) {
      console.error('❌ Error checking direct route:', error)
      return null
    }
  }

  // 🌉 发现桥接代币路径
  const discoverBridgeRoutes = async (tokenA: Token, tokenB: Token): Promise<SwapRoute[]> => {
    const routes: SwapRoute[] = []
    const bridgeTokens = BRIDGE_TOKENS[ChainId.X_LAYER_TESTNET] || []

    for (const bridgeToken of bridgeTokens) {
      // 跳过如果桥接代币就是输入或输出代币
      if (bridgeToken === tokenA.address || bridgeToken === tokenB.address) {
        continue
      }

      // 检查 tokenA -> bridgeToken -> tokenB 路径
      const route: SwapRoute = {
        type: RouteType.V2,
        pools: [
          `${tokenA.address}-${bridgeToken}`,
          `${bridgeToken}-${tokenB.address}`
        ],
        path: [tokenA.address as Address, bridgeToken as Address, tokenB.address as Address],
        gasEstimate: GAS_ESTIMATES[RouteType.V2].ONE_HOP
      }

      routes.push(route)
    }

    return routes
  }

  // 🎯 发现V3路径 (新实现!)
  const discoverV3Routes = async (tokenA: Token, tokenB: Token): Promise<SwapRoute[]> => {
    console.log('🎯 Discovering V3 routes for:', tokenA.symbol, '→', tokenB.symbol)
    
    try {
      // 发现所有V3池子
      const v3Pools = await discoverV3Pools(tokenA, tokenB)
      
      if (v3Pools.length === 0) {
        console.log('   No V3 pools found')
        return []
      }

      const v3Routes: SwapRoute[] = []

      // 为每个有效的V3池子创建路由
      for (const pool of v3Pools) {
        if (pool.exists && pool.liquidity > BigInt(0)) {
          const route: SwapRoute = {
            type: RouteType.V3,
            pools: [pool.address],
            path: [tokenA.address as Address, tokenB.address as Address],
            gasEstimate: GAS_ESTIMATES[RouteType.V3].DIRECT,
            // 存储V3特定信息
            expectedOutput: BigInt(0), // 将在报价时计算
            feeTier: pool.fee
          }
          
          v3Routes.push(route)
          console.log(`   ✅ V3 route added: ${tokenA.symbol}→${tokenB.symbol} (${pool.fee/10000}% fee)`)
        }
      }

      // TODO: 未来可以添加V3多跳路由
      // const multiHopRoutes = await discoverV3MultiHopRoutes(tokenA, tokenB)
      // v3Routes.push(...multiHopRoutes)

      console.log(`🎯 Found ${v3Routes.length} V3 routes`)
      return v3Routes

    } catch (error) {
      console.error('❌ V3 route discovery failed:', error)
      return []
    }
  }

  // 📊 计算路径报价 (支持V2和V3)
  const calculateRouteQuote = useCallback(async (route: SwapRoute): Promise<RouteQuote | null> => {
    try {
      console.log('📊 Calculating quote for route:', route.type, route.path.map(p => p.slice(0,8)).join('→'))

      // 🔢 根据路由类型获取真实报价
      let outputAmount: bigint
      let priceImpact: number
      
      if (route.type === RouteType.V3 && inputToken && outputToken && route.feeTier) {
        // V3真实报价
        const parsedAmountIn = parseUnits(inputAmount, inputToken.decimals)
        const v3Quote = await getBestV3Quote(inputToken, outputToken, parsedAmountIn)
        
        if (!v3Quote) {
          console.warn('Failed to get V3 quote')
          return null
        }
        
        outputAmount = v3Quote.amountOut
        priceImpact = v3Quote.priceImpact
        
        console.log(`   ✅ V3 Quote: ${inputAmount} ${inputToken.symbol} → ${formatUnits(outputAmount, outputToken.decimals)} ${outputToken.symbol}`)
      } else {
        // V2真实报价 (使用现有的合约调用逻辑)
        if (!publicClient || !inputToken || !outputToken) {
          console.warn('PublicClient or tokens not available')
          return null
        }

        const parsedAmountIn = parseUnits(inputAmount, inputToken.decimals)
        
        try {
          // 🛣️ 构建交易路径 (和usePriceData.ts一样的逻辑)
          const path = route.path

          // 🎯 调用Router获取输出数量 (真实合约调用!)
          const amounts = await publicClient.readContract({
            address: contracts.PLANET_ROUTER as Address,
            abi: PlanetRouterABI,
            functionName: 'getAmountsOut',
            args: [parsedAmountIn, path],
          }) as bigint[]

          outputAmount = amounts[amounts.length - 1]
          
          // 📉 简化的价格影响计算
          priceImpact = parseFloat(inputAmount) > 1000 ? 1.0 : 0.1
          
          console.log(`   ✅ V2 Quote: ${inputAmount} ${inputToken.symbol} → ${formatUnits(outputAmount, outputToken.decimals)} ${outputToken.symbol} (${route.path.length} hops)`)
          
        } catch (error) {
          console.warn('V2 quote failed:', error)
          return null
        }
      }
      
      // ⚡ Gas成本估算
      const gasEstimate = route.gasEstimate || estimateGasCost(route)
      const gasCostUSD = await estimateGasCostUSD(gasEstimate)
      
      // 🔒 可靠性评分
      const reliability = calculateReliability(route)
      
      // 🏆 综合评分 - V3和V2使用相同的评分逻辑
      const score = calculateRouteScore({
        outputAmount,
        gasEstimate,
        gasCostUSD,
        reliability,
        priceImpact
      })

      const quote = {
        route,
        outputAmount,
        priceImpact,
        gasEstimate,
        gasCostUSD,
        reliability,
        score
      }

      console.log(`   📊 Route score: ${score.toFixed(3)} (Output: ${score * 0.6}, Gas: ${score * 0.3}, Reliability: ${score * 0.1})`)
      
      return quote
    } catch (error) {
      console.error('❌ Error calculating route quote:', error)
      return null
    }
  }, [inputAmount, inputToken, outputToken, getBestV3Quote, publicClient, contracts])

  // 📊 估算输出数量 (简化实现)
  const estimateOutputAmount = async (route: SwapRoute, amountIn: string): Promise<bigint> => {
    // 简化实现：返回模拟的输出数量
    // 实际实现需要调用Router的getAmountsOut或类似函数
    
    if (!inputToken || !outputToken) return BigInt(0)
    
    const parsedAmountIn = parseUnits(amountIn, inputToken.decimals)
    
    // 模拟不同路径的输出差异
    let multiplier = 0.95 // 基础95%比率，考虑滑点和手续费
    
    if (route.type === RouteType.V2 && route.path.length === 2) {
      multiplier = 0.97 // 直接路径更好的比率
    } else if (route.path.length > 2) {
      multiplier = 0.93 // 多跳路径较低比率
    }
    
    // 简单的价格转换 (实际应该查询储备金或预言机)
    const outputAmount = BigInt(Math.floor(Number(parsedAmountIn) * multiplier))
    
    return outputAmount
  }

  // 📈 计算价格影响
  const calculatePriceImpact = (route: SwapRoute, amountIn: string, amountOut: bigint): number => {
    // 简化实现：基于路径类型估算价格影响
    if (route.path.length === 2) {
      return 0.1 // 直接路径 0.1%
    } else if (route.path.length === 3) {
      return 0.3 // 一跳路径 0.3%
    } else {
      return 0.5 // 多跳路径 0.5%
    }
  }

  // ⚡ 估算Gas成本
  const estimateGasCost = (route: SwapRoute): bigint => {
    if (route.gasEstimate) return route.gasEstimate
    
    const gasConfig = GAS_ESTIMATES[route.type]
    if ('DIRECT' in gasConfig) {
      return gasConfig.DIRECT
    } else if ('BASE' in gasConfig) {
      // MIXED route: base cost + per hop cost
      const hops = Math.max(1, route.path.length - 1)
      return gasConfig.BASE + gasConfig.PER_HOP * BigInt(hops - 1)
    }
    
    return BigInt(150000) // fallback
  }

  // 💰 估算Gas成本USD
  const estimateGasCostUSD = async (gasEstimate: bigint): Promise<number> => {
    // 简化实现：假设gas价格和OKB价格
    const gasPrice = 0.001 // gwei
    const okbPriceUSD = 50 // USD
    
    const gasCostOKB = Number(gasEstimate) * gasPrice / 1e9
    return gasCostOKB * okbPriceUSD
  }

  // 🔒 计算可靠性评分 (支持V2/V3)
  const calculateReliability = (route: SwapRoute): number => {
    let score = 1.0
    
    // 协议类型可靠性 (V3 > V2 因为流动性更集中)
    if (route.type === RouteType.V3) {
      score *= 0.98  // V3更可靠
    } else if (route.type === RouteType.V2) {
      score *= 0.95  // V2次之
    } else {
      score *= 0.90  // 混合路径最复杂
    }
    
    // 路径长度可靠性
    if (route.path.length === 2) {
      score *= 0.98  // 直接路径最可靠
    } else if (route.path.length === 3) {
      score *= 0.95  // 一跳路径
    } else {
      score *= 0.90  // 多跳路径
    }
    
    // V3特殊考虑：费率越低通常流动性越好
    if (route.type === RouteType.V3 && route.feeTier) {
      if (route.feeTier === 500) {
        score *= 1.02  // 0.05% 费率 (稳定币对)
      } else if (route.feeTier === 3000) {
        score *= 1.00  // 0.3% 费率 (标准)
      } else if (route.feeTier === 100) {
        score *= 0.98  // 0.01% 费率 (超低费率可能流动性不足)
      } else {
        score *= 0.96  // 1% 费率 (高风险对)
      }
    }
    
    return Math.min(score, 1.0) // 确保不超过1.0
  }

  // 🏆 计算综合路径评分
  const calculateRouteScore = (params: {
    outputAmount: bigint
    gasEstimate: bigint
    gasCostUSD: number
    reliability: number
    priceImpact: number
  }): number => {
    // 标准化各个指标
    const outputScore = Number(params.outputAmount) / 1e18 // 简化标准化
    const gasScore = 1 / (Number(params.gasEstimate) / 100000) // Gas越低分数越高
    const reliabilityScore = params.reliability
    
    // 加权计算综合评分
    const finalScore = 
      outputScore * ROUTE_WEIGHTS.OUTPUT_AMOUNT +
      gasScore * ROUTE_WEIGHTS.GAS_COST +
      reliabilityScore * ROUTE_WEIGHTS.RELIABILITY
    
    return finalScore
  }

  // 🧠 优化路径选择
  const optimizeRoutes = useCallback(async () => {
    if (!inputToken || !outputToken || !inputAmount) {
      setRoutes([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. 发现所有路径
      const discoveredRoutes = await discoverRoutes()
      
      // 2. 计算每条路径的报价
      const quotePromises = discoveredRoutes.map(route => calculateRouteQuote(route))
      const quoteResults = await Promise.all(quotePromises)
      
      // 3. 过滤有效报价并排序
      const validQuotes = quoteResults
        .filter((quote): quote is RouteQuote => quote !== null)
        .sort((a, b) => b.score - a.score) // 按评分降序排列
      
      setRoutes(validQuotes)
      console.log('🏆 Route optimization complete:', validQuotes.length, 'routes')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Route optimization failed'
      setError(errorMessage)
      console.error('❌ Route optimization error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [inputToken, outputToken, inputAmount, discoverRoutes, calculateRouteQuote])

  // 🎯 最优路径
  const bestRoute = useMemo(() => {
    return routes.length > 0 ? routes[0] : null
  }, [routes])

  // 🔄 自动优化路径
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     optimizeRoutes()
  //   }, 500) // 防抖延迟
  //   
  //   return () => clearTimeout(timeoutId)
  // }, [optimizeRoutes])

  return {
    bestRoute,
    allRoutes: routes,
    isLoading,
    error,
    // 手动触发优化的函数
    refresh: optimizeRoutes
  }
}



