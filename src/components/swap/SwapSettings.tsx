import { useState } from 'react'
import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const SettingsOverlay = styled(motion.div)`
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

const SettingsModal = styled(motion.div)`
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(20px);
`

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const SettingsTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
`

const SettingSection = styled.div`
  margin-bottom: 24px;
`

const SettingLabel = styled.label`
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
`

const SettingDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.4;
`

const SlippageButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`

const SlippageButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.active ? '#22c55e' : 'white'};
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: ${props => props.active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`

const CustomSlippageInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 12px 16px;
  width: 100%;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgba(34, 197, 94, 0.4);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const DeadlineInput = styled(CustomSlippageInput)`
  text-align: right;
`

const InputSuffix = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin-left: 8px;
`

const DeadlineContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ToggleSwitch = styled.button<{ enabled: boolean }>`
  width: 52px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${props => props.enabled ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${props => props.enabled ? '27px' : '3px'};
    transition: all 0.2s ease;
  }
`

const WarningText = styled.div`
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.2);
  border-radius: 12px;
  color: #f56565;
  padding: 12px;
  font-size: 14px;
  margin-top: 12px;
`

const SaveButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    transform: translateY(-1px);
  }
`

interface SwapSettingsProps {
  isOpen: boolean
  onClose: () => void
  slippage: number
  onSlippageChange: (slippage: number) => void
  deadline: number
  onDeadlineChange: (deadline: number) => void
  expertMode: boolean
  onExpertModeChange: (enabled: boolean) => void
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0]

export default function SwapSettings({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
  expertMode,
  onExpertModeChange
}: SwapSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState('')

  const handleSlippagePreset = (preset: number) => {
    onSlippageChange(preset)
    setCustomSlippage('')
  }

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  const isHighSlippage = slippage > 5
  const isVeryHighSlippage = slippage > 15

  return (
    <AnimatePresence>
      {isOpen && (
        <SettingsOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <SettingsModal
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsHeader>
              <SettingsTitle>Transaction Settings</SettingsTitle>
              <CloseButton onClick={onClose}>
                <XMarkIcon className="w-6 h-6" />
              </CloseButton>
            </SettingsHeader>

            {/* 滑点容忍度设置 */}
            <SettingSection>
              <SettingLabel>Slippage Tolerance</SettingLabel>
              <SettingDescription>
                Your transaction will revert if the price changes unfavorably by more than this percentage.
              </SettingDescription>
              
              <SlippageButtons>
                {SLIPPAGE_PRESETS.map(preset => (
                  <SlippageButton
                    key={preset}
                    active={slippage === preset && !customSlippage}
                    onClick={() => handleSlippagePreset(preset)}
                  >
                    {preset}%
                  </SlippageButton>
                ))}
              </SlippageButtons>

              <CustomSlippageInput
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => handleCustomSlippage(e.target.value)}
                min="0"
                max="50"
                step="0.1"
              />

              {isHighSlippage && (
                <WarningText>
                  {isVeryHighSlippage 
                    ? '⚠️ Your transaction may be frontrun and result in an unfavorable trade.'
                    : '⚠️ High slippage tolerance may result in an unfavorable trade.'
                  }
                </WarningText>
              )}
            </SettingSection>

            {/* 交易截止时间 */}
            <SettingSection>
              <SettingLabel>Transaction Deadline</SettingLabel>
              <SettingDescription>
                Your transaction will revert if it is pending for more than this period of time.
              </SettingDescription>
              
              <DeadlineContainer>
                <DeadlineInput
                  type="number"
                  value={deadline}
                  onChange={(e) => onDeadlineChange(parseInt(e.target.value) || 20)}
                  min="1"
                  max="4320"
                />
                <InputSuffix>minutes</InputSuffix>
              </DeadlineContainer>
            </SettingSection>

            {/* 专家模式 */}
            <SettingSection>
              <ToggleContainer>
                <div>
                  <SettingLabel style={{ marginBottom: '4px' }}>Expert Mode</SettingLabel>
                  <SettingDescription style={{ marginBottom: 0 }}>
                    Allow high price impact trades and skip the confirm screen. Use at your own risk.
                  </SettingDescription>
                </div>
                <ToggleSwitch
                  enabled={expertMode}
                  onClick={() => onExpertModeChange(!expertMode)}
                />
              </ToggleContainer>
            </SettingSection>

            {/* 保存按钮 */}
            <SaveButton onClick={onClose}>
              ✅ Save Settings
            </SaveButton>
          </SettingsModal>
        </SettingsOverlay>
      )}
    </AnimatePresence>
  )
}




