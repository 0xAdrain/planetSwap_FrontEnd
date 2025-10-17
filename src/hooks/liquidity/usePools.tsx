import { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { Token } from '../contracts/useTokens'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'

export interface PoolInfo {
  tokenA: Token
  tokenB: Token  
  pairAddress: string
  reserve0: string
  reserve1: string
  totalSupply: string
  token0: string
  token1: string
  exists: boolean
  isV3?: boolean  // V3池子标识
  // 🚨 移除假数据字段 - 这些应该从真实数据源获取
  // liquidityUSD?: string    // TODO: 从price oracle计算
  // volume24h?: string       // TODO: 从链上事件计算
  // fees24h?: string         // TODO: 从手续费累计计算  
  // apy?: string             // TODO: 从历史数据计算
  // userLiquidity?: string   // TODO: 从LP代币余额和价格计算
  userShare?: string          // 用户持有份额百分比
}

/**
 * 🥞 PancakeSwap风格的池子信息Hook
 * 获取流动性池的详细信息
 */
export function usePools(tokenA?: Token, tokenB?: Token) {
  const { address } = useAccount()
  const [pools, setPools] = useState<PoolInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 🎯 获取合约地址
  const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
  const factoryAddress = contracts.PLANET_FACTORY

  // 🎯 获取配对地址
  const { data: pairAddress, isLoading: isPairLoading } = useReadContract({
    address: factoryAddress as `0x${string}`,
    abi: [
      {
        name: 'getPair',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { type: 'address', name: 'tokenA' },
          { type: 'address', name: 'tokenB' }
        ],
        outputs: [{ type: 'address' }]
      }
    ],
    functionName: 'getPair',
    args: tokenA && tokenB ? [
      tokenA.address as `0x${string}`,
      tokenB.address as `0x${string}`
    ] : undefined,
    enabled: !!(tokenA && tokenB && factoryAddress)
  })

  // 🎯 获取池子详细信息
  const { data: poolData, isLoading: isPoolLoading } = useReadContracts({
    contracts: pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000' ? [
      {
        address: pairAddress as `0x${string}`,
        abi: [
          {
            name: 'getReserves',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [
              { type: 'uint112', name: '_reserve0' },
              { type: 'uint112', name: '_reserve1' },
              { type: 'uint32', name: '_blockTimestampLast' }
            ]
          }
        ],
        functionName: 'getReserves'
      },
      {
        address: pairAddress as `0x${string}`,
        abi: [
          {
            name: 'totalSupply',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'uint256' }]
          }
        ],
        functionName: 'totalSupply'
      },
      {
        address: pairAddress as `0x${string}`,
        abi: [
          {
            name: 'token0',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'address' }]
          }
        ],
        functionName: 'token0'
      },
      {
        address: pairAddress as `0x${string}`,
        abi: [
          {
            name: 'token1',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'address' }]
          }
        ],
        functionName: 'token1'
      }
    ] : undefined,
    enabled: !!(pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000')
  })

  // 🎯 获取用户LP代币余额
  const { data: userLPBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: 'account' }],
        outputs: [{ type: 'uint256' }]
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!(pairAddress && address && pairAddress !== '0x0000000000000000000000000000000000000000')
  })

  // 🎯 处理池子信息
  const poolInfo = useMemo(() => {
    if (!tokenA || !tokenB || !pairAddress || !poolData) {
      return null
    }

    if (pairAddress === '0x0000000000000000000000000000000000000000') {
      return {
        tokenA,
        tokenB,
        pairAddress: '',
        reserve0: '0',
        reserve1: '0',
        totalSupply: '0',
        token0: '',
        token1: '',
        exists: false
      }
    }

    try {
      const [reservesResult, totalSupplyResult, token0Result, token1Result] = poolData

      if (!reservesResult.result || !totalSupplyResult.result || !token0Result.result || !token1Result.result) {
        return null
      }

      const [reserve0, reserve1] = reservesResult.result as [bigint, bigint, number]
      const totalSupply = totalSupplyResult.result as bigint
      const token0 = token0Result.result as string
      const token1 = token1Result.result as string

      // 🎯 根据token0/token1地址确定储备量对应关系
      const isTokenAFirst = tokenA.address.toLowerCase() === token0.toLowerCase()
      
      const pool: PoolInfo = {
        tokenA,
        tokenB,
        pairAddress: pairAddress as string,
        reserve0: formatUnits(reserve0, 18),
        reserve1: formatUnits(reserve1, 18),
        totalSupply: formatUnits(totalSupply, 18),
        token0,
        token1,
        exists: true,
        // 🚨 移除假数据 - 这些数据应从真实数据源获取
        // TODO: 实现真实的liquidityUSD, volume24h, fees24h, apy计算
      }

      // 🎯 计算用户持有量
      if (userLPBalance && Number(userLPBalance) > 0) {
        const userLPPercent = Number(userLPBalance) / Number(totalSupply)
        // TODO: 实现真实的用户流动性USD价值计算
        pool.userShare = `${(userLPPercent * 100).toFixed(2)}%`
      }

      console.log('🏊‍♂️ 池子信息:', {
        pair: `${tokenA.symbol}/${tokenB.symbol}`,
        pairAddress,
        reserve0: pool.reserve0,
        reserve1: pool.reserve1,
        totalSupply: pool.totalSupply,
        exists: pool.exists,
        userLPBalance: userLPBalance?.toString()
      })

      return pool
    } catch (error) {
      console.error('❌ 解析池子数据失败:', error)
      return null
    }
  }, [tokenA, tokenB, pairAddress, poolData, userLPBalance])

  // 🎯 检查池子是否存在
  const checkPoolExists = async (tokenA: Token, tokenB: Token): Promise<boolean> => {
    try {
      // TODO: 实现池子存在性检查
      return false
    } catch (error) {
      console.error('❌ 检查池子失败:', error)
      return false
    }
  }

  // 🎯 获取所有池子（用于Your Liquidity页面）
  const getAllUserPools = async () => {
    if (!address) return []
    
    try {
      setIsLoading(true)
      // TODO: 实现获取用户所有池子的逻辑
      // 这需要监听AddLiquidity事件或使用Graph Protocol
      
      // 🚨 移除假数据 - 应该从事件日志或Graph Protocol获取真实用户池子
      const realPools: PoolInfo[] = []
      setPools(realPools)
      return realPools
    } catch (error) {
      console.error('❌ 获取用户池子失败:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // 🎯 当前池子信息
    poolInfo,
    pairAddress: pairAddress as string,
    isLoading: isPairLoading || isPoolLoading,
    
    // 🎯 所有池子
    pools,
    isPoolsLoading: isLoading,
    
    // 🎯 工具函数
    checkPoolExists,
    getAllUserPools,
    
    // 🎯 合约地址
    factoryAddress
  }
}




