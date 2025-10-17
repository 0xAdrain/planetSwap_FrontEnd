import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { isAddress } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'

const ImportContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const ImportTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`

const ImportDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
`

const SearchSection = styled.div`
  margin-bottom: 24px;
`

const SearchMethods = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const SearchMethod = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)'};
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const TokenPairSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const TokenSelector = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 60px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
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

const AddressInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  padding: 16px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
`

const SearchButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PoolResult = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
`

const PoolResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const PoolTokens = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PoolPairName = styled.span`
  color: white;
  font-size: 18px;
  font-weight: 600;
`

const PoolBadge = styled.span`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  color: #22c55e;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
`

const PoolAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`

const AddressText = styled.code`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
`

const ExplorerLink = styled.a`
  color: #22c55e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`

const PoolStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
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

const WarningBox = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
`

const WarningIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
`

const WarningContent = styled.div``

const WarningTitle = styled.div`
  color: #f59e0b;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`

const WarningText = styled.div`
  color: rgba(245, 158, 11, 0.9);
  font-size: 13px;
  line-height: 1.4;
`

const ImportButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  margin-top: 24px;
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

type SearchMethod = 'tokens' | 'address'

interface PoolInfo {
  tokenA: Token
  tokenB: Token
  pairAddress: string
  reserve0: string
  reserve1: string
  totalSupply: string
  exists: boolean
}

/**
 * 🥞 PancakeSwap风格的导入池子界面
 * 完全对标PancakeSwap的Import Pool功能
 */
export default function ImportPoolV2() {
  const { address, isConnected } = useAccount()
  const { tokens } = useTokens()
  
  // 🎯 状态管理
  const [searchMethod, setSearchMethod] = useState<SearchMethod>('tokens')
  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const [pairAddress, setPairAddress] = useState('')
  const [showTokenAModal, setShowTokenAModal] = useState(false)
  const [showTokenBModal, setShowTokenBModal] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<PoolInfo | null>(null)
  const [searchError, setSearchError] = useState('')
  
  // 🎯 合约地址
  const contracts = getContractAddresses(ChainId.X_LAYER_TESTNET)
  const factoryAddress = contracts.PLANET_FACTORY

  // 🎯 通过代币对搜索池子
  const { data: poolAddress, refetch: refetchPoolAddress } = useReadContract({
    address: factoryAddress as `0x${string}`,
    abi: [
      {
        name: 'getPair',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { type: 'address', name: 'tokenA' },
          { type: 'address', name: 'tokenB' }
        ],
        outputs: [{ type: 'address' }]
      }
    ],
    functionName: 'getPair',
    args: tokenA && tokenB ? [
      tokenA.address as `0x${string}`,
      tokenB.address as `0x${string}`
    ] : undefined,
    enabled: false
  })

  // 🎯 搜索池子
  const handleSearch = useCallback(async () => {
    if (!isConnected) return

    setIsSearching(true)
    setSearchError('')
    setSearchResult(null)

    try {
      if (searchMethod === 'tokens') {
        if (!tokenA || !tokenB) {
          setSearchError('Please select both tokens')
          return
        }

        // 搜索池子地址
        const result = await refetchPoolAddress()
        const foundAddress = result.data as string
        
        if (!foundAddress || foundAddress === '0x0000000000000000000000000000000000000000') {
          setSearchError(`No pool found for ${tokenA.symbol}/${tokenB.symbol}`)
          return
        }

        // TODO: 获取池子详细信息
        const mockPoolInfo: PoolInfo = {
          tokenA,
          tokenB,
          pairAddress: foundAddress,
          reserve0: '5000.0',
          reserve1: '1000000.0',
          totalSupply: '50000.0',
          exists: true
        }

        setSearchResult(mockPoolInfo)
        
      } else {
        // 地址搜索
        if (!isAddress(pairAddress)) {
          setSearchError('Invalid pool address')
          return
        }

        // TODO: 通过地址获取池子信息
        setSearchError('Address search not implemented yet')
      }

    } catch (error: any) {
      console.error('❌ 搜索池子失败:', error)
      setSearchError('Failed to search pool')
    } finally {
      setIsSearching(false)
    }
  }, [searchMethod, tokenA, tokenB, pairAddress, isConnected, refetchPoolAddress])

  // 🎯 导入池子
  const handleImportPool = useCallback(async () => {
    if (!searchResult) return

    try {
      console.log('📥 导入池子:', searchResult.pairAddress)
      
      // TODO: 实现池子导入逻辑
      // 1. 添加到本地存储
      // 2. 添加到用户池子列表
      // 3. 显示成功提示
      
      alert('Pool imported successfully!')
      
    } catch (error: any) {
      console.error('❌ 导入池子失败:', error)
    }
  }, [searchResult])

  const canSearch = searchMethod === 'tokens' 
    ? tokenA && tokenB 
    : pairAddress && isAddress(pairAddress)

  return (
    <ImportContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ImportTitle>Import V2 Pool</ImportTitle>
      <ImportDescription>
        Import an existing pool that doesn't appear in the interface.
      </ImportDescription>

      <SearchSection>
        <SearchMethods>
          <SearchMethod
            active={searchMethod === 'tokens'}
            onClick={() => setSearchMethod('tokens')}
          >
            By Tokens
          </SearchMethod>
          <SearchMethod
            active={searchMethod === 'address'}
            onClick={() => setSearchMethod('address')}
          >
            By Address
          </SearchMethod>
        </SearchMethods>

        {searchMethod === 'tokens' ? (
          <TokenPairSelector>
            <TokenSelector onClick={() => setShowTokenAModal(true)}>
              {tokenA ? (
                <>
                  <TokenIcon>{tokenA.symbol.slice(0, 2)}</TokenIcon>
                  <span>{tokenA.symbol}</span>
                </>
              ) : (
                <span>Select Token</span>
              )}
            </TokenSelector>
            
            <TokenSelector onClick={() => setShowTokenBModal(true)}>
              {tokenB ? (
                <>
                  <TokenIcon>{tokenB.symbol.slice(0, 2)}</TokenIcon>
                  <span>{tokenB.symbol}</span>
                </>
              ) : (
                <span>Select Token</span>
              )}
            </TokenSelector>
          </TokenPairSelector>
        ) : (
          <AddressInput
            type="text"
            placeholder="0x1234567890123456789012345678901234567890"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
          />
        )}

        <SearchButton
          disabled={!canSearch || isSearching}
          onClick={handleSearch}
          whileTap={{ scale: 0.98 }}
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Search Pool'}
        </SearchButton>

        {searchError && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            marginTop: '12px',
            textAlign: 'center'
          }}>
            {searchError}
          </div>
        )}
      </SearchSection>

      {/* 搜索结果 */}
      {searchResult && (
        <PoolResult
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <PoolResultHeader>
            <PoolTokens>
              <TokenIcon>{searchResult.tokenA.symbol.slice(0, 2)}</TokenIcon>
              <TokenIcon>{searchResult.tokenB.symbol.slice(0, 2)}</TokenIcon>
              <PoolPairName>
                {searchResult.tokenA.symbol}/{searchResult.tokenB.symbol}
              </PoolPairName>
            </PoolTokens>
            <PoolBadge>V2</PoolBadge>
          </PoolResultHeader>

          <PoolAddress>
            <AddressText>
              {searchResult.pairAddress.slice(0, 6)}...{searchResult.pairAddress.slice(-4)}
            </AddressText>
            <ExplorerLink
              href={`https://web3.okx.com/explorer/xlayer-test/address/${searchResult.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              View
            </ExplorerLink>
          </PoolAddress>

          <PoolStats>
            <PoolStat>
              <PoolStatLabel>{searchResult.tokenA.symbol} Reserve</PoolStatLabel>
              <PoolStatValue>{parseFloat(searchResult.reserve0).toFixed(4)}</PoolStatValue>
            </PoolStat>
            <PoolStat>
              <PoolStatLabel>{searchResult.tokenB.symbol} Reserve</PoolStatLabel>
              <PoolStatValue>{parseFloat(searchResult.reserve1).toFixed(4)}</PoolStatValue>
            </PoolStat>
            <PoolStat>
              <PoolStatLabel>Total Supply</PoolStatLabel>
              <PoolStatValue>{parseFloat(searchResult.totalSupply).toFixed(4)}</PoolStatValue>
            </PoolStat>
            <PoolStat>
              <PoolStatLabel>Pool Status</PoolStatLabel>
              <PoolStatValue style={{ color: '#22c55e' }}>Active</PoolStatValue>
            </PoolStat>
          </PoolStats>

          <WarningBox>
            <WarningIcon>
              <ExclamationTriangleIcon className="w-5 h-5" />
            </WarningIcon>
            <WarningContent>
              <WarningTitle>Import at your own risk</WarningTitle>
              <WarningText>
                Anyone can create a token with any name. Make sure this is the pool you want to import.
              </WarningText>
            </WarningContent>
          </WarningBox>

          <ImportButton
            onClick={handleImportPool}
            whileTap={{ scale: 0.98 }}
          >
            <PlusIcon className="w-4 h-4" />
            Import Pool
          </ImportButton>
        </PoolResult>
      )}

      {/* 空状态 */}
      {!searchResult && !searchError && !isSearching && (
        <EmptyState>
          <EmptyStateIcon>
            <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          </EmptyStateIcon>
          <EmptyStateText>No pools searched yet</EmptyStateText>
          <EmptyStateSubtext>
            Select tokens or enter a pool address to search
          </EmptyStateSubtext>
        </EmptyState>
      )}

      {/* Token selection模态框 */}
      <TokenSelectModal
        isOpen={showTokenAModal}
        onClose={() => setShowTokenAModal(false)}
        onSelectToken={(token) => {
          setTokenA(token)
          setShowTokenAModal(false)
        }}
        selectedToken={tokenA}
      />
      
      <TokenSelectModal
        isOpen={showTokenBModal}
        onClose={() => setShowTokenBModal(false)}
        onSelectToken={(token) => {
          setTokenB(token)
          setShowTokenBModal(false)
        }}
        selectedToken={tokenB}
      />
    </ImportContainer>
  )
}
