import { useState, useCallback, useEffect } from 'react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline'
import { parseUnits, formatUnits } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { useLiquidityCallback } from '../../hooks/liquidity/useLiquidityCallback'
import { useUserLiquidity, UserLPPosition } from '../../hooks/liquidity/useUserLiquidity'
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
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const PoolSelector = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`

const PoolSelectorTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const PoolOption = styled.button<{ selected: boolean }>`
  width: 100%;
  background: ${props => props.selected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.selected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.2);
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const PoolOptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const PoolTokens = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PoolTokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
`

const PoolPairName = styled.span`
  color: white;
  font-size: 16px;
  font-weight: 600;
`

const PoolBadge = styled.span`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  color: #22c55e;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
`

const PoolOptionStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PoolStat = styled.div`
  text-align: center;
`

const PoolStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  margin-bottom: 2px;
`

const PoolStatValue = styled.div`
  color: white;
  font-size: 13px;
  font-weight: 600;
`

const RemoveAmountSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`

const AmountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const AmountTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`

const PercentageDisplay = styled.div`
  color: #22c55e;
  font-size: 24px;
  font-weight: 700;
`

const RemoveSlider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  margin: 20px 0;
  appearance: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #22c55e;
    cursor: pointer;
    border: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #22c55e;
    cursor: pointer;
    border: 2px solid rgba(0, 0, 0, 0.1);
  }
`

const PercentageButtons = styled.div`
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
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const ExpectedOutput = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`

const OutputTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const OutputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const OutputToken = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const OutputAmount = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
`

const RemoveButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`

interface RemoveLiquidityV2Props {
  onBack: () => void
}

// UserLPPosition now imported from useUserLiquidity hook

/**
 * 🥞 PancakeSwap V2风格的Remove liquidity界面
 * 完全对标PancakeSwap V2Remove liquidity功能
 */
export default function RemoveLiquidityV2({ onBack }: RemoveLiquidityV2Props) {
  const { address, isConnected } = useAccount()
  
  // 🎯 获取真实用户流动性数据
  const {
    v2Positions,
    isLoading: isPositionsLoading,
    error: positionsError,
    refreshUserLiquidity
  } = useUserLiquidity()
  
  // 🎯 状态管理
  const [selectedPool, setSelectedPool] = useState<UserLPPosition | null>(null)
  const [removePercentage, setRemovePercentage] = useState(25)
  const [showSettings, setShowSettings] = useState(false)

  // 🎯 自动选择第一个可用的池子
  useEffect(() => {
    if (v2Positions.length > 0 && !selectedPool) {
      setSelectedPool(v2Positions[0])
    }
  }, [v2Positions, selectedPool])

  console.log('🔥 RemoveLiquidity数据:', {
    v2Count: v2Positions.length,
    selectedPool: selectedPool?.id,
    isLoading: isPositionsLoading,
    error: positionsError
  })

  // 🎯 计算预期输出
  const calculateExpectedOutput = useCallback(() => {
    if (!selectedPool) return { amountA: '0', amountB: '0' }
    
    const removeRatio = removePercentage / 100
    const userLPRatio = parseFloat(selectedPool.userShare) / 100
    
    const amountA = (parseFloat(selectedPool.reserve0) * userLPRatio * removeRatio).toFixed(6)
    const amountB = (parseFloat(selectedPool.reserve1) * userLPRatio * removeRatio).toFixed(6)
    
    return { amountA, amountB }
  }, [selectedPool, removePercentage])

  const expectedOutput = calculateExpectedOutput()

  // 🎯 处理Remove liquidity
  const handleRemoveLiquidity = useCallback(async () => {
    if (!selectedPool || !address) {
      console.error('❌ 缺少必要参数')
      return
    }

    try {
      console.log('🔥 开始移除V2流动性:', {
        pool: `${selectedPool.tokenA.symbol}/${selectedPool.tokenB.symbol}`,
        percentage: removePercentage,
        expectedOutput
      })

      // TODO: 实现真实的Remove liquidity逻辑
      // 1. 授权LP代币给Router
      // 2. 调用removeLiquidity
      // 3. 处理Trade confirmation
      
    } catch (error: any) {
      console.error('❌ Remove liquidity失败:', error)
    }
  }, [selectedPool, address, removePercentage, expectedOutput])

  // 🎯 获取按钮文本
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!selectedPool) return 'Select a pool'
    if (removePercentage === 0) return 'Enter an amount'
    return `Remove ${removePercentage}% Liquidity`
  }

  const canRemove = isConnected && selectedPool && removePercentage > 0

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
          <RemoveTitle>Remove V2 Liquidity</RemoveTitle>
        </HeaderLeft>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </RemoveHeader>

      {/* 池子选择 */}
      <PoolSelector>
        <PoolSelectorTitle>Select LP Position</PoolSelectorTitle>
        {isPositionsLoading ? (
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            textAlign: 'center', 
            padding: '20px',
            fontSize: '14px'
          }}>
            Loading your V2 positions...
          </div>
        ) : positionsError ? (
          <div style={{ 
            color: '#ef4444', 
            textAlign: 'center', 
            padding: '20px',
            fontSize: '14px'
          }}>
            Error: {positionsError}
          </div>
        ) : v2Positions.length > 0 ? (
          v2Positions.map((position, index) => (
            <PoolOption
              key={position.id}
              selected={selectedPool?.id === position.id}
              onClick={() => setSelectedPool(position)}
            >
              <PoolOptionHeader>
                <PoolTokens>
                  <PoolTokenIcon>{position.tokenA.symbol.slice(0, 2)}</PoolTokenIcon>
                  <PoolTokenIcon>{position.tokenB.symbol.slice(0, 2)}</PoolTokenIcon>
                  <PoolPairName>{position.tokenA.symbol}/{position.tokenB.symbol}</PoolPairName>
                </PoolTokens>
                <PoolBadge>V2</PoolBadge>
              </PoolOptionHeader>
              
              <PoolOptionStats>
                <PoolStat>
                  <PoolStatLabel>LP Balance</PoolStatLabel>
                  <PoolStatValue>{position.lpBalanceFormatted}</PoolStatValue>
                </PoolStat>
                <PoolStat>
                  <PoolStatLabel>Pool Share</PoolStatLabel>
                  <PoolStatValue>{position.userShare}</PoolStatValue>
                </PoolStat>
                <PoolStat>
                  <PoolStatLabel>Value</PoolStatLabel>
                  <PoolStatValue>{position.userLiquidityUSD || '$0.00'}</PoolStatValue>
                </PoolStat>
              </PoolOptionStats>
            </PoolOption>
          ))
        ) : (
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            textAlign: 'center', 
            padding: '20px',
            fontSize: '14px'
          }}>
            No V2 LP positions found. Add liquidity first.
          </div>
        )}
      </PoolSelector>

      {/* 移除数量 */}
      {selectedPool && (
        <RemoveAmountSection>
          <AmountHeader>
            <AmountTitle>Amount to Remove</AmountTitle>
            <PercentageDisplay>{removePercentage}%</PercentageDisplay>
          </AmountHeader>
          
          <RemoveSlider
            type="range"
            min="0"
            max="100"
            value={removePercentage}
            onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
          />
          
          <PercentageButtons>
            {[25, 50, 75, 100].map((percent) => (
              <PercentageButton
                key={percent}
                active={removePercentage === percent}
                onClick={() => setRemovePercentage(percent)}
              >
                {percent === 100 ? 'MAX' : `${percent}%`}
              </PercentageButton>
            ))}
          </PercentageButtons>
        </RemoveAmountSection>
      )}

      {/* 预期输出 */}
      {selectedPool && removePercentage > 0 && (
        <ExpectedOutput>
          <OutputTitle>You will receive</OutputTitle>
          
          <OutputRow>
            <OutputToken>
              <PoolTokenIcon>{selectedPool.tokenA.symbol.slice(0, 2)}</PoolTokenIcon>
              <span style={{ color: 'white', fontSize: '16px' }}>
                {selectedPool.tokenA.symbol}
              </span>
            </OutputToken>
            <OutputAmount>{expectedOutput.amountA}</OutputAmount>
          </OutputRow>
          
          <OutputRow>
            <OutputToken>
              <PoolTokenIcon>{selectedPool.tokenB.symbol.slice(0, 2)}</PoolTokenIcon>
              <span style={{ color: 'white', fontSize: '16px' }}>
                {selectedPool.tokenB.symbol}
              </span>
            </OutputToken>
            <OutputAmount>{expectedOutput.amountB}</OutputAmount>
          </OutputRow>
        </ExpectedOutput>
      )}

      {/* 移除按钮 */}
      <RemoveButton
        disabled={!canRemove}
        onClick={handleRemoveLiquidity}
        whileTap={{ scale: 0.98 }}
      >
        {getButtonText()}
      </RemoveButton>
    </RemoveContainer>
  )
}




