import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { showDevAlert } from '../../utils/devAlert';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #32CD32;
  margin-bottom: 16px;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.6) 0%, rgba(25, 55, 25, 0.5) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #32CD32;
    transform: translateY(-4px);
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  color: #32CD32;
  font-size: 1.8rem;
  font-weight: 600;
`;

const StakeCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.6) 0%, rgba(25, 55, 25, 0.5) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #32CD32;
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #32CD32;
    box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(34, 139, 34, 0.3);
  border: 1px solid #32CD32;
  border-radius: 6px;
  padding: 6px 12px;
  color: #32CD32;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 139, 34, 0.5);
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
`;

const InfoValue = styled.span`
  color: #32CD32;
  font-size: 1rem;
  font-weight: 600;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(50, 205, 50, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RewardsSection = styled.div`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.6) 0%, rgba(25, 55, 25, 0.5) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 32px;
`;

const RewardsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TotalRewards = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TotalLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
`;

const TotalValue = styled.span`
  color: #32CD32;
  font-size: 1.3rem;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const CollectButton = styled(motion.button)`
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(50, 205, 50, 0.4);
  }
`;

const CollectAllButton = styled(motion.button)`
  background: rgba(34, 139, 34, 0.2);
  border: 1px solid #32CD32;
  border-radius: 8px;
  padding: 10px 20px;
  color: #32CD32;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(34, 139, 34, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(50, 205, 50, 0.3);
  }
`;

const RewardsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(34, 139, 34, 0.5);
    border-radius: 10px;
    
    &:hover {
      background: rgba(34, 139, 34, 0.7);
    }
  }
`;

const RewardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(34, 139, 34, 0.5);
    background: rgba(0, 0, 0, 0.4);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
`;

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TokenSymbol = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
`;

const TokenSource = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
`;

const RewardAmount = styled.div`
  text-align: right;
`;

const AmountValue = styled.div`
  color: #32CD32;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AmountUSD = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
`;

// Mock 奖励代币数据
const REWARD_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', amount: '0.125', usdValue: '$245.50', source: 'Platform Fees (All Pools)', icon: 'ET' },
  { symbol: 'OKB', name: 'OKB Token', amount: '156.8', usdValue: '$7,840', source: 'OKB Pool Rewards', icon: 'OK' },
  { symbol: 'SLEEP', name: 'Sleep Token', amount: '2,450', usdValue: '$1,225', source: 'SLEEP Pool Rewards', icon: 'SL' },
  { symbol: 'BTC', name: 'Bitcoin', amount: '0.012', usdValue: '$518.40', source: 'BTC Pool Rewards', icon: 'BT' },
  { symbol: 'USDT', name: 'Tether USD', amount: '1,250', usdValue: '$1,250', source: 'USDT Pool Rewards', icon: 'UT' },
  { symbol: 'DAI', name: 'Dai Stablecoin', amount: '890', usdValue: '$890', source: 'DAI Pool Rewards', icon: 'DA' },
  { symbol: 'LINK', name: 'Chainlink', amount: '45.6', usdValue: '$638.40', source: 'LINK Pool Rewards', icon: 'LK' },
  { symbol: 'UNI', name: 'Uniswap', amount: '120', usdValue: '$660', source: 'UNI Pool Rewards', icon: 'UN' },
  { symbol: 'AAVE', name: 'Aave', amount: '8.5', usdValue: '$680', source: 'AAVE Pool Rewards', icon: 'AV' },
  { symbol: 'MATIC', name: 'Polygon', amount: '3,200', usdValue: '$2,560', source: 'MATIC Pool Rewards', icon: 'MT' },
];

export default function StakeInterface() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // 计算总奖励价值（USD）
  const totalRewardsUSD = REWARD_TOKENS.reduce((sum, token) => {
    return sum + parseFloat(token.usdValue.replace(/[$,]/g, ''));
  }, 0);

  const handleStake = () => {
    showDevAlert('Stake');
  };

  const handleUnstake = () => {
    showDevAlert('Unstake');
  };

  const handleCollectAsOKB = () => {
    showDevAlert('Collect as OKB');
  };

  const handleCollectAll = () => {
    showDevAlert('Collect All Rewards');
  };

  return (
    <Container>
      <Header>
        <Title>Stake PLANET</Title>
        <Description>
          Stake platform tokens and share 50% of platform revenue
        </Description>
      </Header>

      <StatsGrid>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatLabel>Total Staked</StatLabel>
          <StatValue>1,250,000 PLANET</StatValue>
        </StatCard>

        <StatCard whileHover={{ scale: 1.02 }}>
          <StatLabel>Your Staked</StatLabel>
          <StatValue>0 PLANET</StatValue>
        </StatCard>

        <StatCard whileHover={{ scale: 1.02 }}>
          <StatLabel>APY</StatLabel>
          <StatValue>45.8%</StatValue>
        </StatCard>

        <StatCard whileHover={{ scale: 1.02 }}>
          <StatLabel>Your Rewards</StatLabel>
          <StatValue>0 PLANET</StatValue>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <StakeCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardTitle>Stake</CardTitle>
          
          <InputGroup>
            <Label>Amount to Stake</Label>
            <InputWrapper>
              <Input
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <MaxButton onClick={() => setStakeAmount('1000')}>MAX</MaxButton>
            </InputWrapper>
          </InputGroup>

          <InfoBox>
            <InfoRow>
              <InfoLabel>Balance:</InfoLabel>
              <InfoValue>1,000 PLANET</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>You will receive:</InfoLabel>
              <InfoValue>{stakeAmount || '0'} stPLANET</InfoValue>
            </InfoRow>
          </InfoBox>

          <ActionButton
            onClick={handleStake}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            Stake PLANET
          </ActionButton>
        </StakeCard>

        <StakeCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardTitle>Unstake</CardTitle>
          
          <InputGroup>
            <Label>Amount to Unstake</Label>
            <InputWrapper>
              <Input
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <MaxButton onClick={() => setUnstakeAmount('0')}>MAX</MaxButton>
            </InputWrapper>
          </InputGroup>

          <InfoBox>
            <InfoRow>
              <InfoLabel>Staked Balance:</InfoLabel>
              <InfoValue>0 stPLANET</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>You will receive:</InfoLabel>
              <InfoValue>{unstakeAmount || '0'} PLANET</InfoValue>
            </InfoRow>
          </InfoBox>

          <ActionButton
            onClick={handleUnstake}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0}
          >
            Unstake PLANET
          </ActionButton>
        </StakeCard>
      </div>

      <RewardsSection>
        <RewardsHeader>
          <div>
            <CardTitle style={{ marginBottom: '8px' }}>Your Rewards</CardTitle>
            <TotalRewards>
              <TotalLabel>Total Value:</TotalLabel>
              <TotalValue>${totalRewardsUSD.toLocaleString()}</TotalValue>
            </TotalRewards>
          </div>
          <ButtonGroup>
            <CollectAllButton
              onClick={handleCollectAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Collect All Rewards
            </CollectAllButton>
            <CollectButton
              onClick={handleCollectAsOKB}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Collect as OKB
            </CollectButton>
          </ButtonGroup>
        </RewardsHeader>
        
        <RewardsList>
          {REWARD_TOKENS.map((token, index) => (
            <RewardItem key={index}>
              <TokenInfo>
                <TokenIcon>{token.icon}</TokenIcon>
                <TokenDetails>
                  <TokenSymbol>{token.symbol}</TokenSymbol>
                  <TokenSource>{token.source}</TokenSource>
                </TokenDetails>
              </TokenInfo>
              <RewardAmount>
                <AmountValue>{token.amount} {token.symbol}</AmountValue>
                <AmountUSD>{token.usdValue}</AmountUSD>
              </RewardAmount>
            </RewardItem>
          ))}
        </RewardsList>
      </RewardsSection>
    </Container>
  );
}

