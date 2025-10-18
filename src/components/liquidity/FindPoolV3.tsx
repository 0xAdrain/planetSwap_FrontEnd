import { useState, useCallback, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'

const FindContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const FindHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const FindTitle = styled.h2`
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

const FindDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
`

const TokenSelector = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(139, 92, 246, 0.3);
    background: rgba(139, 92, 246, 0.05);
  }
`

const TokenSelectorLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`

const TokenDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
`

const TokenInfo = styled.div`
  flex: 1;
`

const TokenSymbol = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
`

const TokenName = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
`

const TokenPlaceholder = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
`

const FeeTierSelector = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
`

const FeeTierTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const FeeTierGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const FeeTierOption = styled.button<{ selected?: boolean; disabled?: boolean }>`
  background: ${props => 
    props.disabled ? 'rgba(255, 255, 255, 0.02)' :
    props.selected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => 
    props.disabled ? 'rgba(255, 255, 255, 0.05)' :
    props.selected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 12px;
  color: ${props => 
    props.disabled ? 'rgba(255, 255, 255, 0.3)' :
    props.selected ? '#a855f7' : 'rgba(255, 255, 255, 0.7)'
  };
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => 
      props.disabled ? 'rgba(255, 255, 255, 0.02)' :
      props.selected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.08)'
    };
    color: ${props => 
      props.disabled ? 'rgba(255, 255, 255, 0.3)' : '#a855f7'
    };
  }
`

const FeeTierLabel = styled.div`
  font-weight: 700;
  margin-bottom: 2px;
`

const FeeTierDescription = styled.div`
  font-size: 10px;
  opacity: 0.8;
`

const ResultSection = styled.div<{ type: 'success' | 'warning' | 'error' }>`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(34, 197, 94, 0.1)'
      case 'warning': return 'rgba(245, 158, 11, 0.1)'
      case 'error': return 'rgba(239, 68, 68, 0.1)'
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return 'rgba(34, 197, 94, 0.2)'
      case 'warning': return 'rgba(245, 158, 11, 0.2)'  
      case 'error': return 'rgba(239, 68, 68, 0.2)'
    }
  }};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
`

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const ResultTitle = styled.h3<{ type: 'success' | 'warning' | 'error' }>`
  color: ${props => {
    switch (props.type) {
      case 'success': return '#22c55e'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
    }
  }};
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`

const ResultContent = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
`

const PoolStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
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

const ConnectButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;
  }
`

// V3费率等级配置
const FEE_TIERS = [
  { fee: 100, label: '0.01%', description: 'Stablecoin pairs' },
  { fee: 500, label: '0.05%', description: 'Standard pairs' },
  { fee: 3000, label: '0.30%', description: 'Most pairs' },
  { fee: 10000, label: '1.00%', description: 'Volatile pairs' }
]

interface Pool {
  address: string
  token0: Token
  token1: Token
  fee: number
  liquidity: string
  sqrtPriceX96: string
  tick: number
}

/**
 * 🎨 V3池子查找组件
 * 查找和连接到现有的V3流动性池
 */
export default function FindPoolV3() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { tokens } = useTokens()

  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const [selectedFee, setSelectedFee] = useState<number>(3000) // 默认0.3%
  const [showTokenAModal, setShowTokenAModal] = useState(false)
  const [showTokenBModal, setShowTokenBModal] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    type: 'success' | 'warning' | 'error'
    pool: Pool | null
    message: string
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // 🔍 搜索V3池子
  const searchPool = useCallback(async () => {
    if (!tokenA || !tokenB || !selectedFee) return

    setIsSearching(true)
    setSearchResult(null)

    try {
      console.log('🎨 搜索V3池子:', {
        tokenA: tokenA.symbol,
        tokenB: tokenB.symbol,
        fee: selectedFee
      })

      // TODO: 实现真实的V3池子查询
      // 1. 调用V3Factory.getPool(token0, token1, fee)
      // 2. 检查池子是否存在
      // 3. 如果存在，获取池子信息(liquidity, sqrtPriceX96等)

      // 模拟搜索结果
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟找到池子的情况
      if (tokenA.symbol === 'mWOKB' && tokenB.symbol === 'mUSDT') {
        const mockPool: Pool = {
          address: '0x1234567890123456789012345678901234567890',
          token0: tokenA,
          token1: tokenB,
          fee: selectedFee,
          liquidity: '1234567890123456789',
          sqrtPriceX96: '79228162514264337593543950336',
          tick: 0
        }

        setSearchResult({
          type: 'success',
          pool: mockPool,
          message: `Found V3 pool for ${tokenA.symbol}/${tokenB.symbol} with ${selectedFee/10000}% fee`
        })
      } else {
        setSearchResult({
          type: 'error',
          pool: null,
          message: `No V3 pool exists for ${tokenA.symbol}/${tokenB.symbol} with ${selectedFee/10000}% fee. You can create one by adding liquidity.`
        })
      }

    } catch (error) {
      console.error('❌ V3池子搜索失败:', error)
      setSearchResult({
        type: 'error',
        pool: null,
        message: 'Failed to search for V3 pool. Please try again.'
      })
    } finally {
      setIsSearching(false)
    }
  }, [tokenA, tokenB, selectedFee])

  // 🔄 自动搜索
  useEffect(() => {
    if (tokenA && tokenB && selectedFee) {
      searchPool()
    } else {
      setSearchResult(null)
    }
  }, [tokenA, tokenB, selectedFee, searchPool])

  // 🎯 连接到池子
  const connectToPool = useCallback(() => {
    if (!searchResult?.pool) return

    console.log('🔗 连接到V3池子:', searchResult.pool)
    // TODO: 导航到Add Liquidity页面并预填参数
    alert('V3池子连接功能开发中...')
  }, [searchResult])

  return (
    <FindContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <FindHeader>
        <FindTitle>
          <MagnifyingGlassIcon className="w-5 h-5" />
          Find V3 Pool
          <V3Badge>V3</V3Badge>
        </FindTitle>
      </FindHeader>

      {/* Description */}
      <FindDescription>
        Find and connect to existing V3 liquidity pools. V3 pools are created with specific fee tiers and concentrated liquidity ranges.
      </FindDescription>

      {/* Token A Selector */}
      <TokenSelector onClick={() => setShowTokenAModal(true)}>
        <TokenSelectorLabel>Token A</TokenSelectorLabel>
        <TokenDisplay>
          {tokenA ? (
            <>
              <TokenIcon>{tokenA.symbol.slice(0, 2)}</TokenIcon>
              <TokenInfo>
                <TokenSymbol>{tokenA.symbol}</TokenSymbol>
                <TokenName>{tokenA.name}</TokenName>
              </TokenInfo>
            </>
          ) : (
            <TokenPlaceholder>Select first token</TokenPlaceholder>
          )}
        </TokenDisplay>
      </TokenSelector>

      {/* Token B Selector */}
      <TokenSelector onClick={() => setShowTokenBModal(true)}>
        <TokenSelectorLabel>Token B</TokenSelectorLabel>
        <TokenDisplay>
          {tokenB ? (
            <>
              <TokenIcon>{tokenB.symbol.slice(0, 2)}</TokenIcon>
              <TokenInfo>
                <TokenSymbol>{tokenB.symbol}</TokenSymbol>
                <TokenName>{tokenB.name}</TokenName>
              </TokenInfo>
            </>
          ) : (
            <TokenPlaceholder>Select second token</TokenPlaceholder>
          )}
        </TokenDisplay>
      </TokenSelector>

      {/* Fee Tier Selector */}
      <FeeTierSelector>
        <FeeTierTitle>Fee Tier</FeeTierTitle>
        <FeeTierGrid>
          {FEE_TIERS.map((tier) => (
            <FeeTierOption
              key={tier.fee}
              selected={selectedFee === tier.fee}
              onClick={() => setSelectedFee(tier.fee)}
            >
              <FeeTierLabel>{tier.label}</FeeTierLabel>
              <FeeTierDescription>{tier.description}</FeeTierDescription>
            </FeeTierOption>
          ))}
        </FeeTierGrid>
      </FeeTierSelector>

      {/* Search Results */}
      {isSearching && (
        <ResultSection type="warning">
          <ResultHeader>
            <MagnifyingGlassIcon className="w-5 h-5 text-yellow-500" />
            <ResultTitle type="warning">Searching...</ResultTitle>
          </ResultHeader>
          <ResultContent>
            Looking for V3 pool with the selected parameters...
          </ResultContent>
        </ResultSection>
      )}

      {searchResult && (
        <ResultSection type={searchResult.type}>
          <ResultHeader>
            {searchResult.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
            <ResultTitle type={searchResult.type}>
              {searchResult.type === 'success' ? 'Pool Found!' : 'Pool Not Found'}
            </ResultTitle>
          </ResultHeader>
          <ResultContent>{searchResult.message}</ResultContent>
          
          {searchResult.pool && (
            <PoolStats>
              <PoolStat>
                <PoolStatLabel>Pool Address</PoolStatLabel>
                <PoolStatValue>{searchResult.pool.address.slice(0, 8)}...{searchResult.pool.address.slice(-6)}</PoolStatValue>
              </PoolStat>
              <PoolStat>
                <PoolStatLabel>Fee Tier</PoolStatLabel>
                <PoolStatValue>{searchResult.pool.fee / 10000}%</PoolStatValue>
              </PoolStat>
              <PoolStat>
                <PoolStatLabel>Current Tick</PoolStatLabel>
                <PoolStatValue>{searchResult.pool.tick}</PoolStatValue>
              </PoolStat>
              <PoolStat>
                <PoolStatLabel>Liquidity</PoolStatLabel>
                <PoolStatValue>{parseFloat(searchResult.pool.liquidity).toFixed(2)}</PoolStatValue>
              </PoolStat>
            </PoolStats>
          )}
        </ResultSection>
      )}

      {/* Connect Button */}
      {searchResult?.type === 'success' && (
        <ConnectButton onClick={connectToPool}>
          <CheckCircleIcon className="w-5 h-5" />
          Connect to Pool
        </ConnectButton>
      )}

      {/* Token Select Modals */}
      <TokenSelectModal
        isOpen={showTokenAModal}
        onClose={() => setShowTokenAModal(false)}
        onSelectToken={(token) => {
          setTokenA(token)
          setShowTokenAModal(false)
        }}
        tokens={tokens}
        selectedToken={tokenA}
        title="Select Token A"
      />

      <TokenSelectModal
        isOpen={showTokenBModal}
        onClose={() => setShowTokenBModal(false)}
        onSelectToken={(token) => {
          setTokenB(token)
          setShowTokenBModal(false)
        }}
        tokens={tokens}
        selectedToken={tokenB}
        title="Select Token B"
      />
    </FindContainer>
  )
}
