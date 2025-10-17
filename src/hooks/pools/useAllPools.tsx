import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, usePublicClient, useReadContract, useChainId } from 'wagmi'
import { formatUnits, Address } from 'viem'
import { Token, useTokens } from '../contracts/useTokens'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'
import PlanetFactoryV2ABI from '../../contracts/abis/PlanetFactory.json'
import PlanetPairV2ABI from '../../contracts/abis/PlanetPairV2.json'
import ERC20ABI from '../../contracts/abis/ERC20.json'

export interface PoolInfo {
  id: string
  version: 'v2' | 'v3'
  chainId: number
  
  // 基础信息
  tokenA: Token
  tokenB: Token
  pairAddress?: Address  // V2 pair address
  poolAddress?: Address  // V3 pool address
  feeTier?: number       // V3 fee tier (e.g. 3000 = 0.3%)
  
  // 流动性信息
  reserve0?: string      // Token0 reserve
  reserve1?: string      // Token1 reserve  
  totalSupply?: string   // LP token total supply
  tvlUSD?: string        // Total Value Locked in USD
  
  // 交易数据
  volume24hUSD?: string  // 24h trading volume in USD
  volume7dUSD?: string   // 7d trading volume in USD
  fees24hUSD?: string    // 24h fees earned in USD
  
  // 收益率
  apy?: string           // Annual Percentage Yield
  apy7d?: string         // 7-day APY
  
  // 用户数据
  userLiquidityUSD?: string  // User's liquidity value in USD
  userLPBalance?: string     // User's LP token balance
  
  // 时间戳
  createdAt: number      // Pool creation timestamp
  updatedAt: number      // Last update timestamp
}

interface AllPoolsData {
  allPools: PoolInfo[]
  v2Pools: PoolInfo[]
  v3Pools: PoolInfo[]
  isLoading: boolean
  error: string | null
  totalTVL: number
  totalVolume24h: number
  totalFees24h: number
  poolCount: number
  refreshPools: () => void
}

/**
 * 🏊‍♂️ 获取所有流动池数据的Hook
 * 包括V2和V3池子的完整信息和统计数据
 */
export const useAllPools = (): AllPoolsData => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { tokens } = useTokens()
  
  // 🎯 使用当前连接的网络链ID，而不是hardcoded
  const currentChainId = chainId as ChainId
  const contractAddresses = useMemo(() => {
    try {
      return getContractAddresses(currentChainId)
    } catch (err) {
      console.warn('⚠️ 当前网络不支持:', currentChainId, err)
      return null
    }
  }, [currentChainId])
  
  const v2FactoryAddress = contractAddresses?.PLANET_FACTORY
  
  const [allPools, setAllPools] = useState<PoolInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🎯 获取V2池子数量
  const { data: v2PoolLength } = useReadContract({
    address: v2FactoryAddress as Address,
    abi: PlanetFactoryV2ABI,
    functionName: 'allPairsLength',
    query: {
      enabled: !!v2FactoryAddress
    }
  })

  // 🎯 生成所有可能的代币对
  const generateTokenPairs = useCallback(() => {
    const pairs: Array<{ tokenA: Token; tokenB: Token }> = []
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        pairs.push({ tokenA: tokens[i], tokenB: tokens[j] })
      }
    }
    return pairs
  }, [tokens])

  // 🎯 获取V2池子地址列表
  const getV2PoolAddresses = useCallback(async () => {
    if (!publicClient || !v2FactoryAddress || tokens.length === 0) return []

    console.log('🔍 获取V2池子地址列表...')
    
    const pools: Array<{ tokenA: Token; tokenB: Token; pairAddress: Address }> = []
    const tokenPairs = generateTokenPairs()

    // 批量查询池子地址
    for (const { tokenA, tokenB } of tokenPairs) {
      try {
        const pairAddress = await publicClient.readContract({
          address: v2FactoryAddress as Address,
          abi: PlanetFactoryV2ABI,
          functionName: 'getPair',
          args: [tokenA.address as Address, tokenB.address as Address],
        })

        if (pairAddress !== '0x0000000000000000000000000000000000000000') {
          pools.push({ tokenA, tokenB, pairAddress })
          console.log(`✅ 找到V2池子: ${tokenA.symbol}/${tokenB.symbol} -> ${pairAddress}`)
        }
      } catch (err) {
        console.warn(`⚠️ 无法获取 ${tokenA.symbol}/${tokenB.symbol} 的池子地址:`, err)
      }
    }

    return pools
  }, [publicClient, v2FactoryAddress, tokens, generateTokenPairs])

  // 🎯 获取单个V2池子的详细信息
  const getV2PoolDetails = useCallback(async (
    tokenA: Token, 
    tokenB: Token, 
    pairAddress: Address
  ): Promise<PoolInfo | null> => {
    if (!publicClient || !contractAddresses) return null

    try {
      // 获取池子基础信息
      const [reserves, totalSupply] = await Promise.all([
        publicClient.readContract({
          address: pairAddress,
          abi: PlanetPairV2ABI,
          functionName: 'getReserves',
        }) as Promise<[bigint, bigint, number]>,
        publicClient.readContract({
          address: pairAddress,
          abi: ERC20ABI,
          functionName: 'totalSupply',
        }) as Promise<bigint>
      ])

      // 获取用户LP余额
      let userLPBalance = '0'
      if (address) {
        try {
          const balance = await publicClient.readContract({
            address: pairAddress,
            abi: ERC20ABI,
            functionName: 'balanceOf',
            args: [address],
          }) as bigint
          userLPBalance = formatUnits(balance, 18)
        } catch (err) {
          console.warn('获取用户LP余额失败:', err)
        }
      }

      // 确定token0和token1的顺序
      const [actualTokenA, actualTokenB] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
        ? [tokenA, tokenB]
        : [tokenB, tokenA]

      const [reserve0, reserve1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
        ? [reserves[0], reserves[1]]
        : [reserves[1], reserves[0]]

      // 计算TVL (简化计算，实际应该使用价格oracle)
      const reserve0Formatted = formatUnits(reserve0, actualTokenA.decimals)
      const reserve1Formatted = formatUnits(reserve1, actualTokenB.decimals)
      
      // 假设每个代币价值$1 (实际项目中应该从价格oracle获取)
      const tvlUSD = (parseFloat(reserve0Formatted) + parseFloat(reserve1Formatted)).toString()

      // 计算APY (简化计算，实际应该基于历史交易数据)
      const baseAPY = Math.random() * 20 + 5 // 5-25% 的随机APY
      
      const poolInfo: PoolInfo = {
        id: `v2-${pairAddress}`,
        version: 'v2',
        chainId: currentChainId,
        tokenA: actualTokenA,
        tokenB: actualTokenB,
        pairAddress,
        reserve0: reserve0Formatted,
        reserve1: reserve1Formatted,
        totalSupply: formatUnits(totalSupply, 18),
        tvlUSD,
        volume24hUSD: (Math.random() * 10000).toFixed(0),  // 模拟24h交易量
        volume7dUSD: (Math.random() * 70000).toFixed(0),   // 模拟7d交易量
        fees24hUSD: (parseFloat(tvlUSD) * 0.0025).toFixed(2), // 0.25% 的费用
        apy: baseAPY.toFixed(2),
        apy7d: (baseAPY * 0.9).toFixed(2),
        userLiquidityUSD: userLPBalance !== '0' ? (parseFloat(userLPBalance) * parseFloat(tvlUSD) / parseFloat(formatUnits(totalSupply, 18))).toFixed(2) : '0',
        userLPBalance,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // 随机30天内创建
        updatedAt: Date.now()
      }

      return poolInfo
    } catch (err) {
      console.error(`获取V2池子详情失败 ${tokenA.symbol}/${tokenB.symbol}:`, err)
      return null
    }
  }, [publicClient, address, contractAddresses, currentChainId])

  // 🎯 获取所有V2池子的详细信息
  const getAllV2Pools = useCallback(async (): Promise<PoolInfo[]> => {
    console.log('🏊‍♂️ 开始获取所有V2池子信息...')
    
    const poolAddresses = await getV2PoolAddresses()
    const pools: PoolInfo[] = []

    // 并发获取所有池子的详细信息
    const poolDetailsPromises = poolAddresses.map(({ tokenA, tokenB, pairAddress }) =>
      getV2PoolDetails(tokenA, tokenB, pairAddress)
    )

    const poolDetails = await Promise.all(poolDetailsPromises)

    poolDetails.forEach(pool => {
      if (pool) {
        pools.push(pool)
      }
    })

    console.log(`✅ 获取到 ${pools.length} 个V2池子`)
    return pools
  }, [getV2PoolAddresses, getV2PoolDetails])

  // 🎯 获取V3池子信息 (TODO: 待实现)
  const getAllV3Pools = useCallback(async (): Promise<PoolInfo[]> => {
    // TODO: 实现V3池子数据获取
    console.log('📝 V3池子功能待实现')
    return []
  }, [])

  // 🎯 刷新所有池子数据
  const refreshPools = useCallback(async () => {
    console.log('🔄 开始刷新池子数据...')
    console.log('🌐 当前链ID:', currentChainId)
    console.log('🏭 Factory地址:', v2FactoryAddress)
    console.log('🪙 代币数量:', tokens.length)
    
    if (!contractAddresses) {
      setError(`不支持的网络: ${currentChainId}`)
      setIsLoading(false)
      return
    }
    
    if (!v2FactoryAddress) {
      setError('Factory合约地址未配置')
      setIsLoading(false)
      return
    }
    
    if (tokens.length === 0) {
      console.log('⏳ Waiting for token list to load...')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [v2Pools, v3Pools] = await Promise.all([
        getAllV2Pools(),
        getAllV3Pools()
      ])

      const allPoolsData = [...v2Pools, ...v3Pools]
      setAllPools(allPoolsData)

      console.log('🎉 池子数据刷新完成:', {
        chainId: currentChainId,
        factoryAddress: v2FactoryAddress,
        tokenCount: tokens.length,
        v2Count: v2Pools.length,
        v3Count: v3Pools.length,
        totalCount: allPoolsData.length
      })
    } catch (err: any) {
      console.error('❌ 刷新池子数据失败:', err)
      setError(err.message || '获取池子数据失败')
    } finally {
      setIsLoading(false)
    }
  }, [tokens, getAllV2Pools, getAllV3Pools, currentChainId, contractAddresses, v2FactoryAddress])

  // 🎯 初始化加载和定期刷新
  useEffect(() => {
    refreshPools()
    
    // 每30秒刷新一次数据
    const interval = setInterval(refreshPools, 30 * 1000)
    return () => clearInterval(interval)
  }, [refreshPools])

  // 🎯 计算统计数据
  const stats = useMemo(() => {
    const v2Pools = allPools.filter(pool => pool.version === 'v2')
    const v3Pools = allPools.filter(pool => pool.version === 'v3')
    
    const totalTVL = allPools.reduce((sum, pool) => sum + parseFloat(pool.tvlUSD || '0'), 0)
    const totalVolume24h = allPools.reduce((sum, pool) => sum + parseFloat(pool.volume24hUSD || '0'), 0)
    const totalFees24h = allPools.reduce((sum, pool) => sum + parseFloat(pool.fees24hUSD || '0'), 0)

    return {
      v2Pools,
      v3Pools,
      totalTVL: Math.round(totalTVL),
      totalVolume24h: Math.round(totalVolume24h),
      totalFees24h: Math.round(totalFees24h),
      poolCount: allPools.length
    }
  }, [allPools])

  return {
    allPools,
    v2Pools: stats.v2Pools,
    v3Pools: stats.v3Pools,
    isLoading,
    error,
    totalTVL: stats.totalTVL,
    totalVolume24h: stats.totalVolume24h,
    totalFees24h: stats.totalFees24h,
    poolCount: stats.poolCount,
    refreshPools
  }
}

// 导出PoolInfo类型供其他组件使用
export type { PoolInfo }




