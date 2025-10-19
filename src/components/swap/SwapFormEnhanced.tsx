import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon, CogIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { formatUnits, parseUnits, Address } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import SwapSettings from './SwapSettings'
import SwapConfirmModal from './SwapConfirmModal'
import { useSwapCallback, SwapCallbackParams } from '../../hooks/swap/useSwapCallback'
import { useRouteOptimizer } from '../../hooks/swap/useRouteOptimizer'
import { useRouterAddress, TradeInfo, RouteType } from '../../hooks/swap/useRouterAddress'
import { Field, useSwapState, useSwapActionHandlers } from '../../state/swap/reducer'
import { useSwapInputError, useParsedAmount, useDerivedSwapInfo } from '../../hooks/swap/useSwapInputError'


// 🎨 Styled Components (继承原有样式)
const SwapContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const SwapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const SwapTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const SmartBadge = styled.span`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const AutoRouteText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 4px 0 0 0;
  font-style: italic;
`

const RouteInfo = styled(motion.div)`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #22c55e, #10b981);
    border-radius: 16px 16px 0 0;
  }
`

const RouteContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const RouteDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`

const RouteIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
  }
`

const RouteTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const RoutePrimaryText = styled.span`
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`

const RouteSecondaryText = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const RouteBadge = styled.span`
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const RefreshButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
  }
`

const RouteText = styled.span`
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
`

const RouteOptimizing = styled(motion.div)`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #818cf8, transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  span {
    color: #818cf8;
    font-size: 14px;
    font-weight: 500;
  }
`

const OptimizingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(129, 140, 248, 0.2);
  border-top: 3px solid #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const TokenInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 24px;
  font-weight: 600;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`

const TokenSelectButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const SwapButton = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
`

const SwapIconButton = styled.button`
  background: rgba(34, 197, 94, 0.2);
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.5);
    transform: rotate(180deg);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #22c55e;
  }
`

const SwapSubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  margin-top: 16px;

  ${props => props.disabled ? `
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
  ` : `
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      transform: translateY(-1px);
    }
  `}
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

/**
 * 🧠 Enhanced Swap Form with Smart Router
 * 集成了智能路由、路径优化和混合V2/V3交易的增强版Swap界面
 */
export default function SwapFormEnhanced() {
  // 🔌 Wallet connection
  const { address, isConnected } = useAccount()
  
  // 📝 Contract interactions
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  
  // 🔄 Swap state management (PancakeSwap architecture)
  const swapState = useSwapState()
  const { onCurrencySelection, onSwitchTokens, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const { independentField, typedValue, isExactIn, inputCurrencyId, outputCurrencyId } = useDerivedSwapInfo()
  
  // 🪙 Token data
  const { tokens, findTokenByAddress } = useTokens()
  const inputToken = useMemo(() => 
    inputCurrencyId ? (findTokenByAddress(inputCurrencyId as `0x${string}`) || null) : null, 
    [inputCurrencyId, findTokenByAddress]
  )
  const outputToken = useMemo(() => 
    outputCurrencyId ? (findTokenByAddress(outputCurrencyId as `0x${string}`) || null) : null, 
    [outputCurrencyId, findTokenByAddress]
  )
  
  // 💰 Balance data
  const { data: inputBalance } = useBalance({
    address,
    token: inputToken?.address !== '0x0000000000000000000000000000000000000000' 
      ? (inputToken?.address as `0x${string}`) 
      : undefined,
    query: { enabled: !!inputToken && !!address }
  })
  
  // 📊 Parsed amounts
  const parsedAmount = useParsedAmount(typedValue, isExactIn ? inputToken : outputToken)
  
  // 🚨 Input validation
  const inputError = useSwapInputError({
    inputToken,
    outputToken,
    inputBalance: inputBalance?.value,
    parsedAmount: isExactIn ? parsedAmount : undefined,
  })
  
  // 🎛️ UI state
  const [showInputModal, setShowInputModal] = useState(false)
  const [showOutputModal, setShowOutputModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // ⚙️ Trade settings
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [expertMode, setExpertMode] = useState(false)

  // 🧠 Smart routing
  const routeOptimizer = useRouteOptimizer(inputToken, outputToken, typedValue)
  
  // 💹 Trade info
  const tradeInfo = useMemo<TradeInfo | undefined>(() => {
    if (!inputToken || !outputToken || !typedValue) return undefined
    
    return {
      inputToken,
      outputToken,
      inputAmount: typedValue,
      routeType: routeOptimizer.bestRoute?.route.type
    }
  }, [inputToken, outputToken, typedValue, routeOptimizer.bestRoute])

  // 📍 Router address
  const routerAddress = useRouterAddress(tradeInfo)

  // 📊 Dependent amount calculation (based on routing)
  const dependentAmount = useMemo(() => {
    if (!routeOptimizer.bestRoute || !typedValue || parseFloat(typedValue) === 0) {
      return ''
    }

    const outputAmount = routeOptimizer.bestRoute.outputAmount
    const decimals = (isExactIn ? outputToken : inputToken)?.decimals || 18
    
    if (outputAmount > BigInt(0)) {
      const formatted = formatUnits(outputAmount, decimals)
      const truncated = parseFloat(formatted).toFixed(6)
      console.log(`💰 Route found: ${typedValue} ${isExactIn ? inputToken?.symbol : outputToken?.symbol} → ${truncated} ${isExactIn ? outputToken?.symbol : inputToken?.symbol}`)
      return truncated
    }
    
    return '0.0'
  }, [routeOptimizer.bestRoute, typedValue, isExactIn, inputToken, outputToken])

  // 🎯 Swap callback (PancakeSwap style)
  const swapCallbackParams: SwapCallbackParams = useMemo(() => {
    const bestRoute = routeOptimizer.bestRoute?.route
    const params = {
      inputToken,
      outputToken,
      inputAmount: typedValue,
      outputAmountMin: dependentAmount ? (parseFloat(dependentAmount) * 0.99).toString() : '0', // 1% slippage buffer
      recipient: address as `0x${string}`,
      deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
      routeType: bestRoute?.type,
      feeTier: bestRoute?.type === RouteType.V3 ? 3000 : undefined,
      path: bestRoute?.path  // 🔄 传递完整的多跳路径
    }
    
    console.log('🔍 SwapCallbackParams created:', {
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      inputAmount: params.inputAmount,
      outputAmountMin: params.outputAmountMin,
      recipient: params.recipient,
      routeType: params.routeType,
      deadline: params.deadline,
      hasPath: !!params.path,
      pathLength: params.path?.length || 0,
      pathPreview: params.path?.map((addr, i) => `${i}: ${addr.slice(0,6)}...`) || []
    })
    
    return params
  }, [inputToken, outputToken, typedValue, dependentAmount, address, deadline, routeOptimizer.bestRoute])
  
  // 🔍 Debug: Simple direct call test
  console.log('🔍 About to call useSwapCallback with params:', swapCallbackParams)
  
  // Direct call without try-catch to see raw error
  const swapCallback = useSwapCallback(swapCallbackParams)
  
  console.log('🔍 useSwapCallback returned:', swapCallback)
  
  // 🔍 Debug swap callback state
  console.log('🔍 Swap callback debug:', {
    state: swapCallback?.state,
    isLoading: swapCallback?.isLoading,
    hasCallback: !!swapCallback?.callback,
    swapCallbackParams
  })


  // 🔄 Handle token swap (PancakeSwap style)
  const handleSwapTokens = useCallback(() => {
    onSwitchTokens()
  }, [onSwitchTokens])

  // 🚀 智能防抖路由优化 - 减少频繁刷新
  const [lastOptimizeTime, setLastOptimizeTime] = useState(0)
  const [stableInputs, setStableInputs] = useState<{ inputToken: string | null, outputToken: string | null, typedValue: string }>({ inputToken: null, outputToken: null, typedValue: '' })
  
  useEffect(() => {
    if (inputToken && outputToken && typedValue && parseFloat(typedValue) > 0) {
      const currentInputs = { 
        inputToken: inputToken.address, 
        outputToken: outputToken.address, 
        typedValue 
      }
      
      // 检查输入是否真正改变
      const inputsChanged = 
        stableInputs.inputToken !== currentInputs.inputToken ||
        stableInputs.outputToken !== currentInputs.outputToken ||
        stableInputs.typedValue !== currentInputs.typedValue
      
      if (!inputsChanged) return
      
      console.log('🔍 Smart route optimization:', inputToken.symbol, '→', outputToken.symbol, typedValue)
      
      const timeoutId = setTimeout(() => {
        const now = Date.now()
        // 防止过于频繁的路由优化（最少间隔1秒）
        if (now - lastOptimizeTime > 1000) {
          if ('refresh' in routeOptimizer) {
            routeOptimizer.refresh()
            setLastOptimizeTime(now)
            setStableInputs(currentInputs)
          }
        }
      }, 1200) // 增加防抖延迟

      return () => clearTimeout(timeoutId)
    }
  }, [inputToken, outputToken, typedValue, routeOptimizer, lastOptimizeTime, stableInputs])

  // 🔄 刷新路径优化
  const handleRefreshRoutes = useCallback(() => {
    if ('refresh' in routeOptimizer) {
      routeOptimizer.refresh()
    }
  }, [routeOptimizer])


  // 💱 Handle swap confirmation (PancakeSwap style)
  const handleSwapConfirm = useCallback(async () => {
    if (!swapCallback.callback || !inputToken || !routerAddress || !publicClient || !address) {
      console.error('❌ Swap callback not available or missing required data')
      return
    }

    try {
      // 🔐 Step 1: Check current allowance and handle approval
      if (inputToken.address !== '0x0000000000000000000000000000000000000000') {
        console.log('🔐 Checking current allowance for:', inputToken.symbol)
        
        // Check current allowance
        const currentAllowance = await publicClient.readContract({
          address: inputToken.address as `0x${string}`,
          abi: [
            {
              "constant": true,
              "inputs": [
                {"name": "_owner", "type": "address"},
                {"name": "_spender", "type": "address"}
              ],
              "name": "allowance",
              "outputs": [{"name": "", "type": "uint256"}],
              "type": "function"
            }
          ],
          functionName: 'allowance',
          args: [address as `0x${string}`, routerAddress as `0x${string}`]
        }) as bigint
        
        const requiredAmount = parseUnits(typedValue, inputToken.decimals)
        console.log('🔍 Allowance check:', {
          current: currentAllowance.toString(),
          required: requiredAmount.toString(),
          needsApproval: currentAllowance < requiredAmount
        })
        
        // If allowance is insufficient, request approval
        if (currentAllowance < requiredAmount) {
          console.log('🔐 Insufficient allowance, requesting approval...')
          
          const approvalTxHash = await writeContractAsync({
            address: inputToken.address as `0x${string}`,
            abi: [
              {
                "constant": false,
                "inputs": [
                  {"name": "_spender", "type": "address"},
                  {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
              }
            ],
            functionName: 'approve',
            // Approve max amount for gas efficiency (PancakeSwap style)
            args: [routerAddress as `0x${string}`, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')]
          })
          
          console.log('⏳ Waiting for approval transaction to be confirmed...', approvalTxHash)
          
          // Wait for approval transaction to be confirmed
          const approvalReceipt = await publicClient.waitForTransactionReceipt({
            hash: approvalTxHash,
            timeout: 60000 // 60 seconds timeout
          })
          
          if (approvalReceipt.status === 'success') {
            console.log('✅ Approval transaction confirmed!')
          } else {
            throw new Error('Approval transaction failed')
          }
        } else {
          console.log('✅ Sufficient allowance already exists')
        }
      }
      
      // 🚀 Step 2: Execute swap transaction (only after approval is confirmed)
      console.log('🚀 Executing swap transaction...')
      const result = await swapCallback.callback()
      console.log('✅ Swap transaction successful:', result.hash)
      
      setShowConfirm(false)
      
      // Reset form state
      onUserInput(Field.INPUT, '')
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // 🛡️ Smart Router特殊错误处理
      if (errorMessage.includes('require(false)') && routerAddress?.toLowerCase() !== '0x1e1561ec8F1F83E36B8BfC3f8D5c01e2587Fbcb6'.toLowerCase()) {
        alert('❌ Smart Router交易失败，可能是合约接口问题。\n建议：\n1. 检查流动性是否充足\n2. 调整滑点设置\n3. 或联系技术支持修复Smart Router')
      } else if (errorMessage.includes('require(false)')) {
        alert('❌ 交易失败：可能是余额不足、流动性不够或滑点设置过严格')
      } else if (errorMessage.includes('User rejected')) {
        alert('❌ 用户取消了交易')
      } else if (errorMessage.includes('Approval transaction failed')) {
        alert('❌ 代币授权失败，请重试')
      } else {
        alert('❌ 交易失败：' + errorMessage)
      }
      
      // Keep modal open to allow retry
    }
  }, [swapCallback.callback, inputToken, routerAddress, typedValue, publicClient, address, writeContractAsync, onUserInput])

  // 🎨 渲染最优路径信息 - PancakeSwap风格
  const renderRouteInfo = () => {
    if (routeOptimizer.isLoading) {
      return (
        <RouteOptimizing
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <OptimizingSpinner />
          <span>🔍 Finding the best route across V2 & V3 pools...</span>
        </RouteOptimizing>
      )
    }

    if (routeOptimizer.bestRoute) {
      const route = routeOptimizer.bestRoute.route
      const isV2 = route.type === RouteType.V2
      const routerType = isV2 ? 'V2' : 'V3'
      const pathText = route.path.length === 2 ? 'Direct swap' : `${route.path.length - 1} hop`
      const priceImpact = routeOptimizer.bestRoute.priceImpact
      const gasEstimate = routeOptimizer.bestRoute.gasEstimate
      
      return (
        <RouteInfo
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <RouteContent>
            <RouteDetails>
              <RouteIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </RouteIcon>
              <RouteTextContainer>
                <RoutePrimaryText>
                  Best Route Found
                  <RouteBadge>{routerType}</RouteBadge>
                </RoutePrimaryText>
                <RouteSecondaryText>
                  {pathText} • {priceImpact.toFixed(2)}% price impact
                  {gasEstimate && (
                    <>
                      <span>•</span>
                      <span>~{Number(gasEstimate) / 1000000}M gas</span>
                    </>
                  )}
                </RouteSecondaryText>
              </RouteTextContainer>
            </RouteDetails>
            <RefreshButton
              onClick={handleRefreshRoutes}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh route"
            >
              <ArrowPathIcon />
            </RefreshButton>
          </RouteContent>
        </RouteInfo>
      )
    }

    return null
  }

  // ✅ Swap validation (PancakeSwap style) - with detailed debugging
  // 🔍 改进的路由状态检查
  const hasValidRoute = routeOptimizer.bestRoute && routeOptimizer.bestRoute.outputAmount > BigInt(0)
  const hasRouteError = !routeOptimizer.isLoading && !hasValidRoute && inputToken && outputToken && typedValue && parseFloat(typedValue) > 0

  const canSwapConditions = {
    noInputError: !inputError,
    swapCallbackValid: swapCallback?.state === 'VALID',
    walletConnected: isConnected,
    hasAddress: !!address,
    hasInputToken: !!inputToken,
    hasOutputToken: !!outputToken,
    hasTypedValue: !!typedValue,
    validAmount: typedValue ? parseFloat(typedValue) > 0 : false,
    routeNotLoading: !routeOptimizer.isLoading,
    swapCallbackNotLoading: !swapCallback?.isLoading,
    hasBestRoute: !!routeOptimizer.bestRoute,
    validOutputAmount: hasValidRoute,
    noRouteError: !hasRouteError
  }
  
  console.log('🔍 canSwap conditions debug:', canSwapConditions)
  console.log('🔍 inputError:', inputError)
  console.log('🔍 swapCallback state:', swapCallback?.state)
  console.log('🔍 hasValidRoute:', hasValidRoute)
  console.log('🔍 hasRouteError:', hasRouteError)
  
  // 📝 动态错误信息
  let displayError = inputError
  if (!displayError && hasRouteError) {
    if (inputToken?.symbol === 'mDAI' || outputToken?.symbol === 'mDAI') {
      displayError = `暂无 ${inputToken?.symbol} → ${outputToken?.symbol} 的流动性，mDAI流动性池可能未部署`
    } else {
      displayError = `暂无 ${inputToken?.symbol} → ${outputToken?.symbol} 的流动性或交易对`
    }
  }
  
  const canSwap = Boolean(
    canSwapConditions.noInputError &&
    canSwapConditions.swapCallbackValid &&
    canSwapConditions.walletConnected &&
    canSwapConditions.hasAddress &&
    canSwapConditions.hasInputToken &&
    canSwapConditions.hasOutputToken &&
    canSwapConditions.hasTypedValue &&
    canSwapConditions.validAmount &&
    canSwapConditions.routeNotLoading &&
    canSwapConditions.swapCallbackNotLoading &&
    canSwapConditions.validOutputAmount &&
    canSwapConditions.noRouteError
  )
  
  console.log('🔍 displayError:', displayError)
  console.log('🔍 Final canSwap result:', canSwap)

  return (
    <SwapContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 🎯 Header with Smart Router badge */}
      <SwapHeader>
        <div>
          <SwapTitle>
            Swap
            <SmartBadge>Auto</SmartBadge>
          </SwapTitle>
          <AutoRouteText>
            Automatically finds the best route across V2 & V3 pools
          </AutoRouteText>
        </div>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </SwapHeader>

      {/* 📥 Input Token */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>From</TokenLabel>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenInput
            type="number"
            placeholder="0.0"
            value={independentField === Field.INPUT ? typedValue : dependentAmount}
            onChange={(e) => onUserInput(Field.INPUT, e.target.value)}
            readOnly={independentField !== Field.INPUT}
          />
          <TokenSelectButton onClick={() => setShowInputModal(true)}>
            {inputToken ? (
              <>
                <span>{inputToken.symbol}</span>
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 🔄 Swap Button */}
      <SwapButton>
        <SwapIconButton onClick={handleSwapTokens}>
          <ArrowsUpDownIcon />
        </SwapIconButton>
      </SwapButton>

      {/* 📤 Output Token */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>To</TokenLabel>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenInput
            type="number"
            placeholder="0.0"
            value={independentField === Field.OUTPUT ? typedValue : dependentAmount}
            onChange={(e) => onUserInput(Field.OUTPUT, e.target.value)}
            readOnly={independentField !== Field.OUTPUT}
          />
          <TokenSelectButton onClick={() => setShowOutputModal(true)}>
            {outputToken ? (
              <>
                <span>{outputToken.symbol}</span>
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 🛣️ Route Information */}
      {renderRouteInfo()}

      {/* 💱 Swap Submit Button */}
      <SwapSubmitButton
        disabled={!canSwap}
        onClick={() => setShowConfirm(true)}
        whileTap={{ scale: 0.98 }}
      >
        {displayError || 'Swap'}
      </SwapSubmitButton>

      {/* 🎛️ Modals */}
      <TokenSelectModal
        isOpen={showInputModal}
        tokens={tokens}
        onSelectToken={(token) => {
          onCurrencySelection(Field.INPUT, token.address)
          setShowInputModal(false)
        }}
        onClose={() => setShowInputModal(false)}
        selectedToken={inputToken}
        title="Select input token"
      />
      
      <TokenSelectModal
        isOpen={showOutputModal}
        tokens={tokens}
        onSelectToken={(token) => {
          onCurrencySelection(Field.OUTPUT, token.address)
          setShowOutputModal(false)
        }}
        onClose={() => setShowOutputModal(false)}
        selectedToken={outputToken}
        title="Select output token"
      />

      <SwapSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
        expertMode={expertMode}
        onExpertModeChange={setExpertMode}
      />

      {showConfirm && inputToken && outputToken && (
        <SwapConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleSwapConfirm}
          inputToken={inputToken}
          outputToken={outputToken}
          inputAmount={isExactIn ? typedValue : dependentAmount}
          outputAmount={isExactIn ? dependentAmount : typedValue}
          priceImpact={routeOptimizer.bestRoute?.priceImpact || 0}
          slippage={slippage}
          minReceived={(parseFloat(isExactIn ? dependentAmount : typedValue) * (1 - slippage / 100)).toFixed(6)}
          isLoading={swapCallback.isLoading}
          routePath={routeOptimizer.bestRoute?.route.path?.map(addr => addr.toLowerCase()) || []}
        />
      )}
    </SwapContainer>
  )
}

import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon, CogIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { formatUnits, parseUnits, Address } from 'viem'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import SwapSettings from './SwapSettings'
import SwapConfirmModal from './SwapConfirmModal'
import { useSwapCallback, SwapCallbackParams } from '../../hooks/swap/useSwapCallback'
import { useRouteOptimizer } from '../../hooks/swap/useRouteOptimizer'
import { useRouterAddress, TradeInfo, RouteType } from '../../hooks/swap/useRouterAddress'
import { Field, useSwapState, useSwapActionHandlers } from '../../state/swap/reducer'
import { useSwapInputError, useParsedAmount, useDerivedSwapInfo } from '../../hooks/swap/useSwapInputError'


// 🎨 Styled Components (继承原有样式)
const SwapContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 24px;
`

const SwapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const SwapTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const SmartBadge = styled.span`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const AutoRouteText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 4px 0 0 0;
  font-style: italic;
`

const RouteInfo = styled(motion.div)`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #22c55e, #10b981);
    border-radius: 16px 16px 0 0;
  }
`

const RouteContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const RouteDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`

const RouteIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
  }
`

const RouteTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const RoutePrimaryText = styled.span`
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`

const RouteSecondaryText = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const RouteBadge = styled.span`
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const RefreshButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
  }
`

const RouteText = styled.span`
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
`

const RouteOptimizing = styled(motion.div)`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #818cf8, transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  span {
    color: #818cf8;
    font-size: 14px;
    font-weight: 500;
  }
`

const OptimizingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(129, 140, 248, 0.2);
  border-top: 3px solid #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const TokenInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 24px;
  font-weight: 600;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`

const TokenSelectButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const SwapButton = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
`

const SwapIconButton = styled.button`
  background: rgba(34, 197, 94, 0.2);
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.5);
    transform: rotate(180deg);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #22c55e;
  }
`

const SwapSubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  margin-top: 16px;

  ${props => props.disabled ? `
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
  ` : `
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      transform: translateY(-1px);
    }
  `}
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

/**
 * 🧠 Enhanced Swap Form with Smart Router
 * 集成了智能路由、路径优化和混合V2/V3交易的增强版Swap界面
 */
export default function SwapFormEnhanced() {
  // 🔌 Wallet connection
  const { address, isConnected } = useAccount()
  
  // 📝 Contract interactions
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  
  // 🔄 Swap state management (PancakeSwap architecture)
  const swapState = useSwapState()
  const { onCurrencySelection, onSwitchTokens, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const { independentField, typedValue, isExactIn, inputCurrencyId, outputCurrencyId } = useDerivedSwapInfo()
  
  // 🪙 Token data
  const { tokens, findTokenByAddress } = useTokens()
  const inputToken = useMemo(() => 
    inputCurrencyId ? (findTokenByAddress(inputCurrencyId as `0x${string}`) || null) : null, 
    [inputCurrencyId, findTokenByAddress]
  )
  const outputToken = useMemo(() => 
    outputCurrencyId ? (findTokenByAddress(outputCurrencyId as `0x${string}`) || null) : null, 
    [outputCurrencyId, findTokenByAddress]
  )
  
  // 💰 Balance data
  const { data: inputBalance } = useBalance({
    address,
    token: inputToken?.address !== '0x0000000000000000000000000000000000000000' 
      ? (inputToken?.address as `0x${string}`) 
      : undefined,
    query: { enabled: !!inputToken && !!address }
  })
  
  // 📊 Parsed amounts
  const parsedAmount = useParsedAmount(typedValue, isExactIn ? inputToken : outputToken)
  
  // 🚨 Input validation
  const inputError = useSwapInputError({
    inputToken,
    outputToken,
    inputBalance: inputBalance?.value,
    parsedAmount: isExactIn ? parsedAmount : undefined,
  })
  
  // 🎛️ UI state
  const [showInputModal, setShowInputModal] = useState(false)
  const [showOutputModal, setShowOutputModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // ⚙️ Trade settings
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [expertMode, setExpertMode] = useState(false)

  // 🧠 Smart routing
  const routeOptimizer = useRouteOptimizer(inputToken, outputToken, typedValue)
  
  // 💹 Trade info
  const tradeInfo = useMemo<TradeInfo | undefined>(() => {
    if (!inputToken || !outputToken || !typedValue) return undefined
    
    return {
      inputToken,
      outputToken,
      inputAmount: typedValue,
      routeType: routeOptimizer.bestRoute?.route.type
    }
  }, [inputToken, outputToken, typedValue, routeOptimizer.bestRoute])

  // 📍 Router address
  const routerAddress = useRouterAddress(tradeInfo)

  // 📊 Dependent amount calculation (based on routing)
  const dependentAmount = useMemo(() => {
    if (!routeOptimizer.bestRoute || !typedValue || parseFloat(typedValue) === 0) {
      return ''
    }

    const outputAmount = routeOptimizer.bestRoute.outputAmount
    const decimals = (isExactIn ? outputToken : inputToken)?.decimals || 18
    
    if (outputAmount > BigInt(0)) {
      const formatted = formatUnits(outputAmount, decimals)
      const truncated = parseFloat(formatted).toFixed(6)
      console.log(`💰 Route found: ${typedValue} ${isExactIn ? inputToken?.symbol : outputToken?.symbol} → ${truncated} ${isExactIn ? outputToken?.symbol : inputToken?.symbol}`)
      return truncated
    }
    
    return '0.0'
  }, [routeOptimizer.bestRoute, typedValue, isExactIn, inputToken, outputToken])

  // 🎯 Swap callback (PancakeSwap style)
  const swapCallbackParams: SwapCallbackParams = useMemo(() => {
    const bestRoute = routeOptimizer.bestRoute?.route
    const params = {
      inputToken,
      outputToken,
      inputAmount: typedValue,
      outputAmountMin: dependentAmount ? (parseFloat(dependentAmount) * 0.99).toString() : '0', // 1% slippage buffer
      recipient: address as `0x${string}`,
      deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
      routeType: bestRoute?.type,
      feeTier: bestRoute?.type === RouteType.V3 ? 3000 : undefined,
      path: bestRoute?.path  // 🔄 传递完整的多跳路径
    }
    
    console.log('🔍 SwapCallbackParams created:', {
      hasInputToken: !!params.inputToken,
      hasOutputToken: !!params.outputToken,
      inputAmount: params.inputAmount,
      outputAmountMin: params.outputAmountMin,
      recipient: params.recipient,
      routeType: params.routeType,
      deadline: params.deadline,
      hasPath: !!params.path,
      pathLength: params.path?.length || 0,
      pathPreview: params.path?.map((addr, i) => `${i}: ${addr.slice(0,6)}...`) || []
    })
    
    return params
  }, [inputToken, outputToken, typedValue, dependentAmount, address, deadline, routeOptimizer.bestRoute])
  
  // 🔍 Debug: Simple direct call test
  console.log('🔍 About to call useSwapCallback with params:', swapCallbackParams)
  
  // Direct call without try-catch to see raw error
  const swapCallback = useSwapCallback(swapCallbackParams)
  
  console.log('🔍 useSwapCallback returned:', swapCallback)
  
  // 🔍 Debug swap callback state
  console.log('🔍 Swap callback debug:', {
    state: swapCallback?.state,
    isLoading: swapCallback?.isLoading,
    hasCallback: !!swapCallback?.callback,
    swapCallbackParams
  })


  // 🔄 Handle token swap (PancakeSwap style)
  const handleSwapTokens = useCallback(() => {
    onSwitchTokens()
  }, [onSwitchTokens])

  // 🚀 智能防抖路由优化 - 减少频繁刷新
  const [lastOptimizeTime, setLastOptimizeTime] = useState(0)
  const [stableInputs, setStableInputs] = useState<{ inputToken: string | null, outputToken: string | null, typedValue: string }>({ inputToken: null, outputToken: null, typedValue: '' })
  
  useEffect(() => {
    if (inputToken && outputToken && typedValue && parseFloat(typedValue) > 0) {
      const currentInputs = { 
        inputToken: inputToken.address, 
        outputToken: outputToken.address, 
        typedValue 
      }
      
      // 检查输入是否真正改变
      const inputsChanged = 
        stableInputs.inputToken !== currentInputs.inputToken ||
        stableInputs.outputToken !== currentInputs.outputToken ||
        stableInputs.typedValue !== currentInputs.typedValue
      
      if (!inputsChanged) return
      
      console.log('🔍 Smart route optimization:', inputToken.symbol, '→', outputToken.symbol, typedValue)
      
      const timeoutId = setTimeout(() => {
        const now = Date.now()
        // 防止过于频繁的路由优化（最少间隔1秒）
        if (now - lastOptimizeTime > 1000) {
          if ('refresh' in routeOptimizer) {
            routeOptimizer.refresh()
            setLastOptimizeTime(now)
            setStableInputs(currentInputs)
          }
        }
      }, 1200) // 增加防抖延迟

      return () => clearTimeout(timeoutId)
    }
  }, [inputToken, outputToken, typedValue, routeOptimizer, lastOptimizeTime, stableInputs])

  // 🔄 刷新路径优化
  const handleRefreshRoutes = useCallback(() => {
    if ('refresh' in routeOptimizer) {
      routeOptimizer.refresh()
    }
  }, [routeOptimizer])


  // 💱 Handle swap confirmation (PancakeSwap style)
  const handleSwapConfirm = useCallback(async () => {
    if (!swapCallback.callback || !inputToken || !routerAddress || !publicClient || !address) {
      console.error('❌ Swap callback not available or missing required data')
      return
    }

    try {
      // 🔐 Step 1: Check current allowance and handle approval
      if (inputToken.address !== '0x0000000000000000000000000000000000000000') {
        console.log('🔐 Checking current allowance for:', inputToken.symbol)
        
        // Check current allowance
        const currentAllowance = await publicClient.readContract({
          address: inputToken.address as `0x${string}`,
          abi: [
            {
              "constant": true,
              "inputs": [
                {"name": "_owner", "type": "address"},
                {"name": "_spender", "type": "address"}
              ],
              "name": "allowance",
              "outputs": [{"name": "", "type": "uint256"}],
              "type": "function"
            }
          ],
          functionName: 'allowance',
          args: [address as `0x${string}`, routerAddress as `0x${string}`]
        }) as bigint
        
        const requiredAmount = parseUnits(typedValue, inputToken.decimals)
        console.log('🔍 Allowance check:', {
          current: currentAllowance.toString(),
          required: requiredAmount.toString(),
          needsApproval: currentAllowance < requiredAmount
        })
        
        // If allowance is insufficient, request approval
        if (currentAllowance < requiredAmount) {
          console.log('🔐 Insufficient allowance, requesting approval...')
          
          const approvalTxHash = await writeContractAsync({
            address: inputToken.address as `0x${string}`,
            abi: [
              {
                "constant": false,
                "inputs": [
                  {"name": "_spender", "type": "address"},
                  {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
              }
            ],
            functionName: 'approve',
            // Approve max amount for gas efficiency (PancakeSwap style)
            args: [routerAddress as `0x${string}`, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')]
          })
          
          console.log('⏳ Waiting for approval transaction to be confirmed...', approvalTxHash)
          
          // Wait for approval transaction to be confirmed
          const approvalReceipt = await publicClient.waitForTransactionReceipt({
            hash: approvalTxHash,
            timeout: 60000 // 60 seconds timeout
          })
          
          if (approvalReceipt.status === 'success') {
            console.log('✅ Approval transaction confirmed!')
          } else {
            throw new Error('Approval transaction failed')
          }
        } else {
          console.log('✅ Sufficient allowance already exists')
        }
      }
      
      // 🚀 Step 2: Execute swap transaction (only after approval is confirmed)
      console.log('🚀 Executing swap transaction...')
      const result = await swapCallback.callback()
      console.log('✅ Swap transaction successful:', result.hash)
      
      setShowConfirm(false)
      
      // Reset form state
      onUserInput(Field.INPUT, '')
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // 🛡️ Smart Router特殊错误处理
      if (errorMessage.includes('require(false)') && routerAddress?.toLowerCase() !== '0x1e1561ec8F1F83E36B8BfC3f8D5c01e2587Fbcb6'.toLowerCase()) {
        alert('❌ Smart Router交易失败，可能是合约接口问题。\n建议：\n1. 检查流动性是否充足\n2. 调整滑点设置\n3. 或联系技术支持修复Smart Router')
      } else if (errorMessage.includes('require(false)')) {
        alert('❌ 交易失败：可能是余额不足、流动性不够或滑点设置过严格')
      } else if (errorMessage.includes('User rejected')) {
        alert('❌ 用户取消了交易')
      } else if (errorMessage.includes('Approval transaction failed')) {
        alert('❌ 代币授权失败，请重试')
      } else {
        alert('❌ 交易失败：' + errorMessage)
      }
      
      // Keep modal open to allow retry
    }
  }, [swapCallback.callback, inputToken, routerAddress, typedValue, publicClient, address, writeContractAsync, onUserInput])

  // 🎨 渲染最优路径信息 - PancakeSwap风格
  const renderRouteInfo = () => {
    if (routeOptimizer.isLoading) {
      return (
        <RouteOptimizing
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <OptimizingSpinner />
          <span>🔍 Finding the best route across V2 & V3 pools...</span>
        </RouteOptimizing>
      )
    }

    if (routeOptimizer.bestRoute) {
      const route = routeOptimizer.bestRoute.route
      const isV2 = route.type === RouteType.V2
      const routerType = isV2 ? 'V2' : 'V3'
      const pathText = route.path.length === 2 ? 'Direct swap' : `${route.path.length - 1} hop`
      const priceImpact = routeOptimizer.bestRoute.priceImpact
      const gasEstimate = routeOptimizer.bestRoute.gasEstimate
      
      return (
        <RouteInfo
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <RouteContent>
            <RouteDetails>
              <RouteIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </RouteIcon>
              <RouteTextContainer>
                <RoutePrimaryText>
                  Best Route Found
                  <RouteBadge>{routerType}</RouteBadge>
                </RoutePrimaryText>
                <RouteSecondaryText>
                  {pathText} • {priceImpact.toFixed(2)}% price impact
                  {gasEstimate && (
                    <>
                      <span>•</span>
                      <span>~{Number(gasEstimate) / 1000000}M gas</span>
                    </>
                  )}
                </RouteSecondaryText>
              </RouteTextContainer>
            </RouteDetails>
            <RefreshButton
              onClick={handleRefreshRoutes}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh route"
            >
              <ArrowPathIcon />
            </RefreshButton>
          </RouteContent>
        </RouteInfo>
      )
    }

    return null
  }

  // ✅ Swap validation (PancakeSwap style) - with detailed debugging
  // 🔍 改进的路由状态检查
  const hasValidRoute = routeOptimizer.bestRoute && routeOptimizer.bestRoute.outputAmount > BigInt(0)
  const hasRouteError = !routeOptimizer.isLoading && !hasValidRoute && inputToken && outputToken && typedValue && parseFloat(typedValue) > 0

  const canSwapConditions = {
    noInputError: !inputError,
    swapCallbackValid: swapCallback?.state === 'VALID',
    walletConnected: isConnected,
    hasAddress: !!address,
    hasInputToken: !!inputToken,
    hasOutputToken: !!outputToken,
    hasTypedValue: !!typedValue,
    validAmount: typedValue ? parseFloat(typedValue) > 0 : false,
    routeNotLoading: !routeOptimizer.isLoading,
    swapCallbackNotLoading: !swapCallback?.isLoading,
    hasBestRoute: !!routeOptimizer.bestRoute,
    validOutputAmount: hasValidRoute,
    noRouteError: !hasRouteError
  }
  
  console.log('🔍 canSwap conditions debug:', canSwapConditions)
  console.log('🔍 inputError:', inputError)
  console.log('🔍 swapCallback state:', swapCallback?.state)
  console.log('🔍 hasValidRoute:', hasValidRoute)
  console.log('🔍 hasRouteError:', hasRouteError)
  
  // 📝 动态错误信息
  let displayError = inputError
  if (!displayError && hasRouteError) {
    if (inputToken?.symbol === 'mDAI' || outputToken?.symbol === 'mDAI') {
      displayError = `暂无 ${inputToken?.symbol} → ${outputToken?.symbol} 的流动性，mDAI流动性池可能未部署`
    } else {
      displayError = `暂无 ${inputToken?.symbol} → ${outputToken?.symbol} 的流动性或交易对`
    }
  }
  
  const canSwap = Boolean(
    canSwapConditions.noInputError &&
    canSwapConditions.swapCallbackValid &&
    canSwapConditions.walletConnected &&
    canSwapConditions.hasAddress &&
    canSwapConditions.hasInputToken &&
    canSwapConditions.hasOutputToken &&
    canSwapConditions.hasTypedValue &&
    canSwapConditions.validAmount &&
    canSwapConditions.routeNotLoading &&
    canSwapConditions.swapCallbackNotLoading &&
    canSwapConditions.validOutputAmount &&
    canSwapConditions.noRouteError
  )
  
  console.log('🔍 displayError:', displayError)
  console.log('🔍 Final canSwap result:', canSwap)

  return (
    <SwapContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 🎯 Header with Smart Router badge */}
      <SwapHeader>
        <div>
          <SwapTitle>
            Swap
            <SmartBadge>Auto</SmartBadge>
          </SwapTitle>
          <AutoRouteText>
            Automatically finds the best route across V2 & V3 pools
          </AutoRouteText>
        </div>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <CogIcon className="w-5 h-5" />
        </SettingsButton>
      </SwapHeader>

      {/* 📥 Input Token */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>From</TokenLabel>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenInput
            type="number"
            placeholder="0.0"
            value={independentField === Field.INPUT ? typedValue : dependentAmount}
            onChange={(e) => onUserInput(Field.INPUT, e.target.value)}
            readOnly={independentField !== Field.INPUT}
          />
          <TokenSelectButton onClick={() => setShowInputModal(true)}>
            {inputToken ? (
              <>
                <span>{inputToken.symbol}</span>
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 🔄 Swap Button */}
      <SwapButton>
        <SwapIconButton onClick={handleSwapTokens}>
          <ArrowsUpDownIcon />
        </SwapIconButton>
      </SwapButton>

      {/* 📤 Output Token */}
      <TokenInputContainer>
        <TokenInputHeader>
          <TokenLabel>To</TokenLabel>
        </TokenInputHeader>
        <TokenInputRow>
          <TokenInput
            type="number"
            placeholder="0.0"
            value={independentField === Field.OUTPUT ? typedValue : dependentAmount}
            onChange={(e) => onUserInput(Field.OUTPUT, e.target.value)}
            readOnly={independentField !== Field.OUTPUT}
          />
          <TokenSelectButton onClick={() => setShowOutputModal(true)}>
            {outputToken ? (
              <>
                <span>{outputToken.symbol}</span>
              </>
            ) : (
              'Select token'
            )}
          </TokenSelectButton>
        </TokenInputRow>
      </TokenInputContainer>

      {/* 🛣️ Route Information */}
      {renderRouteInfo()}

      {/* 💱 Swap Submit Button */}
      <SwapSubmitButton
        disabled={!canSwap}
        onClick={() => setShowConfirm(true)}
        whileTap={{ scale: 0.98 }}
      >
        {displayError || 'Swap'}
      </SwapSubmitButton>

      {/* 🎛️ Modals */}
      <TokenSelectModal
        isOpen={showInputModal}
        tokens={tokens}
        onSelectToken={(token) => {
          onCurrencySelection(Field.INPUT, token.address)
          setShowInputModal(false)
        }}
        onClose={() => setShowInputModal(false)}
        selectedToken={inputToken}
        title="Select input token"
      />
      
      <TokenSelectModal
        isOpen={showOutputModal}
        tokens={tokens}
        onSelectToken={(token) => {
          onCurrencySelection(Field.OUTPUT, token.address)
          setShowOutputModal(false)
        }}
        onClose={() => setShowOutputModal(false)}
        selectedToken={outputToken}
        title="Select output token"
      />

      <SwapSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
        expertMode={expertMode}
        onExpertModeChange={setExpertMode}
      />

      {showConfirm && inputToken && outputToken && (
        <SwapConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleSwapConfirm}
          inputToken={inputToken}
          outputToken={outputToken}
          inputAmount={isExactIn ? typedValue : dependentAmount}
          outputAmount={isExactIn ? dependentAmount : typedValue}
          priceImpact={routeOptimizer.bestRoute?.priceImpact || 0}
          slippage={slippage}
          minReceived={(parseFloat(isExactIn ? dependentAmount : typedValue) * (1 - slippage / 100)).toFixed(6)}
          isLoading={swapCallback.isLoading}
          routePath={routeOptimizer.bestRoute?.route.path?.map(addr => addr.toLowerCase()) || []}
        />
      )}
    </SwapContainer>
  )
}



