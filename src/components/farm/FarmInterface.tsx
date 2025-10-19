import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { showDevAlert } from '../../utils/devAlert';
import FarmStats from './FarmStats';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(50, 205, 50, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#32CD32' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.active ? 'rgba(50, 205, 50, 0.4)' : 'rgba(34, 139, 34, 0.2)'};
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(50, 205, 50, 0.15);
    color: #32CD32;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
`;

const Toggle = styled.button<{ active: boolean }>`
  width: 48px;
  height: 24px;
  background: ${props => props.active ? '#32CD32' : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const PoolList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PoolCard = styled(motion.div)`
  background: rgba(15, 35, 15, 0.4);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(34, 139, 34, 0.4);
    background: rgba(15, 35, 15, 0.5);
  }
`;

const PoolHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
  }
`;

const PoolInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PoolType = styled.div<{ type: 'lp' | 'single' }>`
  background: ${props => props.type === 'lp' 
    ? 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)' 
    : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const PoolName = styled.div`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
`;

const StatusBadge = styled.div<{ status: 'live' | 'finished' }>`
  background: ${props => props.status === 'live' 
    ? 'rgba(34, 139, 34, 0.2)' 
    : 'rgba(255, 107, 53, 0.2)'};
  color: ${props => props.status === 'live' ? '#32CD32' : '#FF6B35'};
  border: 1px solid ${props => props.status === 'live' 
    ? 'rgba(34, 139, 34, 0.3)' 
    : 'rgba(255, 107, 53, 0.3)'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const StatValue = styled.span`
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
`;

const APRColumn = styled(StatColumn)`
  @media (max-width: 768px) {
    display: flex;
  }
`;

const APRValue = styled(StatValue)`
  color: #32CD32;
  font-size: 1.1rem;
`;

const ExpandButton = styled(motion.button)`
  background: transparent;
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  color: #32CD32;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 139, 34, 0.1);
    border-color: rgba(34, 139, 34, 0.5);
  }
`;

const ExpandedContent = styled(motion.div)`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(34, 139, 34, 0.2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailSection = styled.div``;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
`;

const DetailLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  color: #32CD32;
  font-size: 1rem;
  font-weight: 600;
`;

const ActionSection = styled.div``;

const StakeInput = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:focus-within {
    border-color: #32CD32;
  }
`;

const AmountInput = styled.input`
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  flex: 1;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const MaxButton = styled.button`
  background: rgba(34, 139, 34, 0.2);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 6px;
  padding: 4px 12px;
  color: #32CD32;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(34, 139, 34, 0.3);
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled(motion.button)`
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(34, 139, 34, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
`;

interface FarmPool {
  id: string;
  type: 'lp' | 'single';
  token0: string;
  token1?: string;
  status: 'live' | 'finished';
  apr: string;
  tvl: string;
  dailyRewards: string;
  userStaked: string;
  userRewards: string;
  totalStaked?: string;
}

export default function FarmInterface() {
  const [activeTab, setActiveTab] = useState<'live' | 'finished'>('live');
  const [stakedOnly, setStakedOnly] = useState(false);
  const [expandedPools, setExpandedPools] = useState<Set<string>>(new Set());
  const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: string }>({});

  const allPools: FarmPool[] = [
    {
      id: '1',
      type: 'lp',
      token0: 'OKB',
      token1: 'COMET',
      status: 'live',
      apr: '156.8%',
      tvl: '$125,400',
      dailyRewards: '450 COMET',
      userStaked: '$2,450',
      userRewards: '12.5 COMET',
      totalStaked: '125.4K LP'
    },
    {
      id: '2',
      type: 'lp',
      token0: 'USDT',
      token1: 'COMET',
      status: 'live',
      apr: '89.2%',
      tvl: '$89,200',
      dailyRewards: '280 COMET',
      userStaked: '$1,200',
      userRewards: '8.3 COMET',
      totalStaked: '89.2K LP'
    },
    {
      id: '3',
      type: 'single',
      token0: 'COMET',
      status: 'live',
      apr: '45.5%',
      tvl: '$234,600',
      dailyRewards: '350 COMET',
      userStaked: '$0',
      userRewards: '0 COMET',
      totalStaked: '234.6K COMET'
    },
    {
      id: '4',
      type: 'single',
      token0: 'SLEEPING',
      status: 'live',
      apr: '67.3%',
      tvl: '$189,400',
      dailyRewards: '420 COMET',
      userStaked: '$0',
      userRewards: '0 COMET',
      totalStaked: '189.4K SLEEPING'
    },
    {
      id: '5',
      type: 'lp',
      token0: 'ETH',
      token1: 'COMET',
      status: 'finished',
      apr: '0%',
      tvl: '$45,200',
      dailyRewards: '0 COMET',
      userStaked: '$850',
      userRewards: '5.2 COMET',
      totalStaked: '45.2K LP'
    }
  ];

  const filteredPools = allPools.filter(pool => {
    if (pool.status !== activeTab) return false;
    if (stakedOnly && parseFloat(pool.userStaked.replace(/[$,]/g, '')) === 0) return false;
    return true;
  });

  const toggleExpand = (poolId: string) => {
    setExpandedPools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poolId)) {
        newSet.delete(poolId);
      } else {
        newSet.add(poolId);
      }
      return newSet;
    });
  };

  const handleMaxClick = (poolId: string) => {
    setStakeAmounts(prev => ({ ...prev, [poolId]: '100.0' }));
  };

  return (
    <Container>
      <Header>
        <TabsContainer>
          <Tab
            active={activeTab === 'live'}
            onClick={() => setActiveTab('live')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Live
          </Tab>
          <Tab
            active={activeTab === 'finished'}
            onClick={() => setActiveTab('finished')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Finished
          </Tab>
        </TabsContainer>

        <Controls>
          <ToggleContainer>
            <ToggleLabel>Staked Only</ToggleLabel>
            <Toggle
              active={stakedOnly}
              onClick={() => setStakedOnly(!stakedOnly)}
            />
          </ToggleContainer>
        </Controls>
      </Header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
        <div>
          {filteredPools.length === 0 ? (
            <EmptyState>
              {stakedOnly 
                ? 'No staked pools found. Start staking to see your positions here.' 
                : `No ${activeTab} pools available.`}
            </EmptyState>
          ) : (
            <PoolList>
              {filteredPools.map((pool, index) => (
                <PoolCard
                  key={pool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PoolHeader>
                    <PoolInfo>
                      <PoolType type={pool.type}>
                        {pool.type === 'lp' ? 'LP' : 'STAKE'}
                      </PoolType>
                      <PoolName>
                        {pool.token1 ? `${pool.token0}/${pool.token1}` : pool.token0}
                      </PoolName>
                      {pool.status === 'finished' && <StatusBadge status="finished">Finished</StatusBadge>}
                    </PoolInfo>

                    <APRColumn>
                      <StatLabel>APR</StatLabel>
                      <APRValue>{pool.apr}</APRValue>
                    </APRColumn>

                    <StatColumn>
                      <StatLabel>TVL</StatLabel>
                      <StatValue>{pool.tvl}</StatValue>
                    </StatColumn>

                    <StatColumn>
                      <StatLabel>Daily Rewards</StatLabel>
                      <StatValue>{pool.dailyRewards}</StatValue>
                    </StatColumn>

                    <StatColumn>
                      <StatLabel>Your Stake</StatLabel>
                      <StatValue>{pool.userStaked}</StatValue>
                    </StatColumn>

                    <ExpandButton
                      onClick={() => toggleExpand(pool.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {expandedPools.has(pool.id) ? 'Hide' : 'Details'}
                    </ExpandButton>
                  </PoolHeader>

                  {expandedPools.has(pool.id) && (
                    <ExpandedContent
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DetailSection>
                        <DetailGrid>
                          <DetailItem>
                            <DetailLabel>Total Staked</DetailLabel>
                            <DetailValue>{pool.totalStaked}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Your Staked</DetailLabel>
                            <DetailValue>{pool.userStaked}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Daily Rewards</DetailLabel>
                            <DetailValue>{pool.dailyRewards}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Pending Rewards</DetailLabel>
                            <DetailValue>{pool.userRewards}</DetailValue>
                          </DetailItem>
                        </DetailGrid>
                      </DetailSection>

                      {pool.status === 'live' && (
                        <ActionSection>
                          <StakeInput>
                            <AmountInput
                              type="number"
                              placeholder="Enter amount"
                              value={stakeAmounts[pool.id] || ''}
                              onChange={(e) => setStakeAmounts(prev => ({ 
                                ...prev, 
                                [pool.id]: e.target.value 
                              }))}
                            />
                            <MaxButton onClick={() => handleMaxClick(pool.id)}>
                              MAX
                            </MaxButton>
                          </StakeInput>

                          <ActionButtons>
                            <ActionButton
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => showDevAlert('Stake')}
                              disabled={!stakeAmounts[pool.id] || parseFloat(stakeAmounts[pool.id]) <= 0}
                            >
                              Stake
                            </ActionButton>
                            <ActionButton
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => showDevAlert('Unstake')}
                            >
                              Unstake
                            </ActionButton>
                            <ActionButton
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => showDevAlert('Claim Rewards')}
                            >
                              Claim
                            </ActionButton>
                          </ActionButtons>
                        </ActionSection>
                      )}

                      {pool.status === 'finished' && (
                        <ActionSection>
                          <ActionButtons>
                            <ActionButton
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => showDevAlert('Unstake All')}
                              style={{ gridColumn: '1 / -1' }}
                            >
                              Unstake All & Claim Rewards
                            </ActionButton>
                          </ActionButtons>
                        </ActionSection>
                      )}
                    </ExpandedContent>
                  )}
                </PoolCard>
              ))}
            </PoolList>
          )}
        </div>

        <div>
          <FarmStats />
        </div>
      </div>
    </Container>
  );
}
