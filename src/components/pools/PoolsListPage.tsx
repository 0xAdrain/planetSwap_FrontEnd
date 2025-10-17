import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import PoolCard from './PoolCard'
import { useAllPools } from '../../hooks/pools/useAllPools'

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const PageHeader = styled.div`
  margin-bottom: 32px;
`

const PageTitle = styled.h1`
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`

const PageSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(20px);
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 8px;
`

const StatValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 600;
`

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 12px 16px 12px 48px;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
`

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const SortButton = styled.button<{ active?: boolean; direction?: 'asc' | 'desc' }>`
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  
  svg {
    transform: ${props => props.direction === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }
`

const PoolsGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.6);
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
`

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`

type PoolVersion = 'all' | 'v2' | 'v3'
type SortField = 'tvl' | 'apy' | 'volume' | 'created'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

/**
 * 🏊‍♂️ 池子列表页面 - 显示所有V2/V3流动池
 * 严格对标PancakeSwap的池子管理功能
 */
export default function PoolsListPage() {
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [versionFilter, setVersionFilter] = useState<PoolVersion>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'tvl', direction: 'desc' })

  // 🎯 获取所有池子数据
  const {
    allPools,
    v2Pools,
    v3Pools,
    isLoading,
    error,
    totalTVL,
    totalVolume24h,
    totalFees24h,
    poolCount
  } = useAllPools()

  // 🔍 过滤和排序池子
  const filteredAndSortedPools = useMemo(() => {
    let pools = allPools

    // 版本过滤
    if (versionFilter === 'v2') {
      pools = v2Pools
    } else if (versionFilter === 'v3') {
      pools = v3Pools
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      pools = pools.filter(pool => 
        pool.tokenA.symbol.toLowerCase().includes(query) ||
        pool.tokenB.symbol.toLowerCase().includes(query) ||
        `${pool.tokenA.symbol}/${pool.tokenB.symbol}`.toLowerCase().includes(query)
      )
    }

    // 排序
    pools = [...pools].sort((a, b) => {
      const { field, direction } = sortConfig
      const multiplier = direction === 'asc' ? 1 : -1

      switch (field) {
        case 'tvl':
          return (parseFloat(a.tvlUSD || '0') - parseFloat(b.tvlUSD || '0')) * multiplier
        case 'apy':
          return (parseFloat(a.apy || '0') - parseFloat(b.apy || '0')) * multiplier
        case 'volume':
          return (parseFloat(a.volume24hUSD || '0') - parseFloat(b.volume24hUSD || '0')) * multiplier
        case 'created':
          return (a.createdAt - b.createdAt) * multiplier
        default:
          return 0
      }
    })

    return pools
  }, [allPools, v2Pools, v3Pools, searchQuery, versionFilter, sortConfig])

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState>
          <EmptyStateIcon>
            <EyeIcon className="w-8 h-8 text-red-400" />
          </EmptyStateIcon>
          <h3>Error Loading Pools</h3>
          <p>{error}</p>
        </EmptyState>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader>
        <PageTitle>
          <ChartBarIcon className="w-8 h-8 text-green-400" />
          Liquidity Pools
        </PageTitle>
        <PageSubtitle>
          Discover and manage liquidity pools across PlanetSwap
        </PageSubtitle>
      </PageHeader>

      {/* 统计信息 */}
      <StatsContainer>
        <StatCard>
          <StatLabel>Total Pools</StatLabel>
          <StatValue>{poolCount.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total TVL</StatLabel>
          <StatValue>${totalTVL.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h Volume</StatLabel>
          <StatValue>${totalVolume24h.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h Fees</StatLabel>
          <StatValue>${totalFees24h.toLocaleString()}</StatValue>
        </StatCard>
      </StatsContainer>

      {/* 搜索和过滤控件 */}
      <ControlsContainer>
        <SearchContainer>
          <SearchIcon>
            <MagnifyingGlassIcon className="w-5 h-5" />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search pools by token name or pair..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <FiltersContainer>
          {/* 版本过滤 */}
          <FilterButton
            active={versionFilter === 'all'}
            onClick={() => setVersionFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton
            active={versionFilter === 'v2'}
            onClick={() => setVersionFilter('v2')}
          >
            V2
          </FilterButton>
          <FilterButton
            active={versionFilter === 'v3'}
            onClick={() => setVersionFilter('v3')}
          >
            V3
          </FilterButton>

          {/* 排序按钮 */}
          <SortButton
            active={sortConfig.field === 'tvl'}
            direction={sortConfig.field === 'tvl' ? sortConfig.direction : 'desc'}
            onClick={() => handleSort('tvl')}
          >
            TVL
            <ArrowUpDownIcon className="w-4 h-4" />
          </SortButton>
          <SortButton
            active={sortConfig.field === 'apy'}
            direction={sortConfig.field === 'apy' ? sortConfig.direction : 'desc'}
            onClick={() => handleSort('apy')}
          >
            APY
            <ArrowUpDownIcon className="w-4 h-4" />
          </SortButton>
          <SortButton
            active={sortConfig.field === 'volume'}
            direction={sortConfig.field === 'volume' ? sortConfig.direction : 'desc'}
            onClick={() => handleSort('volume')}
          >
            Volume
            <ArrowUpDownIcon className="w-4 h-4" />
          </SortButton>
        </FiltersContainer>
      </ControlsContainer>

      {/* 池子列表 */}
      {isLoading ? (
        <LoadingContainer>
          <div>Loading pools...</div>
        </LoadingContainer>
      ) : filteredAndSortedPools.length > 0 ? (
        <PoolsGrid>
          {filteredAndSortedPools.map((pool) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PoolCard pool={pool} />
            </motion.div>
          ))}
        </PoolsGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <EyeIcon className="w-8 h-8 text-white" />
          </EmptyStateIcon>
          <h3>No pools found</h3>
          <p>
            {searchQuery 
              ? `No pools match "${searchQuery}"`
              : 'No liquidity pools available yet'
            }
          </p>
        </EmptyState>
      )}
    </PageContainer>
  )
}




