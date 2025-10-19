import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  input {
    width: 100%;
    background: rgba(15, 35, 15, 0.6);
    border: 1px solid rgba(34, 139, 34, 0.3);
    border-radius: 12px;
    padding: 12px 16px 12px 48px;
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
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? '#32CD32' : 'rgba(15, 35, 15, 0.6)'};
  border: 1px solid ${props => props.active ? '#32CD32' : 'rgba(34, 139, 34, 0.3)'};
  border-radius: 24px;
  padding: 8px 20px;
  color: ${props => props.active ? '#000' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? '#32CD32' : 'rgba(34, 139, 34, 0.3)'};
    color: ${props => props.active ? '#000' : '#fff'};
  }
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TokenCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #32CD32;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(34, 139, 34, 0.3);
  }
`;

const TokenHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const TokenLogo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  object-fit: cover;
`;

const TokenInfo = styled.div`
  flex: 1;
`;

const TokenName = styled.h3`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const TokenSymbol = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  height: 8px;
  margin: 12px 0;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: linear-gradient(90deg, #32CD32 0%, #228B22 100%);
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: 8px;
  transition: width 0.3s ease;
`;

const TokenStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const StatValue = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
`;

const TokenAddress = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
  font-family: monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StatusBadge = styled.div<{ status: 'live' | 'ended' | 'upcoming' }>`
  display: inline-block;
  background: ${props => {
    switch (props.status) {
      case 'live': return 'rgba(34, 139, 34, 0.2)';
      case 'ended': return 'rgba(239, 68, 68, 0.2)';
      case 'upcoming': return 'rgba(59, 130, 246, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'live': return 'rgba(34, 139, 34, 0.4)';
      case 'ended': return 'rgba(239, 68, 68, 0.4)';
      case 'upcoming': return 'rgba(59, 130, 246, 0.4)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'live': return '#32CD32';
      case 'ended': return '#ef4444';
      case 'upcoming': return '#60A5FA';
    }
  }};
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

interface Token {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  address: string;
  marketCap: string;
  price: string;
  liquidity: string;
  holders: string;
  progress: number;
  status: 'live' | 'ended' | 'upcoming';
}

const mockTokens: Token[] = [
  {
    id: '1',
    name: 'Green Earth',
    symbol: '$GE',
    logo: '/placeholder-token.png',
    address: '0xc5...D69c',
    marketCap: '5.87k',
    price: '0.1586',
    liquidity: '6.89%',
    holders: '0.1603',
    progress: 25,
    status: 'live'
  },
  {
    id: '2',
    name: 'Quantum Chain',
    symbol: '$QC',
    logo: '/placeholder-token.png',
    address: '0x64...09Ad',
    marketCap: '25.92k',
    price: '0.4259',
    liquidity: '6.67%',
    holders: '0.1666',
    progress: 39,
    status: 'live'
  },
  {
    id: '3',
    name: 'Meta Protocol',
    symbol: '$META',
    logo: '/placeholder-token.png',
    address: '0x68...a81d',
    marketCap: '6.04k',
    price: '0.1603',
    liquidity: '5.80%',
    holders: '0.1580',
    progress: 7,
    status: 'live'
  },
  {
    id: '4',
    name: 'Future Finance',
    symbol: '$FF',
    logo: '/placeholder-token.png',
    address: '0x47...C2A8',
    marketCap: '6.89%',
    price: '0.1685',
    liquidity: '6.73k',
    holders: '0.1674',
    progress: 52,
    status: 'live'
  },
  {
    id: '5',
    name: 'Digital Assets',
    symbol: '$DA',
    logo: '/placeholder-token.png',
    address: '0x6B...E79d',
    marketCap: '9.74k',
    price: '0.1970',
    liquidity: '6.67%',
    holders: '0.1666',
    progress: 58,
    status: 'live'
  },
  {
    id: '6',
    name: 'Smart Chain',
    symbol: '$SC',
    logo: '/placeholder-token.png',
    address: '0xAF...4c53',
    marketCap: '6.73k',
    price: '0.1674',
    liquidity: '5.80%',
    holders: '0.1580',
    progress: 21,
    status: 'ended'
  },
];

export default function LaunchedTokensInterface() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'mecreate', label: 'ME CREATE' },
    { id: 'following', label: 'Following' },
    { id: 'inPlanetSwap', label: 'In CometSwap List' },
  ];

  const filteredTokens = mockTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    // Add more filter logic here
    return matchesSearch;
  });

  return (
    <Container>
      <Header>
        <SearchBar>
          <SearchInput>
            <MagnifyingGlassIcon />
            <input
              type="text"
              placeholder="Enter name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>
        </SearchBar>
        
        <FilterTabs>
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterTabs>
      </Header>

      <TokenGrid>
        {filteredTokens.map((token, index) => (
          <TokenCard
            key={token.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <TokenHeader>
              <TokenLogo src={token.logo} alt={token.name} onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMyMjhCMjIiLz48L3N2Zz4=';
              }} />
              <TokenInfo>
                <TokenName>{token.name} <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{token.symbol}</span></TokenName>
                <StatusBadge status={token.status}>{token.status}</StatusBadge>
              </TokenInfo>
            </TokenHeader>

            <TokenAddress>Address: {token.address}</TokenAddress>

            <ProgressBar>
              <ProgressFill progress={token.progress} />
            </ProgressBar>

            <TokenStats>
              <StatItem>
                <StatLabel>Market Cap</StatLabel>
                <StatValue>{token.marketCap}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Price</StatLabel>
                <StatValue>{token.price}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Liquidity</StatLabel>
                <StatValue>{token.liquidity}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Holders</StatLabel>
                <StatValue>{token.holders}</StatValue>
              </StatItem>
            </TokenStats>
          </TokenCard>
        ))}
      </TokenGrid>
    </Container>
  );
}

