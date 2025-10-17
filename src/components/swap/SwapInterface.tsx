import { useState } from 'react'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import SwapForm from './SwapForm'

const SwapContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
`

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'};
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const PlaceholderCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  color: white;
`

type SwapTab = 'swap' | 'limit'

/**
 * 🥞 简化的PancakeSwap风格交易界面
 * 专注于核心swap功能
 */
export default function SwapInterface() {
  const [activeTab, setActiveTab] = useState<SwapTab>('swap')

  return (
    <SwapContainer>
      {/* 交易类型选项卡 - 严格按照PancakeSwap */}
      <TabContainer>
        <Tab 
          active={activeTab === 'swap'} 
          onClick={() => setActiveTab('swap')}
        >
          Swap
        </Tab>
        <Tab 
          active={activeTab === 'limit'} 
          onClick={() => setActiveTab('limit')}
        >
          Limit
        </Tab>
      </TabContainer>

      {/* 交易表单 - 严格按照PancakeSwap功能 */}
      {activeTab === 'swap' && <SwapForm />}
      
      {activeTab === 'limit' && (
        <PlaceholderCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>📊 Limit Orders</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
            Set limit orders to trade automatically when your target price is reached.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginTop: '16px' }}>
            🚧 Coming soon - PancakeSwap limit order functionality
          </p>
        </PlaceholderCard>
      )}
    </SwapContainer>
  )
}




