import { useState, useCallback, useEffect } from 'react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon, CogIcon, PlusIcon } from '@heroicons/react/24/outline'
import { parseUnits } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import { useLiquidityCallback } from '../../hooks/liquidity/useLiquidityCallback'
import { usePools } from '../../hooks/liquidity/usePools'

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

const PoolInfoSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`

const PoolInfoTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`

const PoolInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const PoolInfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`

const PoolInfoValue = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const LiquiditySubmitButton = styled(motion.button)`
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
 * 🥞 PancakeSwap V2风格的添加流动性界面
 * 完全参考PancakeSwap V2的设计和功能，移除所有假数据
 */
export default function AddLiquidityV2() {
  const { address, isConnected } = useAccount()
  const { tokens } = useTokens()
  
  // 🎯 流动性状态
  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  
  // 🎯 UI状态
  const [showTokenAModal, setShowTokenAModal] = useState(false)
  const [showTokenBModal, setShowTokenBModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(2.0)
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving-a' | 'approving-b' | 'adding' | 'success'>('idle')
  
  // 🎯 流动性Hooks
  const {
    executeApproval,
    executeAddLiquidity,
    approvalTxHash,
    liquidityTxHash,
    isApprovalLoading,
    isApprovalSuccess,
    isLiquidityLoading,
    isLiquiditySuccess,
    approvalError,
    liquidityError,
    routerAddress
  } = useLiquidityCallback()
  
  // 🎯 池子信息
  const {
    poolInfo,
    pairAddress,
    isLoading: isPoolLoading
  } = usePools(tokenA, tokenB)
  
  // 🎯 获取代币余额
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

  // 🎯 检查代币授权 - TokenA
  const { data: allowanceA } = useReadContract({
    address: tokenA?.address as `0x${string}`,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { type: 'address', name: 'owner' },
          { type: 'address', name: 'spender' }
        ],
        outputs: [{ type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: address && routerAddress ? [address, routerAddress as `0x${string}`] : undefined,
    enabled: !!(tokenA && !tokenA.isNative && address && routerAddress)
  })

  // 🎯 检查代币授权 - TokenB  
  const { data: allowanceB } = useReadContract({
    address: tokenB?.address as `0x${string}`,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { type: 'address', name: 'owner' },
          { type: 'address', name: 'spender' }
        ],
        outputs: [{ type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: address && routerAddress ? [address, routerAddress as `0x${string}`] : undefined,
    enabled: !!(tokenB && !tokenB.isNative && address && routerAddress)
  })

  // 🎯 初始化默认代币
  useEffect(() => {
    if (tokens.length >= 2 && !tokenA && !tokenB) {
      // 设置mWOKB和mUSDT为默认选择
      const mWOKB = tokens.find(t => t.symbol === 'mWOKB')
      const mUSDT = tokens.find(t => t.symbol === 'mUSDT')
      
      setTokenA(mWOKB || tokens[0])
      setTokenB(mUSDT || tokens[1])
    }
  }, [tokens, tokenA, tokenB])

  // 🎯 代币选择处理
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

  // 💰 MAX按钮处理
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

  // 🎯 检查是否需要授权
  const needsApprovalA = tokenA && !tokenA.isNative && amountA && allowanceA !== undefined
    ? parseUnits(amountA, tokenA.decimals) > (allowanceA as bigint)
    : false

  const needsApprovalB = tokenB && !tokenB.isNative && amountB && allowanceB !== undefined
    ? parseUnits(amountB, tokenB.decimals) > (allowanceB as bigint)
    : false

  // 🎯 计算池子信息
  const poolExists = poolInfo?.exists || false
  const liquidityPoolRate = tokenA && tokenB && amountA && amountB
    ? (parseFloat(amountB) / parseFloat(amountA)).toFixed(6)
    : ''

  const canAddLiquidity = tokenA && tokenB && amountA && amountB && 
    parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && currentStep === 'idle'

  // 🎯 执行添加流动性流程
  const handleAddLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !amountA || !amountB || !address) {
      console.error('❌ 缺少必要参数')
      return
    }

    try {
      console.log('🚀 开始V2添加流动性流程:', {
        tokenA: tokenA.symbol,
        tokenB: tokenB.symbol,
        amountA,
        amountB,
        needsApprovalA,
        needsApprovalB,
        currentStep
      })

      // 🎯 步骤1: 授权TokenA（如果需要）
      if (needsApprovalA) {
        console.log('🔐 授权TokenA...')
        setCurrentStep('approving-a')
        const success = await executeApproval(tokenA, amountA)
        if (!success) {
          console.error('❌ TokenA授权失败')
          setCurrentStep('idle')
          return
        }
        
        // 等待授权确认
        await new Promise<void>((resolve, reject) => {
          const checkApproval = () => {
            if (isApprovalSuccess) {
              console.log('✅ TokenA授权成功!')
              resolve()
            } else if (approvalError) {
              console.error('❌ TokenA授权出错:', approvalError)
              reject(approvalError)
            } else {
              setTimeout(checkApproval, 1000)
            }
          }
          checkApproval()
        })
      }

      // 🎯 步骤2: 授权TokenB（如果需要）
      if (needsApprovalB) {
        console.log('🔐 授权TokenB...')
        setCurrentStep('approving-b')
        const success = await executeApproval(tokenB, amountB)
        if (!success) {
          console.error('❌ TokenB授权失败')
          setCurrentStep('idle')
          return
        }
        
        // 等待授权确认
        await new Promise<void>((resolve, reject) => {
          const checkApproval = () => {
            if (isApprovalSuccess) {
              console.log('✅ TokenB授权成功!')
              resolve()
            } else if (approvalError) {
              console.error('❌ TokenB授权出错:', approvalError)
              reject(approvalError)
            } else {
              setTimeout(checkApproval, 1000)
            }
          }
          checkApproval()
        })
      }

      // 🎯 步骤3: 添加V2流动性
      console.log('💧 添加V2流动性...')
      setCurrentStep('adding')
      
      const liquidityParams = {
        tokenA,
        tokenB,
        amountA,
        amountB,
        slippage
      }
      
      const success = await executeAddLiquidity(liquidityParams)
      if (!success) {
        console.error('❌ 添加流动性失败')
        setCurrentStep('idle')
        return
      }

      // 等待流动性添加确认
      await new Promise<void>((resolve, reject) => {
        const checkLiquidity = () => {
          if (isLiquiditySuccess) {
            console.log('🎉 V2流动性添加成功!')
            setCurrentStep('success')
            
            // 清空输入
            setTimeout(() => {
              setAmountA('')
              setAmountB('')
              setCurrentStep('idle')
            }, 3000)
            
            resolve()
          } else if (liquidityError) {
            console.error('❌ 添加流动性出错:', liquidityError)
            reject(liquidityError)
          } else {
            setTimeout(checkLiquidity, 1000)
          }
        }
        checkLiquidity()
      })

    } catch (error: any) {
      console.error('❌ V2添加流动性流程失败:', error)
      setCurrentStep('idle')
    }
  }, [
    tokenA, tokenB, amountA, amountB, address, slippage,
    needsApprovalA, needsApprovalB, currentStep,
    executeApproval, executeAddLiquidity,
    isApprovalSuccess, isLiquiditySuccess,
    approvalError, liquidityError
  ])

  // 🎯 获取按钮文本
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!tokenA || !tokenB) return 'Select tokens'
    if (!amountA || !amountB) return 'Enter amounts'
    
    switch (currentStep) {
      case 'approving-a':
        return `Approving ${tokenA.symbol}...`
      case 'approving-b':
        return `Approving ${tokenB.symbol}...`
      case 'adding':
        return 'Adding V2 Liquidity...'
      case 'success':
        return '✅ V2 Liquidity Added!'
      default:
        if (needsApprovalA || needsApprovalB) {
          return `Approve & Add V2 Liquidity`
        }
        return 'Add V2 Liquidity'
    }
  }

  return (
    <LiquidityContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LiquidityHeader>
        <LiquidityTitle>Add V2 Liquidity</LiquidityTitle>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </LiquidityHeader>

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

      {/* V2池子信息 - 移除假数据 */}
      {tokenA && tokenB && (
        <PoolInfoSection>
          <PoolInfoTitle>V2 Pool Information</PoolInfoTitle>
          <PoolInfoRow>
            <PoolInfoLabel>Pool Status</PoolInfoLabel>
            <PoolInfoValue>
              {isPoolLoading ? '🔍 Checking...' : 
               poolExists ? '✅ V2 Pool Exists' : '🆕 New V2 Pool'}
            </PoolInfoValue>
          </PoolInfoRow>
          
          {poolInfo && poolExists && (
            <>
              <PoolInfoRow>
                <PoolInfoLabel>Pool Address</PoolInfoLabel>
                <PoolInfoValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                  {pairAddress.slice(0, 10)}...{pairAddress.slice(-8)}
                </PoolInfoValue>
              </PoolInfoRow>
              <PoolInfoRow>
                <PoolInfoLabel>Reserves</PoolInfoLabel>
                <PoolInfoValue>
                  {parseFloat(poolInfo.reserve0).toFixed(4)} / {parseFloat(poolInfo.reserve1).toFixed(4)}
                </PoolInfoValue>
              </PoolInfoRow>
            </>
          )}
          
          {liquidityPoolRate && amountA && amountB && (
            <>
              <PoolInfoRow>
                <PoolInfoLabel>Exchange Rate</PoolInfoLabel>
                <PoolInfoValue>1 {tokenA.symbol} = {liquidityPoolRate} {tokenB.symbol}</PoolInfoValue>
              </PoolInfoRow>
              <PoolInfoRow>
                <PoolInfoLabel>Your Share</PoolInfoLabel>
                <PoolInfoValue>
                  {poolExists ? 'Adding to existing V2 pool' : 'New V2 Pool (100%)'}
                </PoolInfoValue>
              </PoolInfoRow>
            </>
          )}
          
          {(needsApprovalA || needsApprovalB) && (
            <PoolInfoRow>
              <PoolInfoLabel>Required Approvals</PoolInfoLabel>
              <PoolInfoValue>
                {needsApprovalA && needsApprovalB ? 'Both tokens' :
                 needsApprovalA ? tokenA.symbol :
                 needsApprovalB ? tokenB.symbol : 'None'}
              </PoolInfoValue>
            </PoolInfoRow>
          )}
        </PoolInfoSection>
      )}

      {/* 添加V2流动性按钮 */}
      <LiquiditySubmitButton
        disabled={!canAddLiquidity || currentStep !== 'idle'}
        onClick={handleAddLiquidity}
        whileTap={{ scale: 0.98 }}
      >
        {getButtonText()}
      </LiquiditySubmitButton>

      {/* 代币选择模态框 */}
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
