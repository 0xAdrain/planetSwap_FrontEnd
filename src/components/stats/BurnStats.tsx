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
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const BurnOverview = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const BurnStat = styled.div`
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 69, 0, 0.1) 100%);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.2);
  }
`;

const BurnValue = styled.div`
  color: #FF6B6B;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
`;

const BurnLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const BurnRate = styled.div`
  color: #F7931E;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
`;

const BurnHistory = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const HistoryTitle = styled.h4`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 107, 107, 0.05);
    border-radius: 8px;
    padding: 10px 8px;
    margin: 0 -8px;
  }
`;

const HistoryDate = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const HistoryAmount = styled.span`
  color: #FF6B6B;
  font-weight: 600;
  font-size: 0.9rem;
`;

const NextBurnTimer = styled.div`
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 69, 0, 0.1) 100%);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
`;

const TimerTitle = styled.div`
  color: #FF6B6B;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const TimerValue = styled.div`
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
`;

const BurnMechanism = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
`;

const MechanismTitle = styled.h4`
  color: #F7931E;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MechanismItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const MechanismIcon = styled.span`
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
`;

function BurnStats() {
  // Mock data - 在实际应用中这些数据会从智能合约获取
  const burnData = {
    totalBurned: '12,450,000',
    burnedValue: '$304,500',
    burnRate: '25,000',
    nextBurnIn: '1天 8小时 23分钟',
    weeklyBurn: '175,000',
    monthlyBurn: '750,000',
    recentBurns: [
      { date: '2024-01-20', amount: '28,500 SLEEPING', value: '$697.5' },
      { date: '2024-01-19', amount: '31,200 SLEEPING', value: '$764.4' },
      { date: '2024-01-18', amount: '26,800 SLEEPING', value: '$656.4' },
      { date: '2024-01-17', amount: '29,100 SLEEPING', value: '$712.95' },
      { date: '2024-01-16', amount: '33,400 SLEEPING', value: '$818.3' },
    ]
  };

  const burnMechanisms = [
    { icon: '🔄', text: 'Swap 交易费用的 50%' },
    { icon: '💧', text: '流动池税收的 50%' },
    { icon: '🌱', text: 'Farm 收益的 20%' },
    { icon: '⚡', text: '协议收入的 30%' }
  ];

  return (
    <StatsCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <CardTitle>
        🔥 SLEEPING 燃烧统计
      </CardTitle>

      <BurnOverview>
        <BurnStat>
          <BurnValue>{burnData.totalBurned}</BurnValue>
          <BurnLabel>总燃烧量</BurnLabel>
          <BurnRate>累计销毁</BurnRate>
        </BurnStat>

        <BurnStat>
          <BurnValue>{burnData.burnedValue}</BurnValue>
          <BurnLabel>燃烧价值</BurnLabel>
          <BurnRate>USD 估值</BurnRate>
        </BurnStat>

        <BurnStat>
          <BurnValue>{burnData.burnRate}</BurnValue>
          <BurnLabel>日燃烧率</BurnLabel>
          <BurnRate>每日销毁</BurnRate>
        </BurnStat>

        <BurnStat>
          <BurnValue>{burnData.weeklyBurn}</BurnValue>
          <BurnLabel>周燃烧量</BurnLabel>
          <BurnRate>7天统计</BurnRate>
        </BurnStat>
      </BurnOverview>

      <NextBurnTimer>
        <TimerTitle>
          ⏰ 下次燃烧倒计时
        </TimerTitle>
        <TimerValue>{burnData.nextBurnIn}</TimerValue>
      </NextBurnTimer>

      <BurnHistory>
        <HistoryTitle>
          📜 最近燃烧记录
        </HistoryTitle>
        {burnData.recentBurns.map((burn, index) => (
          <HistoryItem key={index}>
            <div>
              <HistoryDate>{burn.date}</HistoryDate>
              <div style={{ color: '#FF6B6B', fontSize: '0.9rem', fontWeight: '600' }}>
                {burn.amount}
              </div>
            </div>
            <HistoryAmount>{burn.value}</HistoryAmount>
          </HistoryItem>
        ))}
      </BurnHistory>

      <BurnMechanism>
        <MechanismTitle>
          ⚙️ 燃烧机制
        </MechanismTitle>
        {burnMechanisms.map((mechanism, index) => (
          <MechanismItem key={index}>
            <MechanismIcon>{mechanism.icon}</MechanismIcon>
            {mechanism.text}
          </MechanismItem>
        ))}
      </BurnMechanism>
    </StatsCard>
  );
}

export default BurnStats;
