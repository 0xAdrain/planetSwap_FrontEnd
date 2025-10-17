import { useState } from 'react'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PoolInfo } from '../../hooks/pools/useAllPools'

const PoolCardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
`

const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`

const TokenPairSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIcons = styled.div`
  display: flex;
  position: relative;
`

const TokenIcon = styled.div<{ isSecond?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid rgba(0, 0, 0, 0.1);
  
  ${props => props.isSecond && `
    margin-left: -12px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  `}
`

const PoolNameSection = styled.div``

const PoolName = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
`

const PoolVersion = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const VersionBadge = styled.div<{ version: 'v2' | 'v3' }>`
  background: ${props => props.version === 'v3' 
    ? 'rgba(147, 51, 234, 0.2)' 
    : 'rgba(34, 197, 94, 0.2)'
  };
  border: 1px solid ${props => props.version === 'v3' 
    ? 'rgba(147, 51, 234, 0.3)' 
    : 'rgba(34, 197, 94, 0.3)'
  };
  border-radius: 12px;
  color: ${props => props.version === 'v3' ? '#a855f7' : '#22c55e'};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  text-transform: uppercase;
`

const FeeBadge = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 6px;
`

const PoolActions = styled.div`
  display: flex;
  gap: 8px;
`

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'primary' 
      ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
      : 'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => 
    props.variant === 'primary' 
      ? 'transparent'
      : 'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 10px;
  color: white;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => 
      props.variant === 'primary' 
        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        : 'rgba(255, 255, 255, 0.15)'
    };
    transform: scale(1.05);
  }
`

const PoolStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const StatValue = styled.div<{ highlight?: boolean }>`
  color: ${props => props.highlight ? '#22c55e' : 'white'};
  font-size: 16px;
  font-weight: 600;
`

const PoolMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const MetricItem = styled.div`
  text-align: center;
`

const MetricLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-bottom: 4px;
`

const MetricValue = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
`

const LiquidityBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin: 12px 0;
  overflow: hidden;
`

const LiquidityFill = styled.div<{ percentage: number }>`
  width: ${props => Math.min(props.percentage, 100)}%;
  height: 100%;
  background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
`

interface PoolCardProps {
  pool: PoolInfo
  onClick?: () => void
}

/**
 * 🏊‍♂️ 池子卡片组件 - 显示单个流动池的信息
 * 严格对标PancakeSwap的池子卡片设计
 */
export default function PoolCard({ pool, onClick }: PoolCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleAddLiquidity = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: 导航到Add liquidity页面
    console.log('Add liquidity to pool:', pool.id)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: 导航到池子详情页面
    console.log('View pool details:', pool.id)
  }

  // 计算流动性百分比（用于视觉效果）
  const liquidityPercentage = Math.min((parseFloat(pool.tvlUSD || '0') / 100000) * 100, 100)

  return (
    <PoolCardContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 池子头部信息 */}
      <PoolHeader>
        <TokenPairSection>
          <TokenIcons>
            <TokenIcon>
              {pool.tokenA.symbol.slice(0, 2)}
            </TokenIcon>
            <TokenIcon isSecond>
              {pool.tokenB.symbol.slice(0, 2)}
            </TokenIcon>
          </TokenIcons>
          <PoolNameSection>
            <PoolName>
              {pool.tokenA.symbol}/{pool.tokenB.symbol}
            </PoolName>
            <PoolVersion>
              <VersionBadge version={pool.version}>
                {pool.version.toUpperCase()}
              </VersionBadge>
              {pool.version === 'v3' && (
                <FeeBadge>
                  {(pool.feeTier || 3000) / 10000}%
                </FeeBadge>
              )}
            </PoolVersion>
          </PoolNameSection>
        </TokenPairSection>

        <PoolActions>
          <ActionButton
            variant="secondary"
            onClick={handleViewDetails}
            title="View Details"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleAddLiquidity}
            title="Add Liquidity"
          >
            <PlusIcon className="w-4 h-4" />
          </ActionButton>
        </PoolActions>
      </PoolHeader>

      {/* 主要统计信息 */}
      <PoolStats>
        <StatItem>
          <StatLabel>
            <CurrencyDollarIcon className="w-3 h-3" />
            TVL
          </StatLabel>
          <StatValue>
            ${parseFloat(pool.tvlUSD || '0').toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </StatValue>
        </StatItem>

        <StatItem>
          <StatLabel>
            <ChartBarIcon className="w-3 h-3" />
            APY
          </StatLabel>
          <StatValue highlight>
            {parseFloat(pool.apy || '0').toFixed(2)}%
          </StatValue>
        </StatItem>

        <StatItem>
          <StatLabel>
            <ClockIcon className="w-3 h-3" />
            24h Volume
          </StatLabel>
          <StatValue>
            ${parseFloat(pool.volume24hUSD || '0').toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </StatValue>
        </StatItem>

        <StatItem>
          <StatLabel>
            My Liquidity
          </StatLabel>
          <StatValue>
            ${parseFloat(pool.userLiquidityUSD || '0').toFixed(2)}
          </StatValue>
        </StatItem>
      </PoolStats>

      {/* 流动性可视化 */}
      <LiquidityBar>
        <LiquidityFill percentage={liquidityPercentage} />
      </LiquidityBar>

      {/* 额外指标 */}
      <PoolMetrics>
        <MetricItem>
          <MetricLabel>24h Fees</MetricLabel>
          <MetricValue>
            ${parseFloat(pool.fees24hUSD || '0').toFixed(0)}
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>7d APY</MetricLabel>
          <MetricValue>
            {parseFloat(pool.apy7d || '0').toFixed(2)}%
          </MetricValue>
        </MetricItem>
      </PoolMetrics>
    </PoolCardContainer>
  )
}
