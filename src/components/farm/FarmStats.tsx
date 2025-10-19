import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { showDevAlert } from '../../utils/devAlert';

const StatsCard = styled.div`
  background: rgba(15, 35, 15, 0.6);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 24px;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #32CD32;
  margin: 0 0 20px 0;
  text-align: center;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(34, 139, 34, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  color: #32CD32;
  font-weight: 600;
  font-size: 0.95rem;
`;

const APYBadge = styled.div`
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
`;

export default function FarmStats() {
  // Mock data - 在实际应用中这些数据会从智能合约获取
  const farmStats = {
    totalPlantSupply: 1250000,
    yourPlantBalance: 5420,
    currentAPY: 156.8,
    dailyRewards: 28.5,
    totalValueLocked: 890000,
    nextRewardIn: '2h 15m'
  };

  return (
    <StatsCard>
      <CardTitle>🌱 COMET Farm 统计</CardTitle>
      
      <APYBadge>
        🔥 当前 APY: {farmStats.currentAPY}%
      </APYBadge>

      <StatRow>
        <StatLabel>COMET 总供应量</StatLabel>
        <StatValue>{farmStats.totalPlantSupply.toLocaleString()}</StatValue>
      </StatRow>

      <StatRow>
        <StatLabel>您的 COMET 余额</StatLabel>
        <StatValue>{farmStats.yourPlantBalance.toLocaleString()}</StatValue>
      </StatRow>

      <StatRow>
        <StatLabel>每日奖励</StatLabel>
        <StatValue>{farmStats.dailyRewards} COMET</StatValue>
      </StatRow>

      <StatRow>
        <StatLabel>总锁仓价值</StatLabel>
        <StatValue>${farmStats.totalValueLocked.toLocaleString()}</StatValue>
      </StatRow>

      <StatRow>
        <StatLabel>下次奖励</StatLabel>
        <StatValue>{farmStats.nextRewardIn}</StatValue>
      </StatRow>
    </StatsCard>
  );
}
