import { useState } from 'react'
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import SwapFormEnhanced from './SwapFormEnhanced'

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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
`

const SmartBadge = styled.span`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
 * 🧠 PancakeSwap风格智能交易界面
 * 自动智能路由，用户无需手动选择
 */
export default function SwapInterface() {
  const [activeTab, setActiveTab] = useState<SwapTab>('swap')

  return (
    <SwapContainer>
      {/* 交易类型选项卡 - 简化版 */}
      <TabContainer>
        <Tab 
          active={activeTab === 'swap'} 
          onClick={() => setActiveTab('swap')}
        >
          Swap
          <SmartBadge>Smart</SmartBadge>
        </Tab>
        <Tab 
          active={activeTab === 'limit'} 
          onClick={() => setActiveTab('limit')}
        >
          Limit
        </Tab>
      </TabContainer>

      {/* 智能交易表单 - 自动选择最优路径 */}
      {activeTab === 'swap' && <SwapFormEnhanced />}
      
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
            🚧 Coming soon - Advanced limit order functionality with Smart Router integration
          </p>
        </PlaceholderCard>
      )}
    </SwapContainer>
  )
}




