import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Token, useTokens } from '../contracts/useTokens'
// Subgraph endpoints - 与useSubgraphPools保持一致
const SUBGRAPH_PROVIDERS = {
  // Local Graph Node (development) - V2+V3 Mixed Subgraph
  local: {
    1952: 'http://localhost:8000/subgraphs/name/planetswap/v2-v3',
  },
}

export interface UserLPPosition {
  id: string
  tokenA: Token
  tokenB: Token
  pairAddress: string
  lpBalance: bigint
  lpBalanceFormatted: string
  reserve0: string
  reserve1: string
  totalSupply: string
  userShare: string
  userLiquidityUSD?: string
  isV3?: boolean
  // V3特有字段
  tokenId?: bigint
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
  unclaimedFees0?: string
  unclaimedFees1?: string
}

interface SubgraphV2LiquidityPosition {
  id: string
  liquidityTokenBalance: string
  pair: {
    id: string
    token0: {
      id: string
      symbol: string
      name: string
      decimals: string
    }
    token1: {
      id: string
      symbol: string
      name: string
      decimals: string
    }
    reserve0: string
    reserve1: string
    totalSupply: string
  }
}

interface SubgraphV3Position {
  id: string
  owner: string
  pool: {
    id: string
    token0: {
      id: string
      symbol: string
      name: string
      decimals: string
    }
    token1: {
      id: string
      symbol: string
      name: string
      decimals: string
    }
  }
  tokenId: string
  tickLower: {
    tickIdx: string
  }
  tickUpper: {
    tickIdx: string
  }
  liquidity: string
  feeGrowthInside0LastX128: string
  feeGrowthInside1LastX128: string
}

// GraphQL查询
const GET_USER_V2_LIQUIDITY = `
  query GetUserV2Liquidity($userAddress: String!) {
    user(id: $userAddress) {
      liquidityPositions(where: { liquidityTokenBalance_gt: "0" }) {
        id
        liquidityTokenBalance
        pair {
          id
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          reserve0
          reserve1
          totalSupply
        }
      }
    }
  }
`

const GET_USER_V3_POSITIONS = `
  query GetUserV3Positions($userAddress: String!) {
    v3Positions(where: { owner: $userAddress, liquidity_gt: "0" }) {
      id
      owner
      pool {
        id
        token0 {
          id
          symbol
          name
          decimals
        }
        token1 {
          id
          symbol
          name
          decimals
        }
      }
      tokenId
      tickLower {
        tickIdx
      }
      tickUpper {
        tickIdx
      }
      liquidity
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`

/**
 * 🎯 基于Subgraph的用户流动性Hook
 * 获取用户在owner钱包中的真实流动性持仓
 */
export function useUserLiquiditySubgraph() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { tokens, findTokenByAddress } = useTokens()
  const [userPositions, setUserPositions] = useState<UserLPPosition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🎯 Subgraph endpoint
  const subgraphUrl = useMemo(() => {
    const provider = 'local' // 使用本地Subgraph
    const endpoints = SUBGRAPH_PROVIDERS[provider]
    const endpoint = endpoints ? endpoints[chainId] || endpoints[1952] : null
    console.log('🔗 使用Subgraph端点:', endpoint, 'Chain ID:', chainId)
    return endpoint
  }, [chainId])

  // 🔍 查询用户V2流动性
  const fetchUserV2Liquidity = useCallback(async (userAddress: string): Promise<UserLPPosition[]> => {
    if (!subgraphUrl) return []

    try {
      console.log('🔍 查询用户V2流动性:', userAddress)
      
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_USER_V2_LIQUIDITY,
          variables: { userAddress: userAddress.toLowerCase() }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        console.error('❌ V2流动性查询错误:', result.errors)
        return []
      }

      const user = result.data?.user
      if (!user || !user.liquidityPositions) {
        console.log('📭 用户无V2流动性持仓')
        return []
      }

      console.log('📊 找到V2流动性持仓:', user.liquidityPositions.length)

      const v2Positions: UserLPPosition[] = user.liquidityPositions.map((position: SubgraphV2LiquidityPosition) => {
        const { pair } = position
        
        // 尝试匹配本地代币
        const tokenA = findTokenByAddress(pair.token0.id) || {
          address: pair.token0.id,
          symbol: pair.token0.symbol,
          name: pair.token0.name,
          decimals: parseInt(pair.token0.decimals),
          isNative: false
        }
        
        const tokenB = findTokenByAddress(pair.token1.id) || {
          address: pair.token1.id,
          symbol: pair.token1.symbol,
          name: pair.token1.name,
          decimals: parseInt(pair.token1.decimals),
          isNative: false
        }

        // 计算用户份额
        const lpBalance = BigInt(position.liquidityTokenBalance || '0')
        const totalSupply = parseFloat(pair.totalSupply)
        const userBalance = parseFloat(position.liquidityTokenBalance)
        const userShare = totalSupply > 0 ? ((userBalance / totalSupply) * 100).toFixed(4) + '%' : '0%'

        return {
          id: position.id,
          tokenA,
          tokenB,
          pairAddress: pair.id,
          lpBalance,
          lpBalanceFormatted: (userBalance / Math.pow(10, 18)).toFixed(6),
          reserve0: pair.reserve0,
          reserve1: pair.reserve1,
          totalSupply: pair.totalSupply,
          userShare,
          isV3: false
        }
      })

      console.log('✅ V2流动性处理完成:', v2Positions.length)
      return v2Positions

    } catch (error) {
      console.error('❌ 获取V2流动性失败:', error)
      return []
    }
  }, [subgraphUrl, findTokenByAddress])

  // 🎨 查询用户V3持仓
  const fetchUserV3Positions = useCallback(async (userAddress: string): Promise<UserLPPosition[]> => {
    if (!subgraphUrl) return []

    try {
      console.log('🎨 查询用户V3持仓:', userAddress)
      
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_USER_V3_POSITIONS,
          variables: { userAddress: userAddress.toLowerCase() }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        console.error('❌ V3持仓查询错误:', result.errors)
        return []
      }

      const v3Positions = result.data?.v3Positions || []
      console.log('📊 找到V3持仓:', v3Positions.length)

      const positions: UserLPPosition[] = v3Positions.map((position: SubgraphV3Position) => {
        const { pool } = position
        
        // 尝试匹配本地代币
        const tokenA = findTokenByAddress(pool.token0.id) || {
          address: pool.token0.id,
          symbol: pool.token0.symbol,
          name: pool.token0.name,
          decimals: parseInt(pool.token0.decimals),
          isNative: false
        }
        
        const tokenB = findTokenByAddress(pool.token1.id) || {
          address: pool.token1.id,
          symbol: pool.token1.symbol,
          name: pool.token1.name,
          decimals: parseInt(pool.token1.decimals),
          isNative: false
        }

        return {
          id: position.id,
          tokenA,
          tokenB,
          pairAddress: pool.id,
          lpBalance: BigInt(position.liquidity || '0'),
          lpBalanceFormatted: (parseFloat(position.liquidity || '0') / Math.pow(10, 18)).toFixed(6),
          reserve0: '0', // V3没有固定储备量
          reserve1: '0',
          totalSupply: position.liquidity || '0',
          userShare: '100%', // NFT是独立持仓
          isV3: true,
          tokenId: BigInt(position.tokenId),
          tickLower: parseInt(position.tickLower.tickIdx),
          tickUpper: parseInt(position.tickUpper.tickIdx),
          inRange: true // 需要进一步计算
        }
      })

      console.log('✅ V3持仓处理完成:', positions.length)
      return positions

    } catch (error) {
      console.error('❌ 获取V3持仓失败:', error)
      return []
    }
  }, [subgraphUrl, findTokenByAddress])

  // 🔄 刷新用户流动性
  const refreshUserLiquidity = useCallback(async () => {
    if (!address) {
      setUserPositions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 开始刷新用户流动性 (Subgraph):', address)
      
      const [v2Positions, v3Positions] = await Promise.all([
        fetchUserV2Liquidity(address),
        fetchUserV3Positions(address)
      ])

      const allPositions = [...v2Positions, ...v3Positions]
      setUserPositions(allPositions)

      console.log('✅ 用户流动性刷新完成 (Subgraph):', {
        v2Count: v2Positions.length,
        v3Count: v3Positions.length,
        total: allPositions.length,
        userAddress: address
      })

    } catch (error: any) {
      console.error('❌ 刷新用户流动性失败 (Subgraph):', error)
      setError(error.message || 'Failed to fetch user liquidity from subgraph')
    } finally {
      setIsLoading(false)
    }
  }, [address, fetchUserV2Liquidity, fetchUserV3Positions])

  // 🎯 自动刷新
  useEffect(() => {
    refreshUserLiquidity()
  }, [refreshUserLiquidity])

  // 🎯 按版本筛选
  const v2Positions = userPositions.filter(p => !p.isV3)
  const v3Positions = userPositions.filter(p => p.isV3)

  return {
    // 数据
    userPositions,
    v2Positions,
    v3Positions,
    
    // 状态
    isLoading,
    error,
    
    // 方法
    refreshUserLiquidity,
    
    // 统计
    totalPositions: userPositions.length,
    hasV2Positions: v2Positions.length > 0,
    hasV3Positions: v3Positions.length > 0
  }
}
