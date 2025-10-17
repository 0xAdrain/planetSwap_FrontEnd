import { useState, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  ArrowsUpDownIcon, 
  InformationCircleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const PriceRangeContainer = styled.div`
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

const PriceInputSection = styled.div`
  margin-bottom: 20px;
`

const PriceInputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`

const PriceInputGroup = styled.div`
  flex: 1;
`

const PriceLabel = styled.label`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const PriceInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const CurrentPriceDisplay = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  text-align: center;
`

const CurrentPriceLabel = styled.div`
  color: rgba(34, 197, 94, 0.8);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`

const CurrentPriceValue = styled.div`
  color: #22c55e;
  font-size: 18px;
  font-weight: 700;
`

const RangePresets = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`

const PresetButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const FullRangeToggle = styled.button<{ active: boolean }>`
  width: 100%;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.active ? '#22c55e' : 'white'};
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }
`

const PriceRangeVisualization = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
`

const RangeBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  margin: 20px 0;
`

const ActiveRange = styled.div<{ left: number; width: number }>`
  position: absolute;
  top: 0;
  left: ${props => props.left}%;
  width: ${props => props.width}%;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 4px;
`

const CurrentPriceMarker = styled.div<{ position: number }>`
  position: absolute;
  top: -4px;
  left: ${props => props.position}%;
  width: 16px;
  height: 16px;
  background: #fbbf24;
  border: 2px solid white;
  border-radius: 50%;
  transform: translateX(-50%);
`

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
`

const EfficiencyDisplay = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`

const EfficiencyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const EfficiencyLabel = styled.span`
  color: rgba(59, 130, 246, 0.8);
  font-size: 12px;
  font-weight: 500;
`

const EfficiencyValue = styled.span`
  color: #3b82f6;
  font-size: 14px;
  font-weight: 700;
`

const InfoTooltip = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
`

const TooltipTrigger = styled.div`
  position: relative;
  display: inline-flex;
  
  &:hover ${InfoTooltip} {
    opacity: 1;
  }
`

interface V3PriceRangeSelectorProps {
  tokenA: any // Token type
  tokenB: any // Token type
  currentPrice: number
  onRangeChange: (minPrice: number, maxPrice: number) => void
  onFullRangeChange: (isFullRange: boolean) => void
}

/**
 * 🥞 PancakeSwap V3风格的价格区间选择器
 * 完全对标PancakeSwap V3的集中流动性功能
 */
export default function V3PriceRangeSelector({
  tokenA,
  tokenB,
  currentPrice = 1950.0, // mWOKB/mUSDT 当前价格
  onRangeChange,
  onFullRangeChange
}: V3PriceRangeSelectorProps) {
  // 🎯 价格区间状态
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [isFullRange, setIsFullRange] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // 🎯 预设价格区间
  const pricePresets = [
    { label: '±1%', minPercent: -1, maxPercent: 1 },
    { label: '±5%', minPercent: -5, maxPercent: 5 },
    { label: '±10%', minPercent: -10, maxPercent: 10 },
    { label: '±25%', minPercent: -25, maxPercent: 25 }
  ]

  // 🎯 计算价格区间位置
  const calculateRangePosition = useCallback(() => {
    if (isFullRange) {
      return { left: 0, width: 100, currentPosition: 50 }
    }
    
    const min = parseFloat(minPrice) || currentPrice * 0.8
    const max = parseFloat(maxPrice) || currentPrice * 1.2
    const range = max - min
    
    // 简化的可视化计算
    const totalRange = max * 1.5 - min * 0.5
    const left = ((min - min * 0.5) / totalRange) * 100
    const width = (range / totalRange) * 100
    const currentPosition = ((currentPrice - min * 0.5) / totalRange) * 100
    
    return { left, width, currentPosition: Math.max(0, Math.min(100, currentPosition)) }
  }, [minPrice, maxPrice, currentPrice, isFullRange])

  const rangePosition = calculateRangePosition()

  // 🎯 处理预设选择
  const handlePresetSelect = useCallback((preset: any) => {
    const minValue = currentPrice * (1 + preset.minPercent / 100)
    const maxValue = currentPrice * (1 + preset.maxPercent / 100)
    
    setMinPrice(minValue.toFixed(2))
    setMaxPrice(maxValue.toFixed(2))
    setSelectedPreset(preset.label)
    setIsFullRange(false)
    
    onRangeChange(minValue, maxValue)
    onFullRangeChange(false)
  }, [currentPrice, onRangeChange, onFullRangeChange])

  // 🎯 处理全范围切换
  const handleFullRangeToggle = useCallback(() => {
    const newFullRange = !isFullRange
    setIsFullRange(newFullRange)
    setSelectedPreset(null)
    
    if (newFullRange) {
      setMinPrice('')
      setMaxPrice('')
    }
    
    onFullRangeChange(newFullRange)
  }, [isFullRange, onFullRangeChange])

  // 🎯 处理价格输入
  const handlePriceChange = useCallback((type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value)
    } else {
      setMaxPrice(value)
    }
    
    setSelectedPreset(null)
    setIsFullRange(false)
    
    const min = type === 'min' ? parseFloat(value) : parseFloat(minPrice)
    const max = type === 'max' ? parseFloat(value) : parseFloat(maxPrice)
    
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
      onRangeChange(min, max)
    }
    
    onFullRangeChange(false)
  }, [minPrice, maxPrice, onRangeChange, onFullRangeChange])

  // 🎯 计算资本效率
  const calculateEfficiency = useCallback(() => {
    if (isFullRange) {
      return {
        capitalEfficiency: '1.00x',
        expectedFees: 'Base Rate',
        riskLevel: 'Low'
      }
    }
    
    const min = parseFloat(minPrice) || currentPrice * 0.9
    const max = parseFloat(maxPrice) || currentPrice * 1.1
    const range = max - min
    const efficiency = currentPrice / range
    
    return {
      capitalEfficiency: `${efficiency.toFixed(2)}x`,
      expectedFees: efficiency > 5 ? 'High' : efficiency > 2 ? 'Medium' : 'Low',
      riskLevel: efficiency > 5 ? 'High' : efficiency > 2 ? 'Medium' : 'Low'
    }
  }, [minPrice, maxPrice, currentPrice, isFullRange])

  const efficiency = calculateEfficiency()

  return (
    <PriceRangeContainer>
      <SectionTitle>
        <ChartBarIcon className="w-4 h-4" />
        Set Price Range
        <TooltipTrigger>
          <InformationCircleIcon className="w-4 h-4 text-blue-400 cursor-help" />
          <InfoTooltip>
            Select the price range where your liquidity will be active
          </InfoTooltip>
        </TooltipTrigger>
      </SectionTitle>

      {/* 当前价格显示 */}
      <CurrentPriceDisplay>
        <CurrentPriceLabel>Current Price</CurrentPriceLabel>
        <CurrentPriceValue>
          {currentPrice.toFixed(2)} {tokenB?.symbol || 'mUSDT'} per {tokenA?.symbol || 'mWOKB'}
        </CurrentPriceValue>
      </CurrentPriceDisplay>

      {/* 全范围切换 */}
      <FullRangeToggle
        active={isFullRange}
        onClick={handleFullRangeToggle}
      >
        {isFullRange ? '✅ Full Range (0 to ∞)' : 'Full Range (0 to ∞)'}
      </FullRangeToggle>

      {/* 预设价格区间 */}
      {!isFullRange && (
        <RangePresets>
          {pricePresets.map((preset) => (
            <PresetButton
              key={preset.label}
              active={selectedPreset === preset.label}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.label}
            </PresetButton>
          ))}
        </RangePresets>
      )}

      {/* 价格输入 */}
      {!isFullRange && (
        <PriceInputSection>
          <PriceInputRow>
            <PriceInputGroup>
              <PriceLabel>Min Price</PriceLabel>
              <PriceInput
                type="number"
                placeholder="0.0"
                value={minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
              />
            </PriceInputGroup>
            
            <PriceInputGroup>
              <PriceLabel>Max Price</PriceLabel>
              <PriceInput
                type="number"
                placeholder="0.0"
                value={maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </PriceInputGroup>
          </PriceInputRow>
        </PriceInputSection>
      )}

      {/* 价格区间可视化 */}
      <PriceRangeVisualization>
        <RangeLabels>
          <span>{isFullRange ? '0' : minPrice || '0'}</span>
          <span>Price Range</span>
          <span>{isFullRange ? '∞' : maxPrice || '∞'}</span>
        </RangeLabels>
        
        <RangeBar>
          <ActiveRange left={rangePosition.left} width={rangePosition.width} />
          <CurrentPriceMarker position={rangePosition.currentPosition} />
        </RangeBar>
        
        <RangeLabels>
          <span style={{ color: '#22c55e' }}>Your Position</span>
          <span style={{ color: '#fbbf24' }}>Current Price</span>
        </RangeLabels>
      </PriceRangeVisualization>

      {/* 资本效率显示 */}
      <EfficiencyDisplay>
        <EfficiencyRow>
          <EfficiencyLabel>Capital Efficiency</EfficiencyLabel>
          <EfficiencyValue>{efficiency.capitalEfficiency}</EfficiencyValue>
        </EfficiencyRow>
        <EfficiencyRow>
          <EfficiencyLabel>Expected Fees</EfficiencyLabel>
          <EfficiencyValue>{efficiency.expectedFees}</EfficiencyValue>
        </EfficiencyRow>
        <EfficiencyRow>
          <EfficiencyLabel>Risk Level</EfficiencyLabel>
          <EfficiencyValue>{efficiency.riskLevel}</EfficiencyValue>
        </EfficiencyRow>
      </EfficiencyDisplay>
    </PriceRangeContainer>
  )
}
