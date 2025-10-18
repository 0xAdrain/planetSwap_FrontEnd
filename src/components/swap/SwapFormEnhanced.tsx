import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon, CogIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Token, useTokens } from '../../hooks/contracts/useTokens'
import { TokenSelectModal } from '../common/TokenSelectModal'
import SwapSettings from './SwapSettings'
import SwapConfirmModal from './SwapConfirmModal'
import { useSmartRouterCallback, SmartSwapParams } from '../../hooks/swap/useSmartRouterCallback'
import { useRouteOptimizer } from '../../hooks/swap/useRouteOptimizer'
import { useRouterAddress, TradeInfo, RouteType } from '../../hooks/swap/useRouterAddress'

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

const RouteInfo = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const RouteText = styled.span`
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
`

const RouteOptimizing = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
`

const OptimizingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-top: 2px solid #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;

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
  // 🔌 钱包连接
  const { address, isConnected } = useAccount()
  
  // 🪙 代币相关状态
  const { tokens } = useTokens()
  const [inputToken, setInputToken] = useState<Token | null>(null)
  const [outputToken, setOutputToken] = useState<Token | null>(null)
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  
  // 🎛️ UI状态
  const [showInputModal, setShowInputModal] = useState(false)
  const [showOutputModal, setShowOutputModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // ⚙️ 交易设置
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [expertMode, setExpertMode] = useState(false)
  
  // 🧠 智能路由Hooks
  const routeOptimizer = useRouteOptimizer(inputToken, outputToken, inputAmount)
  const smartRouterCallback = useSmartRouterCallback()
  
  // 💹 交易信息
  const tradeInfo = useMemo<TradeInfo | undefined>(() => {
    if (!inputToken || !outputToken || !inputAmount) return undefined
    
    return {
      inputToken,
      outputToken,
      inputAmount,
      routeType: routeOptimizer.bestRoute?.route.type
    }
  }, [inputToken, outputToken, inputAmount, routeOptimizer.bestRoute])

  // 📍 智能Router地址
  const routerAddress = useRouterAddress(tradeInfo)

  // 🔄 处理代币交换
  const handleSwapTokens = useCallback(() => {
    const tempToken = inputToken
    const tempAmount = inputAmount
    
    setInputToken(outputToken)
    setOutputToken(tempToken)
    setInputAmount(outputAmount)
    setOutputAmount(tempAmount)
  }, [inputToken, outputToken, inputAmount, outputAmount])

  // 📊 更新输出数量基于最优路径
  useEffect(() => {
    if (routeOptimizer.bestRoute && inputAmount) {
      const estimatedOutput = routeOptimizer.bestRoute.outputAmount
      const decimals = outputToken?.decimals || 18
      const formattedOutput = (Number(estimatedOutput) / Math.pow(10, decimals)).toFixed(6)
      setOutputAmount(formattedOutput)
    }
  }, [routeOptimizer.bestRoute, inputAmount, outputToken])

  // 🔄 刷新路径优化
  const handleRefreshRoutes = useCallback(() => {
    if ('refresh' in routeOptimizer) {
      routeOptimizer.refresh()
    }
  }, [routeOptimizer])

  // 💱 处理交换确认
  const handleSwapConfirm = useCallback(async () => {
    if (!inputToken || !outputToken || !address || !routeOptimizer.bestRoute) {
      console.error('❌ Missing required swap parameters')
      return
    }

    const swapParams: SmartSwapParams = {
      inputToken,
      outputToken,
      inputAmount,
      outputAmountMin: (parseFloat(outputAmount) * (1 - slippage / 100)).toString(),
      recipient: address,
      deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
      slippage,
      routeType: routeOptimizer.bestRoute.route.type,
      feeTier: routeOptimizer.bestRoute.route.type === RouteType.V3 ? 3000 : undefined
    }

    try {
      console.log('🧠 Executing smart swap with params:', swapParams)
      await smartRouterCallback.executeSmartSwap(swapParams)
      setShowConfirm(false)
    } catch (error) {
      console.error('❌ Smart swap failed:', error)
    }
  }, [
    inputToken, outputToken, address, inputAmount, outputAmount, 
    slippage, deadline, routeOptimizer.bestRoute, smartRouterCallback
  ])

  // 🎨 渲染最优路径信息
  const renderRouteInfo = () => {
    if (routeOptimizer.isLoading) {
      return (
        <RouteOptimizing>
          <OptimizingSpinner />
          <span>Finding best route...</span>
        </RouteOptimizing>
      )
    }

    if (routeOptimizer.bestRoute) {
      const route = routeOptimizer.bestRoute.route
      const routerType = route.type === RouteType.V2 ? 'V2' : 'Smart Router'
      const pathText = route.path.length === 2 ? 'Direct swap' : `${route.path.length - 1} hop route`
      
      return (
        <RouteInfo>
          <InformationCircleIcon className="w-4 h-4 text-green-400" />
          <RouteText>
            Auto-selected: {routerType} • {pathText} • Lowest cost
          </RouteText>
          <button onClick={handleRefreshRoutes}>
            <ArrowPathIcon className="w-4 h-4 text-green-400" />
          </button>
        </RouteInfo>
      )
    }

    return null
  }

  const canSwap = inputToken && outputToken && inputAmount && outputAmount && !smartRouterCallback.isLoading

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
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
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
            value={outputAmount}
            readOnly
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
        {!isConnected 
          ? 'Connect Wallet'
          : !inputToken || !outputToken
          ? 'Select tokens'
          : !inputAmount
          ? 'Enter amount'
          : smartRouterCallback.isLoading
          ? 'Swapping...'
          : 'Swap'
        }
      </SwapSubmitButton>

      {/* 🎛️ Modals */}
      <TokenSelectModal
        isOpen={showInputModal}
        tokens={tokens}
        onSelectToken={(token) => {
          setInputToken(token)
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
          setOutputToken(token)
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
          inputAmount={inputAmount}
          outputAmount={outputAmount}
          priceImpact={routeOptimizer.bestRoute?.priceImpact || 0}
          fee={0.25}
          slippage={slippage}
          isLoading={smartRouterCallback.isLoading}
          estimatedGas={routeOptimizer.bestRoute?.gasEstimate}
        />
      )}
    </SwapContainer>
  )
}
