import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useChainId } from 'wagmi'

// Subgraph endpoints for different providers and chains
const SUBGRAPH_PROVIDERS = {
  // Local Graph Node (development) - V2+V3 Mixed Subgraph
  local: {
    1952: 'http://localhost:8000/subgraphs/name/planetswap/v2-v3',
  },
  // Goldsky (recommended for production) 
  goldsky: {
    1952: 'https://api.goldsky.com/api/public/project_<YOUR_PROJECT_ID>/subgraphs/planetswap-v2/gn',
  },
  // Alchemy Subgraphs
  alchemy: {
    1952: 'https://<YOUR_PROJECT>.alchemy.com/subgraphs/api/subgraphs/id/<SUBGRAPH_ID>',
  },
  // Envio (high performance)
  envio: {
    1952: 'https://indexer.bigdevenergy.link/<YOUR_INDEXER_ID>/v1/graphql',
  },
  // Fallback to PancakeSwap for testing
  fallback: {
    1952: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/7xd5KmL3FbzRYbmAM9SSe4wdrsJV71pJQhCBqzU7y8Qi',
  }
}

// Current provider - change this to switch providers
const CURRENT_PROVIDER: keyof typeof SUBGRAPH_PROVIDERS = 'local' // Using our V2+V3 Mixed Subgraph

const SUBGRAPH_URLS = SUBGRAPH_PROVIDERS[CURRENT_PROVIDER]

// GraphQL queries
const GET_V2_PAIRS = gql`
  query getV2Pairs($first: Int!, $orderBy: String!, $orderDirection: String!) {
    pairs(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
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
      reserveUSD
      volumeUSD
      totalTransactions
      totalSupply
      createdAtTimestamp: timestamp
      createdAtBlockNumber: block
    }
  }
`

const GET_V3_POOLS = gql`
  query getV3Pools($first: Int!, $orderBy: String!, $orderDirection: String!) {
    v3Pools(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
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
      feeTier
      sqrtPrice
      tick
      liquidity
      totalValueLockedUSD
      volumeUSD
      txCount
      createdAtTimestamp
      createdAtBlockNumber
    }
  }
`

export interface SubgraphToken {
  id: string
  symbol: string
  name: string
  decimals: string
}

export interface SubgraphV2Pair {
  id: string
  token0: SubgraphToken
  token1: SubgraphToken
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  totalTransactions: string
  totalSupply: string
  createdAtTimestamp: string
  createdAtBlockNumber: string
}

export interface SubgraphV3Pool {
  id: string
  token0: SubgraphToken
  token1: SubgraphToken
  feeTier: string
  sqrtPrice: string
  tick: string
  liquidity: string
  totalValueLockedUSD: string
  volumeUSD: string
  txCount: string
  createdAtTimestamp: string
  createdAtBlockNumber: string
}

export interface SubgraphPoolsResponse {
  v2Pairs: SubgraphV2Pair[]
  v3Pools: SubgraphV3Pool[]
}

// Hook to fetch all pools from subgraph
export function useSubgraphPools(
  options: {
    first?: number
    orderBy?: 'reserveUSD' | 'totalValueLockedUSD' | 'volumeUSD' | 'txCount'
    orderDirection?: 'asc' | 'desc'
    enabled?: boolean
  } = {}
) {
  const chainId = useChainId()
  
  const {
    first = 1000,
    orderBy = 'reserveUSD',
    orderDirection = 'desc',
    enabled = true,
  } = options

  const subgraphUrl = SUBGRAPH_URLS[chainId as keyof typeof SUBGRAPH_URLS]

  return useQuery({
    queryKey: ['subgraph-pools', chainId, first, orderBy, orderDirection],
    queryFn: async (): Promise<SubgraphPoolsResponse> => {
      if (!subgraphUrl) {
        console.warn(`No subgraph URL configured for chainId ${chainId}`)
        return { v2Pairs: [], v3Pools: [] }
      }

      try {
        // Fetch V2 pairs
        const v2Response = await request(subgraphUrl, GET_V2_PAIRS, {
          first,
          orderBy: orderBy === 'totalValueLockedUSD' ? 'reserveUSD' : orderBy,
          orderDirection,
        })

        // For testing, also try to fetch V3 pools if available
        let v3Pools: SubgraphV3Pool[] = []
        try {
          const v3Response = await request(subgraphUrl, GET_V3_POOLS, {
            first,
            orderBy: orderBy === 'reserveUSD' ? 'totalValueLockedUSD' : orderBy,
            orderDirection,
          })
          v3Pools = v3Response.pools || []
        } catch (v3Error) {
          console.log('V3 pools not available:', v3Error)
        }

        return {
          v2Pairs: v2Response.pairs || [],
          v3Pools,
        }
      } catch (error) {
        console.error('Failed to fetch pools from subgraph:', error)
        throw error
      }
    },
    enabled: enabled && !!subgraphUrl,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

// Hook to get formatted pools for UI
export function useFormattedSubgraphPools(options = {}) {
  const { data, isLoading, error } = useSubgraphPools(options)

  const formattedPools = React.useMemo(() => {
    if (!data) return []

    const allPools = [
      ...data.v2Pairs.map(pair => ({
        id: pair.id,
        version: 'v2' as const,
        token0: {
          address: pair.token0.id,
          symbol: pair.token0.symbol,
          name: pair.token0.name,
          decimals: parseInt(pair.token0.decimals),
        },
        token1: {
          address: pair.token1.id,
          symbol: pair.token1.symbol,
          name: pair.token1.name,
          decimals: parseInt(pair.token1.decimals),
        },
        tvl: parseFloat(pair.reserveUSD),
        volume24h: parseFloat(pair.volumeUSD),
        txCount: parseInt(pair.totalTransactions),
        apy: Math.random() * 50, // Placeholder - calculate real APY
        reserve0: parseFloat(pair.reserve0),
        reserve1: parseFloat(pair.reserve1),
        totalSupply: parseFloat(pair.totalSupply),
        fee: 0.0025, // 0.25% for V2
      })),
      ...data.v3Pools.map(pool => ({
        id: pool.id,
        version: 'v3' as const,
        token0: {
          address: pool.token0.id,
          symbol: pool.token0.symbol,
          name: pool.token0.name,
          decimals: parseInt(pool.token0.decimals),
        },
        token1: {
          address: pool.token1.id,
          symbol: pool.token1.symbol,
          name: pool.token1.name,
          decimals: parseInt(pool.token1.decimals),
        },
        tvl: parseFloat(pool.totalValueLockedUSD),
        volume24h: parseFloat(pool.volumeUSD),
        txCount: parseInt(pool.txCount),
        apy: Math.random() * 100, // Placeholder - calculate real APY
        liquidity: pool.liquidity,
        sqrtPrice: pool.sqrtPrice,
        tick: parseInt(pool.tick),
        fee: parseInt(pool.feeTier) / 10000, // Convert from basis points
      }))
    ]

    return allPools.sort((a, b) => b.tvl - a.tvl)
  }, [data])

  return {
    pools: formattedPools,
    isLoading,
    error,
    v2Count: data?.v2Pairs.length || 0,
    v3Count: data?.v3Pools.length || 0,
  }
}


import { gql, request } from 'graphql-request'
import { useChainId } from 'wagmi'

// Subgraph endpoints for different providers and chains
const SUBGRAPH_PROVIDERS = {
  // Local Graph Node (development) - V2+V3 Mixed Subgraph
  local: {
    1952: 'http://localhost:8000/subgraphs/name/planetswap/v2-v3',
  },
  // Goldsky (recommended for production) 
  goldsky: {
    1952: 'https://api.goldsky.com/api/public/project_<YOUR_PROJECT_ID>/subgraphs/planetswap-v2/gn',
  },
  // Alchemy Subgraphs
  alchemy: {
    1952: 'https://<YOUR_PROJECT>.alchemy.com/subgraphs/api/subgraphs/id/<SUBGRAPH_ID>',
  },
  // Envio (high performance)
  envio: {
    1952: 'https://indexer.bigdevenergy.link/<YOUR_INDEXER_ID>/v1/graphql',
  },
  // Fallback to PancakeSwap for testing
  fallback: {
    1952: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/7xd5KmL3FbzRYbmAM9SSe4wdrsJV71pJQhCBqzU7y8Qi',
  }
}

// Current provider - change this to switch providers
const CURRENT_PROVIDER: keyof typeof SUBGRAPH_PROVIDERS = 'local' // Using our V2+V3 Mixed Subgraph

const SUBGRAPH_URLS = SUBGRAPH_PROVIDERS[CURRENT_PROVIDER]

// GraphQL queries
const GET_V2_PAIRS = gql`
  query getV2Pairs($first: Int!, $orderBy: String!, $orderDirection: String!) {
    pairs(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
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
      reserveUSD
      volumeUSD
      totalTransactions
      totalSupply
      createdAtTimestamp: timestamp
      createdAtBlockNumber: block
    }
  }
`

const GET_V3_POOLS = gql`
  query getV3Pools($first: Int!, $orderBy: String!, $orderDirection: String!) {
    v3Pools(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
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
      feeTier
      sqrtPrice
      tick
      liquidity
      totalValueLockedUSD
      volumeUSD
      txCount
      createdAtTimestamp
      createdAtBlockNumber
    }
  }
`

export interface SubgraphToken {
  id: string
  symbol: string
  name: string
  decimals: string
}

export interface SubgraphV2Pair {
  id: string
  token0: SubgraphToken
  token1: SubgraphToken
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  totalTransactions: string
  totalSupply: string
  createdAtTimestamp: string
  createdAtBlockNumber: string
}

export interface SubgraphV3Pool {
  id: string
  token0: SubgraphToken
  token1: SubgraphToken
  feeTier: string
  sqrtPrice: string
  tick: string
  liquidity: string
  totalValueLockedUSD: string
  volumeUSD: string
  txCount: string
  createdAtTimestamp: string
  createdAtBlockNumber: string
}

export interface SubgraphPoolsResponse {
  v2Pairs: SubgraphV2Pair[]
  v3Pools: SubgraphV3Pool[]
}

// Hook to fetch all pools from subgraph
export function useSubgraphPools(
  options: {
    first?: number
    orderBy?: 'reserveUSD' | 'totalValueLockedUSD' | 'volumeUSD' | 'txCount'
    orderDirection?: 'asc' | 'desc'
    enabled?: boolean
  } = {}
) {
  const chainId = useChainId()
  
  const {
    first = 1000,
    orderBy = 'reserveUSD',
    orderDirection = 'desc',
    enabled = true,
  } = options

  const subgraphUrl = SUBGRAPH_URLS[chainId as keyof typeof SUBGRAPH_URLS]

  return useQuery({
    queryKey: ['subgraph-pools', chainId, first, orderBy, orderDirection],
    queryFn: async (): Promise<SubgraphPoolsResponse> => {
      if (!subgraphUrl) {
        console.warn(`No subgraph URL configured for chainId ${chainId}`)
        return { v2Pairs: [], v3Pools: [] }
      }

      try {
        // Fetch V2 pairs
        const v2Response = await request(subgraphUrl, GET_V2_PAIRS, {
          first,
          orderBy: orderBy === 'totalValueLockedUSD' ? 'reserveUSD' : orderBy,
          orderDirection,
        })

        // For testing, also try to fetch V3 pools if available
        let v3Pools: SubgraphV3Pool[] = []
        try {
          const v3Response = await request(subgraphUrl, GET_V3_POOLS, {
            first,
            orderBy: orderBy === 'reserveUSD' ? 'totalValueLockedUSD' : orderBy,
            orderDirection,
          })
          v3Pools = v3Response.pools || []
        } catch (v3Error) {
          console.log('V3 pools not available:', v3Error)
        }

        return {
          v2Pairs: v2Response.pairs || [],
          v3Pools,
        }
      } catch (error) {
        console.error('Failed to fetch pools from subgraph:', error)
        throw error
      }
    },
    enabled: enabled && !!subgraphUrl,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

// Hook to get formatted pools for UI
export function useFormattedSubgraphPools(options = {}) {
  const { data, isLoading, error } = useSubgraphPools(options)

  const formattedPools = React.useMemo(() => {
    if (!data) return []

    const allPools = [
      ...data.v2Pairs.map(pair => ({
        id: pair.id,
        version: 'v2' as const,
        token0: {
          address: pair.token0.id,
          symbol: pair.token0.symbol,
          name: pair.token0.name,
          decimals: parseInt(pair.token0.decimals),
        },
        token1: {
          address: pair.token1.id,
          symbol: pair.token1.symbol,
          name: pair.token1.name,
          decimals: parseInt(pair.token1.decimals),
        },
        tvl: parseFloat(pair.reserveUSD),
        volume24h: parseFloat(pair.volumeUSD),
        txCount: parseInt(pair.totalTransactions),
        apy: Math.random() * 50, // Placeholder - calculate real APY
        reserve0: parseFloat(pair.reserve0),
        reserve1: parseFloat(pair.reserve1),
        totalSupply: parseFloat(pair.totalSupply),
        fee: 0.0025, // 0.25% for V2
      })),
      ...data.v3Pools.map(pool => ({
        id: pool.id,
        version: 'v3' as const,
        token0: {
          address: pool.token0.id,
          symbol: pool.token0.symbol,
          name: pool.token0.name,
          decimals: parseInt(pool.token0.decimals),
        },
        token1: {
          address: pool.token1.id,
          symbol: pool.token1.symbol,
          name: pool.token1.name,
          decimals: parseInt(pool.token1.decimals),
        },
        tvl: parseFloat(pool.totalValueLockedUSD),
        volume24h: parseFloat(pool.volumeUSD),
        txCount: parseInt(pool.txCount),
        apy: Math.random() * 100, // Placeholder - calculate real APY
        liquidity: pool.liquidity,
        sqrtPrice: pool.sqrtPrice,
        tick: parseInt(pool.tick),
        fee: parseInt(pool.feeTier) / 10000, // Convert from basis points
      }))
    ]

    return allPools.sort((a, b) => b.tvl - a.tvl)
  }, [data])

  return {
    pools: formattedPools,
    isLoading,
    error,
    v2Count: data?.v2Pairs.length || 0,
    v3Count: data?.v3Pools.length || 0,
  }
}




