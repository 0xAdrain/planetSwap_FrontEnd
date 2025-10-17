import { useState, useCallback, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { CogIcon, PlusIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { parseUnits } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import V3PriceRangeSelector from './V3PriceRangeSelector'
import V3FeeTierSelector from './V3FeeTierSelector'

const LiquidityContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const LiquidityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const LiquidityTitle = styled.h2`
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

const TokenInputContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const TokenInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const TokenLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Balance = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`

const MaxButton = styled.button`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.5);
  }
`

const TokenInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenAmountInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  font-weight: 600;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

const TokenSelectButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
  transition: all 0.2s ease;
  min-width: 120px;
  max-width: 140px;
  height: 48px;
  justify-content: center;
  white-space: nowrap;
  overflow: visible;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const TokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
`

const ConnectButton = styled(motion.div)`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px auto;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

const V3InfoSection = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`

const V3InfoTitle = styled.h4`
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
`

const V3InfoText = styled.p`
  color: rgba(59, 130, 246, 0.8);
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
`

const PositionPreview = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`

const PreviewTitle = styled.h4`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
`

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const PreviewLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`

const PreviewValue = styled.span`
  color: white;
  font-size: 12px;
  font-weight: 600;
`

const AddLiquidityButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`

/**
 * 🥞 PancakeSwap V3风格的Add liquidity界面
 * 完整实现集中流动性、手续费等级、价格区间功能
 */
export default function AddLiquidityV3() {
  const { address, isConnected } = useAccount()
  const { tokens } = useTokens()
  
  // 🎯 代币状态
  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  
  // 🎯 V3特有状态
  const [selectedFeeTier, setSelectedFeeTier] = useState<number | null>(null)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [isFullRange, setIsFullRange] = useState(false)
  const [currentPrice] = useState(1950.0) // mWOKB/mUSDT 当前价格
  
  // 🎯 UI状态
  const [showTokenAModal, setShowTokenAModal] = useState(false)
  const [showTokenBModal, setShowTokenBModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 🎯 Get token balance
  const { data: balanceA } = useBalance({
    address,
    token: tokenA?.isNative ? undefined : tokenA?.address as `0x${string}`,
    enabled: !!tokenA && isConnected
  })

  const { data: balanceB } = useBalance({
    address,
    token: tokenB?.isNative ? undefined : tokenB?.address as `0x${string}`,
    enabled: !!tokenB && isConnected
  })

  // 🎯 初始化默认代币
  useEffect(() => {
    if (tokens.length >= 2 && !tokenA && !tokenB) {
      const mWOKB = tokens.find(t => t.symbol === 'mWOKB')
      const mUSDT = tokens.find(t => t.symbol === 'mUSDT')
      
      setTokenA(mWOKB || tokens[0])
      setTokenB(mUSDT || tokens[1])
    }
  }, [tokens, tokenA, tokenB])

  // 🎯 Token selection处理
  const handleTokenASelect = useCallback((token: Token) => {
    if (token.address === tokenB?.address) {
      setTokenB(tokenA)
    }
    setTokenA(token)
    setShowTokenAModal(false)
  }, [tokenA, tokenB])

  const handleTokenBSelect = useCallback((token: Token) => {
    if (token.address === tokenA?.address) {
      setTokenA(tokenB)
    }
    setTokenB(token)
    setShowTokenBModal(false)
  }, [tokenA, tokenB])

  // 🎯 MAX按钮处理
  const handleMaxA = useCallback(() => {
    if (balanceA) {
      const maxAmount = tokenA?.isNative 
        ? Math.max(0, parseFloat(balanceA.formatted) - 0.01)
        : parseFloat(balanceA.formatted)
      setAmountA(maxAmount.toString())
    }
  }, [balanceA, tokenA])

  const handleMaxB = useCallback(() => {
    if (balanceB) {
      const maxAmount = tokenB?.isNative 
        ? Math.max(0, parseFloat(balanceB.formatted) - 0.01)
        : parseFloat(balanceB.formatted)
      setAmountB(maxAmount.toString())
    }
  }, [balanceB, tokenB])

  // 🎯 价格区间处理
  const handleRangeChange = useCallback((min: number, max: number) => {
    setMinPrice(min)
    setMaxPrice(max)
  }, [])

  const handleFullRangeChange = useCallback((fullRange: boolean) => {
    setIsFullRange(fullRange)
  }, [])

  // 🎯 手续费等级选择
  const handleFeeTierSelect = useCallback((feeTier: number) => {
    setSelectedFeeTier(feeTier)
  }, [])

  // 🎯 Add liquidity处理
  const handleAddLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !amountA || !amountB || !selectedFeeTier) {
      console.error('❌ 缺少必要参数')
      return
    }

    try {
      console.log('🚀 开始添加V3流动性:', {
        tokenA: tokenA.symbol,
        tokenB: tokenB.symbol,
        amountA,
        amountB,
        feeTier: selectedFeeTier,
        priceRange: isFullRange ? 'Full Range' : `${minPrice} - ${maxPrice}`,
        currentPrice
      })

      // TODO: 实现V3Add liquidity逻辑
      // 1. 检查池子是否存在，不存在则创建
      // 2. 计算tick范围
      // 3. Approve token
      // 4. 调用V3 Position Manager的mint函数
      // 5. 处理Trade confirmation
      
      alert('V3 liquidity addition coming soon!')
      
    } catch (error: any) {
      console.error('❌ 添加V3流动性失败:', error)
    }
  }, [tokenA, tokenB, amountA, amountB, selectedFeeTier, minPrice, maxPrice, isFullRange, currentPrice])

  // 🎯 获取按钮文本
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!tokenA || !tokenB) return 'Select tokens'
    if (!selectedFeeTier) return 'Select fee tier'
    if (!amountA || !amountB) return 'Enter amounts'
    return 'Add V3 Liquidity'
  }

  const canAddLiquidity = isConnected && tokenA && tokenB && selectedFeeTier && amountA && amountB &&
    parseFloat(amountA) > 0 && parseFloat(amountB) > 0

  return (
    <LiquidityContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LiquidityHeader>
        <LiquidityTitle>Add V3 Liquidity</LiquidityTitle>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </LiquidityHeader>

      {/* V3功能说明 */}
      <V3InfoSection>
        <V3InfoTitle>🎯 Concentrated Liquidity</V3InfoTitle>
        <V3InfoText>
          Provide liquidity in a custom price range for higher capital efficiency and fees.
          Your position will be represented as an NFT.
        </V3InfoText>
      </V3InfoSection>

      {/* Fee Tier选择 - 必须在Token selection之前 */}
      <V3FeeTierSelector
        tokenA={tokenA}
        tokenB={tokenB}
        selectedFeeTier={selectedFeeTier}
        onFeeTierSelect={handleFeeTierSelect}
      />

      {/* 代币A输入 */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>First Token</TokenLabel>
          <BalanceRow>
            {balanceA && (
              <>
                <Balance>Balance: {parseFloat(balanceA.formatted).toFixed(4)}</Balance>
                <MaxButton onClick={handleMaxA}>MAX</MaxButton>
              </>
            )}
          </BalanceRow>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenAmountInput
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
          />
          <TokenSelectButton onClick={() => setShowTokenAModal(true)}>
            {tokenA ? (
              <>
                <TokenIcon>{tokenA.symbol.slice(0, 2)}</TokenIcon>
                {tokenA.symbol}
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 连接符号 */}
      <ConnectButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <PlusIcon className="w-5 h-5 text-white" />
      </ConnectButton>

      {/* 代币B输入 */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>Second Token</TokenLabel>
          <BalanceRow>
            {balanceB && (
              <>
                <Balance>Balance: {parseFloat(balanceB.formatted).toFixed(4)}</Balance>
                <MaxButton onClick={handleMaxB}>MAX</MaxButton>
              </>
            )}
          </BalanceRow>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenAmountInput
            type="number"
            placeholder="0.0"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
          />
          <TokenSelectButton onClick={() => setShowTokenBModal(true)}>
            {tokenB ? (
              <>
                <TokenIcon>{tokenB.symbol.slice(0, 2)}</TokenIcon>
                {tokenB.symbol}
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 价格区间选择 - V3核心功能 */}
      {tokenA && tokenB && selectedFeeTier && (
        <V3PriceRangeSelector
          tokenA={tokenA}
          tokenB={tokenB}
          currentPrice={currentPrice}
          onRangeChange={handleRangeChange}
          onFullRangeChange={handleFullRangeChange}
        />
      )}

      {/* Position预览 */}
      {tokenA && tokenB && selectedFeeTier && amountA && amountB && (
        <PositionPreview>
          <PreviewTitle>Position Preview</PreviewTitle>
          <PreviewRow>
            <PreviewLabel>Pool</PreviewLabel>
            <PreviewValue>{tokenA.symbol}/{tokenB.symbol}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Fee Tier</PreviewLabel>
            <PreviewValue>
              {selectedFeeTier === 100 ? '0.01%' :
               selectedFeeTier === 500 ? '0.05%' :
               selectedFeeTier === 3000 ? '0.3%' :
               selectedFeeTier === 10000 ? '1%' : `${selectedFeeTier / 10000}%`}
            </PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Range</PreviewLabel>
            <PreviewValue>
              {isFullRange ? 'Full Range (0 to ∞)' : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`}
            </PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Deposit</PreviewLabel>
            <PreviewValue>{amountA} {tokenA.symbol} + {amountB} {tokenB.symbol}</PreviewValue>
          </PreviewRow>
        </PositionPreview>
      )}

      {/* Add liquidity按钮 */}
      <AddLiquidityButton
        disabled={!canAddLiquidity}
        onClick={handleAddLiquidity}
        whileTap={{ scale: 0.98 }}
      >
        {getButtonText()}
      </AddLiquidityButton>

      {/* Token selection模态框 */}
      <TokenSelectModal
        isOpen={showTokenAModal}
        onClose={() => setShowTokenAModal(false)}
        onSelectToken={handleTokenASelect}
        selectedToken={tokenA}
      />
      
      <TokenSelectModal
        isOpen={showTokenBModal}
        onClose={() => setShowTokenBModal(false)}
        onSelectToken={handleTokenBSelect}
        selectedToken={tokenB}
      />
    </LiquidityContainer>
  )
}



