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

const TradingOverview = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const TradingStat = styled.div`
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

const StatValue = styled.div`
  color: #32CD32;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 6px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#32CD32' : '#FF6B6B'};
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
`;

const TopPairsSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PairsList = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
`;

const PairItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(34, 139, 34, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PairInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PairIcons = styled.span`
  font-size: 1.1rem;
`;

const PairName = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const PairVolume = styled.div`
  text-align: right;
`;

const VolumeValue = styled.div`
  color: #32CD32;
  font-weight: 600;
  font-size: 0.9rem;
`;

const VolumeChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#32CD32' : '#FF6B6B'};
  font-size: 0.75rem;
  font-weight: 600;
`;

const RecentTradesSection = styled.div``;

const TradesList = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(34, 139, 34, 0.5);
    border-radius: 2px;
  }
`;

const TradeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;

  &:last-child {
    border-bottom: none;
  }
`;

const TradeType = styled.span<{ isBuy: boolean }>`
  color: ${props => props.isBuy ? '#32CD32' : '#FF6B6B'};
  font-weight: 600;
  min-width: 30px;
`;

const TradeAmount = styled.span`
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
  text-align: center;
`;

const TradeTime = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
`;

interface TradingPair {
  name: string;
  icons: string;
  volume24h: string;
  change: { value: string; positive: boolean };
}

interface RecentTrade {
  type: 'buy' | 'sell';
  amount: string;
  time: string;
}

function TradingStats() {
  // Mock data - 在实际应用中这些数据会从智能合约获取
  const tradingData = {
    totalTrades24h: '2,847',
    uniqueTraders: '1,245',
    avgTradeSize: '$324.5',
    totalFees24h: '$7,240'
  };

  const changes = {
    trades: { value: '+12.3%', positive: true },
    traders: { value: '+8.7%', positive: true },
    avgSize: { value: '-3.2%', positive: false },
    fees: { value: '+15.6%', positive: true }
  };

  const topPairs: TradingPair[] = [
    {
      name: 'OKB/COMET',
      icons: '🪙🌱',
      volume24h: '$1,245,600',
      change: { value: '+18.5%', positive: true }
    },
    {
      name: 'USDT/COMET',
      icons: '💵🌱',
      volume24h: '$890,200',
      change: { value: '+12.3%', positive: true }
    },
    {
      name: 'ETH/COMET',
      icons: '⚡🌱',
      volume24h: '$567,800',
      change: { value: '-5.2%', positive: false }
    },
    {
      name: 'BTC/COMET',
      icons: '₿🌱',
      volume24h: '$234,500',
      change: { value: '+8.9%', positive: true }
    }
  ];

  const recentTrades: RecentTrade[] = [
    { type: 'buy', amount: '1,250 COMET', time: '2分钟前' },
    { type: 'sell', amount: '890 COMET', time: '3分钟前' },
    { type: 'buy', amount: '2,100 COMET', time: '5分钟前' },
    { type: 'sell', amount: '675 COMET', time: '7分钟前' },
    { type: 'buy', amount: '1,840 COMET', time: '9分钟前' },
    { type: 'buy', amount: '3,200 COMET', time: '12分钟前' },
    { type: 'sell', amount: '1,450 COMET', time: '15分钟前' }
  ];

  return (
    <StatsCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <CardTitle>📈 交易统计</CardTitle>

      <TradingOverview>
        <TradingStat>
          <StatValue>{tradingData.totalTrades24h}</StatValue>
          <StatLabel>24h 交易次数</StatLabel>
          <StatChange positive={changes.trades.positive}>
            {changes.trades.value}
          </StatChange>
        </TradingStat>

        <TradingStat>
          <StatValue>{tradingData.uniqueTraders}</StatValue>
          <StatLabel>活跃交易者</StatLabel>
          <StatChange positive={changes.traders.positive}>
            {changes.traders.value}
          </StatChange>
        </TradingStat>

        <TradingStat>
          <StatValue>{tradingData.avgTradeSize}</StatValue>
          <StatLabel>平均交易额</StatLabel>
          <StatChange positive={changes.avgSize.positive}>
            {changes.avgSize.value}
          </StatChange>
        </TradingStat>

        <TradingStat>
          <StatValue>{tradingData.totalFees24h}</StatValue>
          <StatLabel>24h 手续费</StatLabel>
          <StatChange positive={changes.fees.positive}>
            {changes.fees.value}
          </StatChange>
        </TradingStat>
      </TradingOverview>

      <TopPairsSection>
        <SectionTitle>
          🏆 热门Trading pair
        </SectionTitle>
        <PairsList>
          {topPairs.map((pair, index) => (
            <PairItem key={index}>
              <PairInfo>
                <PairIcons>{pair.icons}</PairIcons>
                <PairName>{pair.name}</PairName>
              </PairInfo>
              <PairVolume>
                <VolumeValue>{pair.volume24h}</VolumeValue>
                <VolumeChange positive={pair.change.positive}>
                  {pair.change.value}
                </VolumeChange>
              </PairVolume>
            </PairItem>
          ))}
        </PairsList>
      </TopPairsSection>

      <RecentTradesSection>
        <SectionTitle>
          ⚡ 实时交易
        </SectionTitle>
        <TradesList>
          {recentTrades.map((trade, index) => (
            <TradeItem key={index}>
              <TradeType isBuy={trade.type === 'buy'}>
                {trade.type === 'buy' ? '买入' : '卖出'}
              </TradeType>
              <TradeAmount>{trade.amount}</TradeAmount>
              <TradeTime>{trade.time}</TradeTime>
            </TradeItem>
          ))}
        </TradesList>
      </RecentTradesSection>
    </StatsCard>
  );
}

export default TradingStats;
