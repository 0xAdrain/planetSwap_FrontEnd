import { useState } from 'react'
import styled from '@emotion/styled'
import { 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const FilterContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
`

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const FilterTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const FilterGroup = styled.div``

const FilterLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
`

const FilterSelect = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
  }
  
  option {
    background: #1a1a1a;
    color: white;
  }
`

const FilterInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
  }
`

interface PoolsFilterProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: FilterOptions) => void
}

export interface FilterOptions {
  minTVL?: number
  maxTVL?: number
  minAPY?: number
  maxAPY?: number
  tokenSymbol?: string
  version?: 'all' | 'v2' | 'v3'
}

/**
 * 🔍 池子高级过滤组件
 * 提供TVL、APY、代币等高级过滤选项
 */
export default function PoolsFilter({ isOpen, onClose, onFilterChange }: PoolsFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    version: 'all'
  })

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  if (!isOpen) return null

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <FunnelIcon className="w-5 h-5" />
          Advanced Filters
        </FilterTitle>
        <CloseButton onClick={onClose}>
          <XMarkIcon className="w-5 h-5" />
        </CloseButton>
      </FilterHeader>

      <FilterGrid>
        <FilterGroup>
          <FilterLabel>Version</FilterLabel>
          <FilterSelect
            value={filters.version}
            onChange={(e) => handleFilterChange('version', e.target.value)}
          >
            <option value="all">All Versions</option>
            <option value="v2">V2 Only</option>
            <option value="v3">V3 Only</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Token Symbol</FilterLabel>
          <FilterInput
            type="text"
            placeholder="e.g. ETH, USDT"
            value={filters.tokenSymbol || ''}
            onChange={(e) => handleFilterChange('tokenSymbol', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Min TVL ($)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="0"
            value={filters.minTVL || ''}
            onChange={(e) => handleFilterChange('minTVL', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Max TVL ($)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="No limit"
            value={filters.maxTVL || ''}
            onChange={(e) => handleFilterChange('maxTVL', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Min APY (%)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="0"
            step="0.1"
            value={filters.minAPY || ''}
            onChange={(e) => handleFilterChange('minAPY', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Max APY (%)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="No limit"
            step="0.1"
            value={filters.maxAPY || ''}
            onChange={(e) => handleFilterChange('maxAPY', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </FilterGroup>
      </FilterGrid>
    </FilterContainer>
  )
}
