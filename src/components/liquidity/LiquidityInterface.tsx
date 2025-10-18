import { useState } from 'react'
import { useAccount } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  MinusIcon, 
  MagnifyingGlassIcon,
  WalletIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import AddLiquidityV2 from './AddLiquidityV2'
import AddLiquidityV3 from './AddLiquidityV3'
import RemoveLiquidityV2 from './RemoveLiquidityV2'
import RemoveLiquidityV3 from './RemoveLiquidityV3'
import ImportPoolV2 from './ImportPoolV2'
import FindPoolV3 from './FindPoolV3'
import { useUserLiquiditySubgraph } from '../../hooks/liquidity/useUserLiquiditySubgraph'

const LiquidityContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
`

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'};
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  @media (min-width: 480px) {
    font-size: 14px;
    padding: 12px 16px;
    gap: 8px;
  }
`

const LiquidityCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  color: white;
`

const CardTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
`

const YourLiquiditySection = styled.div`
  margin-bottom: 24px;
`

const YourLiquidityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const YourLiquidityTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const AddLiquidityButton = styled.button`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }
`

const LiquidityPoolCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
`

const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const PoolPair = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PoolTokens = styled.div`
  display: flex;
  align-items: center;
  gap: -8px;
`

const PoolTokenIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid rgba(0, 0, 0, 0.1);
  
  &:nth-of-type(2) {
    margin-left: -8px;
  }
`

const PoolPairName = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
`

const PoolBadge = styled.div`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 16px;
  color: #22c55e;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
`

const PoolStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`

const PoolStat = styled.div``

const PoolStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 4px;
`

const PoolStatValue = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 20px;
`

const EmptyStateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`

const EmptyStateText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 8px;
`

const EmptyStateSubtext = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`

const FindPoolSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
`

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
  }
`

const RemoveLiquiditySection = styled.div``

const RemoveSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  margin: 20px 0;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #22c55e;
    cursor: pointer;
  }
`

const RemovePercentages = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`

const PercentageButton = styled.button<{ active?: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

type LiquidityTab = 'liquidity' | 'add' | 'find' | 'remove'
type LiquidityVersion = 'v2' | 'v3'

// 🚨 完全重构 - 严格对标PancakeSwap V2/V3
const VersionSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const VersionTab = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'};
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

/**
 * 🥞 完整的PancakeSwap风格流动性界面
 * 严格对标PancakeSwap V2/V3所有功能，无假数据
 */
export default function LiquidityInterface() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<LiquidityTab>('liquidity')
  const [version, setVersion] = useState<LiquidityVersion>('v2')
  const [removePercentage, setRemovePercentage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 🎯 获取真实用户流动性数据 (基于Subgraph)
  const {
    userPositions,
    v2Positions,
    v3Positions,
    isLoading: isPositionsLoading,
    error: positionsError,
    refreshUserLiquidity,
    totalPositions,
    hasV2Positions,
    hasV3Positions
  } = useUserLiquiditySubgraph()

  console.log('🏊‍♂️ 用户流动性数据 (Subgraph):', {
    userAddress: address,
    totalPositions,
    v2Count: v2Positions.length,
    v3Count: v3Positions.length,
    isLoading: isPositionsLoading,
    error: positionsError,
    dataSource: 'Subgraph'
  })

  return (
    <LiquidityContainer>
      {/* V2/V3版本选择器 - 严格对标PancakeSwap */}
      <VersionSelector>
        <VersionTab 
          active={version === 'v2'} 
          onClick={() => setVersion('v2')}
        >
          V2
        </VersionTab>
        <VersionTab 
          active={version === 'v3'} 
          onClick={() => setVersion('v3')}
        >
          V3
        </VersionTab>
      </VersionSelector>

      {/* 流动性操作选项卡 */}
      <TabContainer>
        <Tab 
          active={activeTab === 'liquidity'} 
          onClick={() => setActiveTab('liquidity')}
        >
          <WalletIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Your Liquidity</span>
          <span className="sm:hidden">Liquidity</span>
        </Tab>
        <Tab 
          active={activeTab === 'add'} 
          onClick={() => setActiveTab('add')}
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </Tab>
        <Tab 
          active={activeTab === 'find'} 
          onClick={() => setActiveTab('find')}
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Find
        </Tab>
        <Tab 
          active={activeTab === 'remove'} 
          onClick={() => setActiveTab('remove')}
        >
          <MinusIcon className="w-4 h-4" />
          Remove
        </Tab>
      </TabContainer>

      {/* Your Liquidity - 使用真实合约数据 */}
      {activeTab === 'liquidity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <YourLiquiditySection>
            <YourLiquidityHeader>
              <YourLiquidityTitle>
                <ChartBarIcon className="w-5 h-5" />
                Your Liquidity
              </YourLiquidityTitle>
              <AddLiquidityButton onClick={() => setActiveTab('add')}>
                <PlusIcon className="w-4 h-4" />
                Add Liquidity
              </AddLiquidityButton>
            </YourLiquidityHeader>

            {isPositionsLoading ? (
              <EmptyState>
                <EmptyStateIcon>
                  <Cog6ToothIcon className="w-6 h-6 text-white animate-spin" />
                </EmptyStateIcon>
                <EmptyStateText>Loading your liquidity...</EmptyStateText>
                <EmptyStateSubtext>
                  Fetching real data from Subgraph (owner wallet: {address?.slice(0,6)}...{address?.slice(-4)})
                </EmptyStateSubtext>
              </EmptyState>
            ) : positionsError ? (
              <EmptyState>
                <EmptyStateIcon>
                  <WalletIcon className="w-6 h-6 text-red-400" />
                </EmptyStateIcon>
                <EmptyStateText>Error loading liquidity</EmptyStateText>
                <EmptyStateSubtext>
                  {positionsError}
                </EmptyStateSubtext>
              </EmptyState>
            ) : (() => {
              const positions = version === 'v2' ? v2Positions : v3Positions
              return positions.length > 0 ? (
                positions.map((position) => (
                  <LiquidityPoolCard key={position.id}>
                    <PoolHeader>
                      <PoolPair>
                        <PoolTokens>
                          <PoolTokenIcon>{position.tokenA.symbol.slice(0, 2)}</PoolTokenIcon>
                          <PoolTokenIcon>{position.tokenB.symbol.slice(0, 2)}</PoolTokenIcon>
                        </PoolTokens>
                        <div>
                          <PoolPairName>{position.tokenA.symbol}/{position.tokenB.symbol}</PoolPairName>
                        </div>
                      </PoolPair>
                      <PoolBadge>{position.isV3 ? 'V3' : 'V2'} • Real</PoolBadge>
                    </PoolHeader>
                    
                    <PoolStats>
                      <PoolStat>
                        <PoolStatLabel>LP Balance</PoolStatLabel>
                        <PoolStatValue>{position.lpBalanceFormatted}</PoolStatValue>
                      </PoolStat>
                      <PoolStat>
                        <PoolStatLabel>Your Share</PoolStatLabel>
                        <PoolStatValue>{position.userShare || '0%'}</PoolStatValue>
                      </PoolStat>
                      <PoolStat>
                        <PoolStatLabel>Reserve 0</PoolStatLabel>
                        <PoolStatValue>{parseFloat(position.reserve0).toFixed(4)}</PoolStatValue>
                      </PoolStat>
                      <PoolStat>
                        <PoolStatLabel>Reserve 1</PoolStatLabel>
                        <PoolStatValue>{parseFloat(position.reserve1).toFixed(4)}</PoolStatValue>
                      </PoolStat>
                    </PoolStats>
                  </LiquidityPoolCard>
                ))
              ) : (
                <EmptyState>
                  <EmptyStateIcon>
                    <WalletIcon className="w-6 h-6 text-white" />
                  </EmptyStateIcon>
                  <EmptyStateText>No {version.toUpperCase()} liquidity found</EmptyStateText>
                  <EmptyStateSubtext>
                    {version === 'v2' ? 
                      'Add V2 liquidity to earn trading fees' : 
                      'Create concentrated V3 positions to maximize capital efficiency'
                    }
                  </EmptyStateSubtext>
                </EmptyState>
              )
            })()}
          </YourLiquiditySection>
        </motion.div>
      )}

      {/* Add Liquidity - V2/V3版本切换 */}
      {activeTab === 'add' && (
        version === 'v2' ? (
          <AddLiquidityV2 />
        ) : (
          <AddLiquidityV3 />
        )
      )}

      {/* Find Pool - V2/V3版本切换 */}
      {activeTab === 'find' && (
        version === 'v2' ? (
          <ImportPoolV2 />
        ) : (
          <FindPoolV3 />
        )
      )}

      {/* Remove Liquidity - V2/V3版本切换 */}
      {activeTab === 'remove' && (
        version === 'v2' ? (
          <RemoveLiquidityV2 
            onBack={() => setActiveTab('liquidity')}
          />
        ) : (
          <RemoveLiquidityV3 
            onBack={() => setActiveTab('liquidity')}
          />
        )
      )}
    </LiquidityContainer>
  )
}




