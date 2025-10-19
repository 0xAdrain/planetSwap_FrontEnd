import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StatsCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(34, 139, 34, 0.2);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  text-align: center;
`;

const RevenueSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RevenueGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const RevenueStat = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(34, 139, 34, 0.1);
    transform: translateY(-1px);
  }
`;

const RevenueValue = styled.div`
  color: #32CD32;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 6px;
`;

const RevenueLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DistributionChart = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h5`
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-align: center;
`;

const DistributionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const DistributionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const DistributionBar = styled.div<{ percentage: number; color: string }>`
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: ${props => props.color};
    border-radius: 3px;
    transition: width 0.8s ease;
  }
`;

const DistributionPercent = styled.span`
  color: #32CD32;
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 40px;
  text-align: right;
`;

const TreasurySection = styled.div`
  background: linear-gradient(135deg, rgba(50, 205, 50, 0.1) 0%, rgba(34, 139, 34, 0.05) 100%);
  border: 1px solid rgba(50, 205, 50, 0.2);
  border-radius: 12px;
  padding: 16px;
`;

const TreasuryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TreasuryStat = styled.div`
  text-align: center;
`;

const TreasuryValue = styled.div`
  color: #32CD32;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const TreasuryLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

function ProtocolStats() {
  // Mock data - 在实际应用中这些数据会从智能合约获取
  const protocolData = {
    totalRevenue: '$145,600',
    dailyRevenue: '$12,400',
    weeklyRevenue: '$89,200',
    monthlyRevenue: '$356,800',
    treasuryBalance: '$2,450,000',
    plantReserve: '5,600,000',
    developmentFund: '$890,000',
    communityRewards: '$1,200,000'
  };

  const revenueDistribution = [
    { label: '🔥 SLEEPING 燃烧', percentage: 50, color: '#FF6B35' },
    { label: '💧 流动性奖励', percentage: 30, color: '#32CD32' },
    { label: '🏛️ 协议金库', percentage: 15, color: '#228B22' },
    { label: '👥 社区奖励', percentage: 5, color: '#00FF00' }
  ];

  return (
    <StatsCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <CardTitle>🏛️ 协议统计</CardTitle>

      <RevenueSection>
        <SectionTitle>
          💰 协议收入
        </SectionTitle>
        <RevenueGrid>
          <RevenueStat>
            <RevenueValue>{protocolData.totalRevenue}</RevenueValue>
            <RevenueLabel>总收入</RevenueLabel>
          </RevenueStat>
          <RevenueStat>
            <RevenueValue>{protocolData.dailyRevenue}</RevenueValue>
            <RevenueLabel>日收入</RevenueLabel>
          </RevenueStat>
          <RevenueStat>
            <RevenueValue>{protocolData.weeklyRevenue}</RevenueValue>
            <RevenueLabel>周收入</RevenueLabel>
          </RevenueStat>
          <RevenueStat>
            <RevenueValue>{protocolData.monthlyRevenue}</RevenueValue>
            <RevenueLabel>月收入</RevenueLabel>
          </RevenueStat>
        </RevenueGrid>
      </RevenueSection>

      <DistributionChart>
        <ChartTitle>📊 收入分配</ChartTitle>
        {revenueDistribution.map((item, index) => (
          <DistributionItem key={index}>
            <DistributionLabel>
              {item.label}
            </DistributionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DistributionBar percentage={item.percentage} color={item.color} />
              <DistributionPercent>{item.percentage}%</DistributionPercent>
            </div>
          </DistributionItem>
        ))}
      </DistributionChart>

      <TreasurySection>
        <SectionTitle>
          🏦 协议金库
        </SectionTitle>
        <TreasuryGrid>
          <TreasuryStat>
            <TreasuryValue>{protocolData.treasuryBalance}</TreasuryValue>
            <TreasuryLabel>金库余额</TreasuryLabel>
          </TreasuryStat>
          <TreasuryStat>
            <TreasuryValue>{protocolData.plantReserve.toLocaleString()}</TreasuryValue>
            <TreasuryLabel>COMET 储备</TreasuryLabel>
          </TreasuryStat>
          <TreasuryStat>
            <TreasuryValue>{protocolData.developmentFund}</TreasuryValue>
            <TreasuryLabel>开发基金</TreasuryLabel>
          </TreasuryStat>
          <TreasuryStat>
            <TreasuryValue>{protocolData.communityRewards}</TreasuryValue>
            <TreasuryLabel>社区奖励</TreasuryLabel>
          </TreasuryStat>
        </TreasuryGrid>
      </TreasurySection>
    </StatsCard>
  );
}

export default ProtocolStats;
