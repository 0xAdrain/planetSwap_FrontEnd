import { useState, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline'

const FeeTierContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
`

const SectionTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FeeTierGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`

const FeeTierCard = styled(motion.button)<{ selected: boolean; recommended?: boolean }>`
  background: ${props => props.selected 
    ? 'rgba(34, 197, 94, 0.15)' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.selected 
    ? 'rgba(34, 197, 94, 0.5)' 
    : props.recommended 
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-align: left;
  
  &:hover {
    background: ${props => props.selected 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.selected 
      ? 'rgba(34, 197, 94, 0.6)' 
      : 'rgba(34, 197, 94, 0.3)'};
  }
`

const FeeTierHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
`

const FeePercentage = styled.div<{ selected: boolean }>`
  color: ${props => props.selected ? '#22c55e' : 'white'};
  font-size: 18px;
  font-weight: 700;
`

const RecommendedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
`

const SelectedIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #22c55e;
`

const FeeDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.4;
`

const FeeStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatRow = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  font-size: 11px;
`

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
`

const StatValue = styled.span<{ type?: 'positive' | 'neutral' | 'negative' }>`
  color: ${props => 
    props.type === 'positive' ? '#22c55e' :
    props.type === 'negative' ? '#ef4444' : 
    'rgba(255, 255, 255, 0.8)'};
  font-weight: 600;
  text-align: right;
`

const PoolNotExistWarning = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
`

const WarningIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`

const WarningContent = styled.div`
  flex: 1;
`

const WarningTitle = styled.div`
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`

const WarningText = styled.div`
  color: rgba(245, 158, 11, 0.9);
  font-size: 11px;
  line-height: 1.4;
`

const CreatePoolNote = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: rgba(59, 130, 246, 0.9);
  font-size: 12px;
  text-align: center;
`

interface FeeTier {
  fee: number // basis points (e.g., 500 = 0.05%)
  feePercent: string // display percentage
  tickSpacing: number
  description: string
  pairTypes: string[]
  tvl?: string
  volume24h?: string
  apr?: number
  poolExists?: boolean
  recommended?: boolean
}

interface V3FeeTierSelectorProps {
  tokenA: any // Token type
  tokenB: any // Token type  
  selectedFeeTier: number | null
  onFeeTierSelect: (feeTier: number) => void
}

/**
 * 🥞 PancakeSwap V3风格的手续费等级选择器
 * 完全对标PancakeSwap V3的4个标准fee tier
 */
export default function V3FeeTierSelector({
  tokenA,
  tokenB,
  selectedFeeTier,
  onFeeTierSelect
}: V3FeeTierSelectorProps) {

  // 🎯 V3标准手续费等级 - 严格对标PancakeSwap
  const feeTiers: FeeTier[] = [
    {
      fee: 100,
      feePercent: '0.01%',
      tickSpacing: 1,
      description: 'Best for very stable pairs',
      pairTypes: ['Stablecoins', 'Pegged assets'],
      tvl: '$1.2M',
      volume24h: '$450K',
      apr: 3.2,
      poolExists: false,
      recommended: false
    },
    {
      fee: 500,
      feePercent: '0.05%',
      tickSpacing: 10,
      description: 'Best for stable pairs',
      pairTypes: ['ETH/USDC', 'Stable pairs'],
      tvl: '$8.4M',
      volume24h: '$2.1M',
      apr: 12.5,
      poolExists: true,
      recommended: false
    },
    {
      fee: 3000,
      feePercent: '0.3%',
      tickSpacing: 60,
      description: 'Best for most pairs',
      pairTypes: ['ETH/USDT', 'Popular pairs'],
      tvl: '$15.7M',
      volume24h: '$5.8M',
      apr: 18.6,
      poolExists: true,
      recommended: true // 推荐用于大多数Trading pair
    },
    {
      fee: 10000,
      feePercent: '1%',
      tickSpacing: 200,
      description: 'Best for volatile pairs',
      pairTypes: ['Meme coins', 'High volatility'],
      tvl: '$680K',
      volume24h: '$1.2M',
      apr: 45.3,
      poolExists: false,
      recommended: false
    }
  ]

  // 🎯 处理fee tier选择
  const handleFeeTierSelect = useCallback((fee: number) => {
    onFeeTierSelect(fee)
  }, [onFeeTierSelect])

  // 🎯 自动推荐fee tier
  useEffect(() => {
    if (!selectedFeeTier && tokenA && tokenB) {
      // 根据代币类型自动推荐
      const isStablePair = (tokenA.symbol.includes('USD') && tokenB.symbol.includes('USD'))
      const isMainPair = (tokenA.symbol === 'mWOKB' || tokenB.symbol === 'mWOKB')
      
      if (isStablePair) {
        onFeeTierSelect(500) // 0.05% for stable pairs
      } else if (isMainPair) {
        onFeeTierSelect(3000) // 0.3% for main pairs
      }
    }
  }, [tokenA, tokenB, selectedFeeTier, onFeeTierSelect])

  return (
    <FeeTierContainer>
      <SectionTitle>
        <CurrencyDollarIcon className="w-4 h-4" />
        Select Fee Tier
      </SectionTitle>

      {/* 新池子创建提示 */}
      {selectedFeeTier && !feeTiers.find(t => t.fee === selectedFeeTier)?.poolExists && (
        <CreatePoolNote>
          🎉 You'll be the first to provide liquidity for {tokenA?.symbol || 'Token A'}/{tokenB?.symbol || 'Token B'} at {feeTiers.find(t => t.fee === selectedFeeTier)?.feePercent} fee tier!
        </CreatePoolNote>
      )}

      <FeeTierGrid>
        {feeTiers.map((tier) => (
          <FeeTierCard
            key={tier.fee}
            selected={selectedFeeTier === tier.fee}
            recommended={tier.recommended}
            onClick={() => handleFeeTierSelect(tier.fee)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tier.recommended && (
              <RecommendedBadge>Most Popular</RecommendedBadge>
            )}
            
            {selectedFeeTier === tier.fee && (
              <SelectedIndicator>
                <CheckCircleIcon className="w-5 h-5" />
              </SelectedIndicator>
            )}

            <FeeTierHeader>
              <FeePercentage selected={selectedFeeTier === tier.fee}>
                {tier.feePercent}
              </FeePercentage>
            </FeeTierHeader>

            <FeeDescription>
              {tier.description}
            </FeeDescription>

            <FeeStats>
              <StatRow>
                <StatLabel>TVL:</StatLabel>
                <StatValue type={tier.poolExists ? 'positive' : 'neutral'}>
                  {tier.poolExists ? tier.tvl : 'No pool'}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>24h Volume:</StatLabel>
                <StatValue type={tier.poolExists ? 'positive' : 'neutral'}>
                  {tier.poolExists ? tier.volume24h : '-'}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>APR:</StatLabel>
                <StatValue type={tier.poolExists ? 'positive' : 'neutral'}>
                  {tier.poolExists ? `${tier.apr}%` : '-'}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Tick Spacing:</StatLabel>
                <StatValue>{tier.tickSpacing}</StatValue>
              </StatRow>
            </FeeStats>

            {/* 池子不存在警告 */}
            {selectedFeeTier === tier.fee && !tier.poolExists && (
              <PoolNotExistWarning>
                <WarningIcon>
                  <InformationCircleIcon className="w-4 h-4" />
                </WarningIcon>
                <WarningContent>
                  <WarningTitle>New Pool</WarningTitle>
                  <WarningText>
                    This pool doesn't exist yet. You'll create it by adding liquidity.
                  </WarningText>
                </WarningContent>
              </PoolNotExistWarning>
            )}
          </FeeTierCard>
        ))}
      </FeeTierGrid>

      {/* Fee tier说明 */}
      <div style={{ 
        color: 'rgba(255, 255, 255, 0.6)', 
        fontSize: '12px',
        lineHeight: 1.4
      }}>
        <strong>💡 Fee Tier Guide:</strong><br />
        • <strong>0.01%</strong>: For stablecoins (USDT/USDC)<br />
        • <strong>0.05%</strong>: For stable pairs (ETH/USDC)<br />
        • <strong>0.3%</strong>: For standard pairs (ETH/USDT) - Most Popular<br />
        • <strong>1%</strong>: For volatile/exotic pairs
      </div>
    </FeeTierContainer>
  )
}
