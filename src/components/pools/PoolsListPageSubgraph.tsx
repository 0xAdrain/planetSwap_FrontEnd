import React, { useState, useMemo } from 'react'
import styled from '@emotion/styled'
import { useFormattedSubgraphPools } from '../../hooks/pools/useSubgraphPools'
import PoolCard from './PoolCard'

const Container = styled.div`
  padding: 20px;
  color: white;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
`

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'linear-gradient(90deg, #7b2cbf 0%, #9c4dcc 100%)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? '#7b2cbf' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(90deg, #7b2cbf 0%, #9c4dcc 100%)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
  }
`

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 0.9rem;
  width: 200px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #7b2cbf;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
`

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #ff6b6b;
  font-size: 1.1rem;
`

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
`

type FilterType = 'all' | 'v2' | 'v3'
type SortBy = 'tvl' | 'volume' | 'apy'

const PoolsListPageSubgraph: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('tvl')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch pools from subgraph
  const { pools, isLoading, error, v2Count, v3Count } = useFormattedSubgraphPools({
    first: 1000,
    orderBy: 'reserveUSD',
    orderDirection: 'desc'
  })

  // Filter and sort pools
  const filteredPools = useMemo(() => {
    let filtered = pools

    // Filter by version
    if (filter === 'v2') {
      filtered = filtered.filter(pool => pool.version === 'v2')
    } else if (filter === 'v3') {
      filtered = filtered.filter(pool => pool.version === 'v3')
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(pool => 
        pool.token0.symbol.toLowerCase().includes(term) ||
        pool.token1.symbol.toLowerCase().includes(term) ||
        `${pool.token0.symbol}/${pool.token1.symbol}`.toLowerCase().includes(term)
      )
    }

    // Sort pools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return b.tvl - a.tvl
        case 'volume':
          return b.volume24h - a.volume24h
        case 'apy':
          return b.apy - a.apy
        default:
          return 0
      }
    })

    return filtered
  }, [pools, filter, searchTerm, sortBy])

  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0)
    const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0)
    const avgAPY = pools.length > 0 ? pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length : 0

    return {
      totalTVL: totalTVL.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      totalVolume: totalVolume.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      avgAPY: avgAPY.toFixed(2)
    }
  }, [pools])

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          🚀 Loading pools from subgraph...
        </LoadingContainer>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          ❌ Failed to load pools: {error.message}
          <br />
          <small>Falling back to contract queries...</small>
        </ErrorContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>🌊 Liquidity Pools (Subgraph)</Title>
      </Header>

      {/* Stats Overview */}
      <StatsContainer>
        <StatCard>
          <StatLabel>Total Value Locked</StatLabel>
          <StatValue>{totalStats.totalTVL}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h Volume</StatLabel>
          <StatValue>{totalStats.totalVolume}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Average APY</StatLabel>
          <StatValue>{totalStats.avgAPY}%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>V2 Pools</StatLabel>
          <StatValue>{v2Count}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>V3 Pools</StatLabel>
          <StatValue>{v3Count}</StatValue>
        </StatCard>
      </StatsContainer>

      {/* Filters and Search */}
      <FilterContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All Pools ({pools.length})
        </FilterButton>
        <FilterButton 
          active={filter === 'v2'} 
          onClick={() => setFilter('v2')}
        >
          V2 Only ({v2Count})
        </FilterButton>
        <FilterButton 
          active={filter === 'v3'} 
          onClick={() => setFilter('v3')}
        >
          V3 Only ({v3Count})
        </FilterButton>

        <div style={{ marginLeft: '20px', marginRight: '20px', color: 'rgba(255, 255, 255, 0.3)' }}>|</div>

        <FilterButton 
          active={sortBy === 'tvl'} 
          onClick={() => setSortBy('tvl')}
        >
          Sort by TVL
        </FilterButton>
        <FilterButton 
          active={sortBy === 'volume'} 
          onClick={() => setSortBy('volume')}
        >
          Sort by Volume
        </FilterButton>
        <FilterButton 
          active={sortBy === 'apy'} 
          onClick={() => setSortBy('apy')}
        >
          Sort by APY
        </FilterButton>

        <div style={{ marginLeft: 'auto' }}>
          <SearchInput
            placeholder="Search pools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </FilterContainer>

      {/* Pools Grid */}
      {filteredPools.length === 0 ? (
        <EmptyContainer>
          <div>🔍 No pools found</div>
          <small style={{ marginTop: '10px', opacity: 0.7 }}>
            {searchTerm ? 'Try adjusting your search term' : 'No pools match the current filters'}
          </small>
        </EmptyContainer>
      ) : (
        <GridContainer>
          {filteredPools.map((pool) => (
            <PoolCard
              key={pool.id}
              pairAddress={pool.id}
              token0={{
                symbol: pool.token0.symbol,
                address: pool.token0.address as `0x${string}`,
                name: pool.token0.name,
                logoURI: '🪙'
              }}
              token1={{
                symbol: pool.token1.symbol,
                address: pool.token1.address as `0x${string}`,
                name: pool.token1.name,
                logoURI: '🪙'
              }}
              reserve0={pool.version === 'v2' ? pool.reserve0 : 0}
              reserve1={pool.version === 'v2' ? pool.reserve1 : 0}
              tvl={pool.tvl}
              apy={pool.apy}
              volume24h={pool.volume24h}
              version={pool.version}
              fee={pool.fee}
              userLiquidity="0"
            />
          ))}
        </GridContainer>
      )}
    </Container>
  )
}

export default PoolsListPageSubgraph

