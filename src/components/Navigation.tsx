import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const NavContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const NavWrapper = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const NavButton = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? '#32CD32' : 'transparent'};
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  color: ${props => props.active ? '#000' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? '#32CD32' : 'rgba(34, 139, 34, 0.3)'};
    color: ${props => props.active ? '#000' : '#fff'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled(motion.button)<{ active: boolean; isOpen: boolean }>`
  background: ${props => props.active ? '#32CD32' : 'transparent'};
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  color: ${props => props.active ? '#000' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.active ? '#32CD32' : 'rgba(34, 139, 34, 0.3)'};
    color: ${props => props.active ? '#000' : '#fff'};
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(15, 35, 15, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

const DropdownItem = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(50, 205, 50, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: ${props => props.active ? '#32CD32' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 139, 34, 0.3);
    color: #fff;
  }
`;

type TabType = 'swap' | 'liquidity' | 'pools' | 'farm' | 'stake' | 'stats' | 'launch' | 'launched' | 'about' | 'faucet';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const tradeDropdownRef = useRef<HTMLDivElement>(null);
  const earnDropdownRef = useRef<HTMLDivElement>(null);
  const launchpadDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tradeDropdownRef.current && !tradeDropdownRef.current.contains(event.target as Node)) {
        setIsTradeOpen(false);
      }
      if (earnDropdownRef.current && !earnDropdownRef.current.contains(event.target as Node)) {
        setIsEarnOpen(false);
      }
      if (launchpadDropdownRef.current && !launchpadDropdownRef.current.contains(event.target as Node)) {
        setIsLaunchpadOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tradeItems = [
    { id: 'swap' as TabType, label: 'Swap' },
    { id: 'liquidity' as TabType, label: 'Liquidity' },
    { id: 'pools' as TabType, label: 'Pools' },
  ];

  const earnItems = [
    { id: 'farm' as TabType, label: 'Farm' },
    { id: 'stake' as TabType, label: 'Stake' },
  ];

  const launchpadItems = [
    { id: 'launch' as TabType, label: 'Launch Token' },
    { id: 'launched' as TabType, label: 'Launched Tokens' },
  ];

  const isTradeActive = activeTab === 'swap' || activeTab === 'liquidity' || activeTab === 'pools';
  const isEarnActive = activeTab === 'farm' || activeTab === 'stake';
  const isLaunchpadActive = activeTab === 'launch' || activeTab === 'launched';

  const handleTradeItemClick = (tab: TabType) => {
    onTabChange(tab);
    setIsTradeOpen(false);
  };

  const handleEarnItemClick = (tab: TabType) => {
    onTabChange(tab);
    setIsEarnOpen(false);
  };

  const handleLaunchpadItemClick = (tab: TabType) => {
    onTabChange(tab);
    setIsLaunchpadOpen(false);
  };

  return (
    <NavContainer>
      <NavWrapper>
        <DropdownContainer ref={tradeDropdownRef}>
          <DropdownButton
            active={isTradeActive}
            isOpen={isTradeOpen}
            onClick={() => setIsTradeOpen(!isTradeOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Trade
            <ChevronDownIcon />
          </DropdownButton>
          
          <AnimatePresence>
            {isTradeOpen && (
              <DropdownMenu
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tradeItems.map((item) => (
                  <DropdownItem
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => handleTradeItemClick(item.id)}
                    whileHover={{ x: 4 }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </AnimatePresence>
        </DropdownContainer>

        <DropdownContainer ref={earnDropdownRef}>
          <DropdownButton
            active={isEarnActive}
            isOpen={isEarnOpen}
            onClick={() => setIsEarnOpen(!isEarnOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Earn
            <ChevronDownIcon />
          </DropdownButton>
          
          <AnimatePresence>
            {isEarnOpen && (
              <DropdownMenu
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {earnItems.map((item) => (
                  <DropdownItem
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => handleEarnItemClick(item.id)}
                    whileHover={{ x: 4 }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </AnimatePresence>
        </DropdownContainer>

        <DropdownContainer ref={launchpadDropdownRef}>
          <DropdownButton
            active={isLaunchpadActive}
            isOpen={isLaunchpadOpen}
            onClick={() => setIsLaunchpadOpen(!isLaunchpadOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Launchpad
            <ChevronDownIcon />
          </DropdownButton>
          
          <AnimatePresence>
            {isLaunchpadOpen && (
              <DropdownMenu
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {launchpadItems.map((item) => (
                  <DropdownItem
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => handleLaunchpadItemClick(item.id)}
                    whileHover={{ x: 4 }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </AnimatePresence>
        </DropdownContainer>

        <NavButton
          active={activeTab === 'faucet'}
          onClick={() => onTabChange('faucet')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🎁 Faucet
        </NavButton>

        <NavButton
          active={activeTab === 'stats'}
          onClick={() => onTabChange('stats')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Stats
        </NavButton>

        <NavButton
          active={activeTab === 'about'}
          onClick={() => onTabChange('about')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          About
        </NavButton>
      </NavWrapper>
    </NavContainer>
  );
}
