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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(34, 139, 34, 0.1);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  color: #32CD32;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(50, 205, 50, 0.3);
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const StatChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#32CD32' : '#FF6B6B'};
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const FullWidthStat = styled(StatItem)`
  grid-column: 1 / -1;
`;

const HighlightStat = styled(StatItem)`
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.1) 100%);
  border: 1px solid rgba(255, 107, 53, 0.3);

  ${StatValue} {
    color: #FF6B35;
    text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
  }
`;

function GlobalStats() {
  // Mock data - 在实际应用中这些数据会从智能合约获取
  const globalData = {
    totalValueLocked: '$12,450,000',
    totalVolume24h: '$2,890,000',
    totalUsers: 15847,
    activePools: 24,
    totalTrades: 89420,
    avgTradeSize: '$324.5',
    plantPrice: '$0.0245',
    marketCap: '$3,450,000'
  };

  const changes = {
    tvl: { value: '+12.5%', positive: true },
    volume: { value: '+8.3%', positive: true },
    users: { value: '+156', positive: true },
    pools: { value: '+3', positive: true },
    trades: { value: '+2.1%', positive: true },
    avgTrade: { value: '-5.2%', positive: false },
    price: { value: '+15.8%', positive: true },
    marketCap: { value: '+18.2%', positive: true }
  };

  return (
    <StatsCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <CardTitle>🌍 全局统计</CardTitle>
      
      <StatsGrid>
        <HighlightStat>
          <StatValue>{globalData.totalValueLocked}</StatValue>
          <StatLabel>总锁仓价值</StatLabel>
          <StatChange positive={changes.tvl.positive}>
            {changes.tvl.positive ? '📈' : '📉'} {changes.tvl.value}
          </StatChange>
        </HighlightStat>

        <HighlightStat>
          <StatValue>{globalData.totalVolume24h}</StatValue>
          <StatLabel>24h 交易量</StatLabel>
          <StatChange positive={changes.volume.positive}>
            {changes.volume.positive ? '📈' : '📉'} {changes.volume.value}
          </StatChange>
        </HighlightStat>

        <StatItem>
          <StatValue>{globalData.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>总用户数</StatLabel>
          <StatChange positive={changes.users.positive}>
            {changes.users.positive ? '📈' : '📉'} {changes.users.value}
          </StatChange>
        </StatItem>

        <StatItem>
          <StatValue>{globalData.activePools}</StatValue>
          <StatLabel>活跃流动池</StatLabel>
          <StatChange positive={changes.pools.positive}>
            {changes.pools.positive ? '📈' : '📉'} {changes.pools.value}
          </StatChange>
        </StatItem>

        <StatItem>
          <StatValue>{globalData.totalTrades.toLocaleString()}</StatValue>
          <StatLabel>总交易次数</StatLabel>
          <StatChange positive={changes.trades.positive}>
            {changes.trades.positive ? '📈' : '📉'} {changes.trades.value}
          </StatChange>
        </StatItem>

        <StatItem>
          <StatValue>{globalData.avgTradeSize}</StatValue>
          <StatLabel>平均交易额</StatLabel>
          <StatChange positive={changes.avgTrade.positive}>
            {changes.avgTrade.positive ? '📈' : '📉'} {changes.avgTrade.value}
          </StatChange>
        </StatItem>

        <FullWidthStat>
          <StatValue>{globalData.plantPrice}</StatValue>
          <StatLabel>PLANET 代币价格</StatLabel>
          <StatChange positive={changes.price.positive}>
            {changes.price.positive ? '📈' : '📉'} {changes.price.value}
          </StatChange>
        </FullWidthStat>

        <FullWidthStat>
          <StatValue>{globalData.marketCap}</StatValue>
          <StatLabel>市值</StatLabel>
          <StatChange positive={changes.marketCap.positive}>
            {changes.marketCap.positive ? '📈' : '📉'} {changes.marketCap.value}
          </StatChange>
        </FullWidthStat>
      </StatsGrid>
    </StatsCard>
  );
}

export default GlobalStats;
