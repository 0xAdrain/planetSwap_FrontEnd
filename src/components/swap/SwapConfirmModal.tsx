import { useState } from 'react'
import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Token } from '../../hooks/contracts/useTokens'

const ConfirmOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const ConfirmModal = styled(motion.div)`
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(20px);
  
  /* 🎊 庆祝和失败动画 */
  @keyframes celebration {
    0% { transform: scale(1); }
    100% { transform: scale(1.05); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
    50% { text-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`

const ConfirmHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const ConfirmTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`

const SwapPreview = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
`

const TokenAmount = styled.div`
  text-align: right;
`

const TokenAmountMain = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 600;
`

const TokenAmountUSD = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`

const TokenSymbol = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
`

const SwapArrow = styled.div`
  display: flex;
  justify-content: center;
  margin: -8px 0;
  position: relative;
  z-index: 1;
`

const ArrowIcon = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const DetailsSection = styled.div`
  margin-bottom: 20px;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const DetailLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const DetailValue = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 500;
`

const PriceImpact = styled.span<{ high?: boolean }>`
  color: ${props => props.high ? '#f56565' : '#22c55e'};
  font-weight: 600;
`

const RouteContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`

const WarningBox = styled.div`
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

const WarningText = styled.div`
  color: #f56565;
  font-size: 14px;
  line-height: 1.4;
`

const ConfirmButton = styled(motion.button)`
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
  margin-bottom: 12px;

  &:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const CancelButton = styled.button`
  width: 100%;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 600;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }
`

interface SwapConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  inputToken: Token
  outputToken: Token
  inputAmount: string
  outputAmount: string
  priceImpact: number
  slippage: number
  minReceived: string
  isLoading?: boolean
  currentStep?: 'idle' | 'approving' | 'swapping'
  isApprovalSuccess?: boolean
  isSwapSuccess?: boolean
  swapError?: any
  approvalError?: any
}

export default function SwapConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  inputToken,
  outputToken,
  inputAmount,
  outputAmount,
  priceImpact,
  slippage,
  minReceived,
  isLoading = false,
  currentStep = 'idle',
  isApprovalSuccess = false,
  isSwapSuccess = false,
  swapError = null,
  approvalError = null
}: SwapConfirmModalProps) {
  const [showRoute, setShowRoute] = useState(false)
  
  const isHighPriceImpact = priceImpact > 3
  const isVeryHighPriceImpact = priceImpact > 15

  // 🚨 移除假数据 - USD价值应从真实价格oracle获取
  // TODO: 实现真实USD价值计算

  // 🚀 现代化状态管理 - 比PancakeSwap更直观更有趣
  const getTransactionStatus = () => {
    // 🎊 交易成功：喝彩庆祝 (只有在交易过程中才显示)
    if (isSwapSuccess && (currentStep === 'swapping' || currentStep === 'idle')) {
      return {
        title: '🎊🎉 SWAP SUCCESS! 🎉🎊',
        subtitle: '✨ Congratulations! Your swap has been completed! ✨',
        color: '#22c55e',
        celebration: true,
        autoClose: true
      }
    }
    
    // ❌ 交易失败：友好提示
    if (swapError || approvalError) {
      const error = swapError || approvalError
      const isUserRejected = error?.message?.includes('User rejected') || error?.message?.includes('User denied')
      
      if (isUserRejected) {
        return {
          title: '🤚 Transaction Cancelled',
          subtitle: 'You cancelled the transaction',
          color: '#f59e0b',
          failure: true,
          autoClose: true
        }
      } else {
        return {
          title: '❌ Transaction Failed',
          subtitle: 'Something went wrong. Please try again.',
          color: '#ef4444',
          failure: true,
          autoClose: true
        }
      }
    }
    
    if (currentStep === 'swapping') {
      return {
        title: '⏳ Swapping...',
        subtitle: 'Please wait for confirmation',
        color: '#3b82f6'
      }
    }
    if (isApprovalSuccess) {
      return {
        title: '✅ Approval Confirmed',
        subtitle: 'Proceeding to swap...',
        color: '#22c55e'
      }
    }
    if (currentStep === 'approving') {
      return {
        title: '🔐 Approving...',
        subtitle: 'Please confirm in your wallet',
        color: '#f59e0b'
      }
    }
    return {
      title: 'Confirm Swap',
      subtitle: 'Review your transaction',
      color: '#ffffff'
    }
  }

  const status = getTransactionStatus()

  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ConfirmModal
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ConfirmHeader>
              <div>
                <ConfirmTitle 
                  style={{ 
                    color: status.color,
                    animation: status.celebration ? 'celebration 1s ease-in-out infinite alternate' : 
                               status.failure ? 'shake 0.5s ease-in-out' : 'none'
                  }}
                >
                  {status.title}
                </ConfirmTitle>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '14px', 
                  marginTop: '4px',
                  animation: status.celebration ? 'glow 2s ease-in-out infinite' : 'none'
                }}>
                  {status.subtitle}
                </div>
              </div>
              {/* 只在非自动关闭状态显示关闭按钮 */}
              {!status.autoClose && (
                <CloseButton onClick={onClose}>
                  <XMarkIcon className="w-6 h-6" />
                </CloseButton>
              )}
            </ConfirmHeader>

            {/* 交换预览 */}
            <SwapPreview>
              {/* 输入代币 */}
              <TokenRow>
                <TokenInfo>
                  <TokenIcon>{inputToken.symbol.slice(0, 2)}</TokenIcon>
                  <TokenSymbol>{inputToken.symbol}</TokenSymbol>
                </TokenInfo>
                <TokenAmount>
                  <TokenAmountMain>-{inputAmount}</TokenAmountMain>
                  {/* TODO: 添加真实USD价值显示 */}
                </TokenAmount>
              </TokenRow>

              <SwapArrow>
                <ArrowIcon>
                  <ArrowPathIcon className="w-4 h-4" />
                </ArrowIcon>
              </SwapArrow>

              {/* 输出代币 */}
              <TokenRow>
                <TokenInfo>
                  <TokenIcon>{outputToken.symbol.slice(0, 2)}</TokenIcon>
                  <TokenSymbol>{outputToken.symbol}</TokenSymbol>
                </TokenInfo>
                <TokenAmount>
                  <TokenAmountMain>+{outputAmount}</TokenAmountMain>
                  {/* TODO: 添加真实USD价值显示 */}
                </TokenAmount>
              </TokenRow>
            </SwapPreview>

            {/* 高价格影响警告 */}
            {isVeryHighPriceImpact && (
              <WarningBox>
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5" />
                <WarningText>
                  <strong>Price Impact Too High</strong><br />
                  This swap has a price impact of {priceImpact.toFixed(2)}%. 
                  You may lose a significant amount of your funds.
                </WarningText>
              </WarningBox>
            )}

            {/* 交易详情 */}
            <DetailsSection>
              <DetailRow>
                <DetailLabel>Price</DetailLabel>
                <DetailValue>
                  1 {inputToken.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6)} {outputToken.symbol}
                </DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Price Impact</DetailLabel>
                <PriceImpact high={isHighPriceImpact}>
                  {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}
                </PriceImpact>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Minimum received</DetailLabel>
                <DetailValue>{minReceived} {outputToken.symbol}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Slippage Tolerance</DetailLabel>
                <DetailValue>{slippage}%</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>
                  Route
                  <button
                    onClick={() => setShowRoute(!showRoute)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'inherit', 
                      cursor: 'pointer',
                      marginLeft: '4px'
                    }}
                  >
                    {showRoute ? '▼' : '▶'}
                  </button>
                </DetailLabel>
                {showRoute ? (
                  <RouteContainer>
                    {inputToken.symbol} → {outputToken.symbol}
                  </RouteContainer>
                ) : (
                  <DetailValue>Best route</DetailValue>
                )}
              </DetailRow>
            </DetailsSection>

            {/* 动态按钮逻辑 */}
            {status.autoClose ? (
              /* 成功/失败时显示自动关闭提示 */
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: status.color,
                fontSize: '16px',
                fontWeight: '600',
                animation: status.celebration ? 'bounce 1s ease-in-out infinite' : 'none'
              }}>
                {status.celebration 
                  ? '🎊 Auto-closing in 2 seconds... 🎊' 
                  : '⚠️ Auto-closing in 2 seconds...'
                }
              </div>
            ) : (
              /* 正常状态显示确认和取消按钮 */
              <>
                <ConfirmButton
                  onClick={onConfirm}
                  disabled={isLoading || currentStep !== 'idle'}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isLoading || currentStep !== 'idle'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : undefined
                  }}
                >
                  {currentStep === 'swapping' 
                    ? '⏳ Swapping...'
                    : currentStep === 'approving'
                    ? '🔐 Approving...'
                    : isLoading 
                    ? 'Processing...' 
                    : 'Confirm Swap'
                  }
                </ConfirmButton>

                <CancelButton onClick={onClose}>
                  Cancel
                </CancelButton>
              </>
            )}
          </ConfirmModal>
        </ConfirmOverlay>
      )}
    </AnimatePresence>
  )
}




