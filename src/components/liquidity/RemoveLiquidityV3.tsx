import { useState, useCallback, useEffect } from 'react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CogIcon, MinusIcon } from '@heroicons/react/24/outline'
import { parseUnits, formatUnits } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { useLiquidityCallback } from '../../hooks/liquidity/useLiquidityCallback'
import { useUserLiquiditySubgraph, UserLPPosition } from '../../hooks/liquidity/useUserLiquiditySubgraph'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'

const RemoveContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const RemoveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`

const RemoveTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const V3Badge = styled.span`
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SettingsButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`

const PositionSelector = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
`

const SelectorTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const PositionCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.selected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.2);
  }
`

const PositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const PositionPair = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PositionTokens = styled.div`
  display: flex;
  align-items: center;
  gap: -8px;
`

const PositionTokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid rgba(0, 0, 0, 0.1);
  
  &:nth-of-type(2) {
    margin-left: -8px;
  }
`

const PositionPairName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const PositionTokenId = styled.div`
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  color: #a855f7;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
`

const PositionStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const PositionStat = styled.div``

const PositionStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  margin-bottom: 2px;
`

const PositionStatValue = styled.div`
  color: white;
  font-size: 12px;
  font-weight: 600;
`

const RemoveSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`

const RemoveTitle2 = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
`

const RemovePercentage = styled.div`
  text-align: center;
  margin-bottom: 20px;
`

const PercentageValue = styled.div`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
`

const PercentageLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`

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
    background: #a855f7;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #a855f7;
    cursor: pointer;
    border: none;
  }
`

const RemovePercentages = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`

const PercentageButton = styled.button<{ active?: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#a855f7' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    color: #a855f7;
  }
`

const OutputSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`

const OutputTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const OutputItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const OutputToken = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const OutputTokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
`

const OutputTokenSymbol = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const OutputAmount = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const RemoveButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  background: ${props => props.disabled ? 
    'rgba(255, 255, 255, 0.1)' : 
    'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
  };
  border: none;
  border-radius: 16px;
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.4)' : 'white'};
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.disabled ? 
      'rgba(255, 255, 255, 0.1)' : 
      'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
    };
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
`

interface RemoveLiquidityV3Props {
  onBack: () => void
}

/**
 * 🎨 V3流动性移除组件
 * 支持NFT Position的流动性移除
 */
export default function RemoveLiquidityV3({ onBack }: RemoveLiquidityV3Props) {
  const { address } = useAccount()
  const { v3Positions, isLoading, refreshUserLiquidity } = useUserLiquiditySubgraph()
  const [selectedPosition, setSelectedPosition] = useState<UserLPPosition | null>(null)
  const [removePercentage, setRemovePercentage] = useState(25)
  const [showSettings, setShowSettings] = useState(false)

  // 🎯 选择第一个V3持仓
  useEffect(() => {
    if (v3Positions.length > 0 && !selectedPosition) {
      setSelectedPosition(v3Positions[0])
    }
  }, [v3Positions, selectedPosition])

  // 🎯 计算输出金额
  const calculateOutputAmounts = useCallback(() => {
    if (!selectedPosition) return { amount0: '0', amount1: '0' }
    
    const percentage = removePercentage / 100
    const liquidity = parseFloat(selectedPosition.lpBalanceFormatted)
    
    // 简化计算，实际需要根据当前价格和tick范围计算
    const amount0 = (liquidity * percentage * 0.5).toFixed(6)
    const amount1 = (liquidity * percentage * 0.5).toFixed(6)
    
    return { amount0, amount1 }
  }, [selectedPosition, removePercentage])

  const { amount0, amount1 } = calculateOutputAmounts()

  // 🎯 处理移除流动性
  const handleRemoveLiquidity = useCallback(async () => {
    if (!selectedPosition || !address) return

    try {
      console.log('🎨 开始移除V3流动性:', {
        tokenId: selectedPosition.tokenId,
        percentage: removePercentage,
        position: selectedPosition
      })

      // TODO: 实现V3流动性移除逻辑
      // 1. 调用NonfungiblePositionManager.decreaseLiquidity
      // 2. 调用collect收集代币
      // 3. 如果100%移除，调用burn销毁NFT

      alert('V3流动性移除功能开发中...')
      
    } catch (error) {
      console.error('❌ V3流动性移除失败:', error)
    }
  }, [selectedPosition, removePercentage, address])

  if (isLoading) {
    return (
      <RemoveContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RemoveHeader>
          <HeaderLeft>
            <BackButton onClick={onBack}>
              <ArrowLeftIcon className="w-4 h-4" />
            </BackButton>
            <RemoveTitle>
              <MinusIcon className="w-5 h-5" />
              Remove V3 Liquidity
              <V3Badge>V3</V3Badge>
            </RemoveTitle>
          </HeaderLeft>
        </RemoveHeader>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
          Loading V3 positions...
        </div>
      </RemoveContainer>
    )
  }

  if (v3Positions.length === 0) {
    return (
      <RemoveContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RemoveHeader>
          <HeaderLeft>
            <BackButton onClick={onBack}>
              <ArrowLeftIcon className="w-4 h-4" />
            </BackButton>
            <RemoveTitle>
              <MinusIcon className="w-5 h-5" />
              Remove V3 Liquidity
              <V3Badge>V3</V3Badge>
            </RemoveTitle>
          </HeaderLeft>
        </RemoveHeader>
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <div>No V3 positions found</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Create a V3 position first to remove liquidity
          </div>
        </EmptyState>
      </RemoveContainer>
    )
  }

  return (
    <RemoveContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <RemoveHeader>
        <HeaderLeft>
          <BackButton onClick={onBack}>
            <ArrowLeftIcon className="w-4 h-4" />
          </BackButton>
          <RemoveTitle>
            <MinusIcon className="w-5 h-5" />
            Remove V3 Liquidity
            <V3Badge>V3</V3Badge>
          </RemoveTitle>
        </HeaderLeft>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </RemoveHeader>

      {/* Position Selector */}
      <PositionSelector>
        <SelectorTitle>Select Position</SelectorTitle>
        {v3Positions.map((position) => (
          <PositionCard
            key={position.id}
            selected={selectedPosition?.id === position.id}
            onClick={() => setSelectedPosition(position)}
          >
            <PositionHeader>
              <PositionPair>
                <PositionTokens>
                  <PositionTokenIcon>{position.tokenA.symbol.slice(0, 2)}</PositionTokenIcon>
                  <PositionTokenIcon>{position.tokenB.symbol.slice(0, 2)}</PositionTokenIcon>
                </PositionTokens>
                <PositionPairName>{position.tokenA.symbol}/{position.tokenB.symbol}</PositionPairName>
              </PositionPair>
              <PositionTokenId>#{position.tokenId?.toString()}</PositionTokenId>
            </PositionHeader>
            
            <PositionStats>
              <PositionStat>
                <PositionStatLabel>Liquidity</PositionStatLabel>
                <PositionStatValue>{position.lpBalanceFormatted}</PositionStatValue>
              </PositionStat>
              <PositionStat>
                <PositionStatLabel>Status</PositionStatLabel>
                <PositionStatValue>{position.inRange ? 'In Range' : 'Out of Range'}</PositionStatValue>
              </PositionStat>
            </PositionStats>
          </PositionCard>
        ))}
      </PositionSelector>

      {selectedPosition && (
        <>
          {/* Remove Amount */}
          <RemoveSection>
            <RemoveTitle2>Amount to Remove</RemoveTitle2>
            
            <RemovePercentage>
              <PercentageValue>{removePercentage}%</PercentageValue>
              <PercentageLabel>of your position</PercentageLabel>
            </RemovePercentage>

            <RemoveSlider
              type="range"
              min="1"
              max="100"
              value={removePercentage}
              onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
            />

            <RemovePercentages>
              {[25, 50, 75, 100].map((percentage) => (
                <PercentageButton
                  key={percentage}
                  active={removePercentage === percentage}
                  onClick={() => setRemovePercentage(percentage)}
                >
                  {percentage}%
                </PercentageButton>
              ))}
            </RemovePercentages>
          </RemoveSection>

          {/* Output Preview */}
          <OutputSection>
            <OutputTitle>You will receive</OutputTitle>
            
            <OutputItem>
              <OutputToken>
                <OutputTokenIcon>{selectedPosition.tokenA.symbol.slice(0, 2)}</OutputTokenIcon>
                <OutputTokenSymbol>{selectedPosition.tokenA.symbol}</OutputTokenSymbol>
              </OutputToken>
              <OutputAmount>{amount0}</OutputAmount>
            </OutputItem>
            
            <OutputItem>
              <OutputToken>
                <OutputTokenIcon>{selectedPosition.tokenB.symbol.slice(0, 2)}</OutputTokenIcon>
                <OutputTokenSymbol>{selectedPosition.tokenB.symbol}</OutputTokenSymbol>
              </OutputToken>
              <OutputAmount>{amount1}</OutputAmount>
            </OutputItem>
          </OutputSection>

          {/* Remove Button */}
          <RemoveButton
            onClick={handleRemoveLiquidity}
            disabled={!selectedPosition}
          >
            <MinusIcon className="w-5 h-5" />
            Remove V3 Liquidity
          </RemoveButton>
        </>
      )}
    </RemoveContainer>
  )
}
