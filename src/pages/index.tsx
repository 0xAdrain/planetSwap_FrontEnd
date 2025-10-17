import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ConnectKitButton } from 'connectkit';

import Layout from '@/components/Layout';
import SwapInterface from '../components/swap/SwapInterface';
import LiquidityInterface from '../components/liquidity/LiquidityInterface';
import PoolsListPageWithCard from '../components/pools/PoolsListPageWithCard';
import FarmInterface from '@/components/farm/FarmInterface';
import StakeInterface from '@/components/stake/StakeInterface';
import StatsInterface from '@/components/stats/StatsInterface';
import LaunchTokenInterface from '@/components/launchpad/LaunchTokenInterface';
import LaunchedTokensInterface from '@/components/launchpad/LaunchedTokensInterface';
import AboutInterface from '@/components/about/AboutInterface';
import Navigation from '@/components/Navigation';
import NetworkDebug from '@/components/Debug/NetworkDebug';
import MintTokens from '@/components/tools/MintTokens';
import { useLanguage } from '@/contexts/LanguageContext';

const Container = styled.div`
  min-height: 100vh;
  background: #0a0f0a;
  position: relative;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid rgba(34, 139, 34, 0.2);
`;

const HeaderContent = styled.div`
  width: 100%;
  padding: 0 24px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 48px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #32CD32;
  margin: 0;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Version = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ChainSelector = styled.select`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 35, 15, 0.6);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  color: #32CD32;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #32CD32;
  }

  option {
    background: rgba(15, 35, 15, 0.9);
    color: #32CD32;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LanguageSelector = styled.select`
  background: rgba(15, 35, 15, 0.6);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #32CD32;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #32CD32;
  }

  option {
    background: rgba(15, 35, 15, 0.9);
    color: #32CD32;
  }
`;

type TabType = 'swap' | 'liquidity' | 'pools' | 'farm' | 'stake' | 'stats' | 'launch' | 'launched' | 'about' | 'faucet';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('swap');
  const [selectedChain, setSelectedChain] = useState<string>('xlayer');
  const { language, setLanguage } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case 'swap':
        return <SwapInterface />;
      case 'liquidity':
        return <LiquidityInterface />;
      case 'pools':
        return <PoolsListPageWithCard />;
      case 'farm':
        return <FarmInterface />;
      case 'stake':
        return <StakeInterface />;
      case 'stats':
        return <StatsInterface />;
      case 'launch':
        return <LaunchTokenInterface />;
      case 'launched':
        return <LaunchedTokensInterface />;
      case 'about':
        return <AboutInterface />;
      case 'faucet':
        return <MintTokens />;
      default:
        return <SwapInterface />;
    }
  };

  return (
      <Layout
        title="PlanetSwap - Revolutionary Decentralized Exchange"
        description="Experience advanced liquidity aggregation, intelligent routing, and sustainable yield farming on blockchain"
      >
      <Container>
        {/* 🐛 调试组件 - 仅在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && <NetworkDebug />}
        <HeaderWrapper>
          <HeaderContent>
            <Header>
              <LeftSection>
                <TitleWrapper>
                  <Title>PlanetSwap</Title>
                  <Version>v1.0.0</Version>
                </TitleWrapper>
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </LeftSection>
            <RightSection>
              <ChainSelector value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)}>
                <option value="xlayer">X Layer</option>
                <option value="eth">Ethereum</option>
                <option value="bsc">BSC</option>
              </ChainSelector>
              <LanguageSelector value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </LanguageSelector>
              <ConnectKitButton />
            </RightSection>
            </Header>
          </HeaderContent>
        </HeaderWrapper>
        
        <ContentWrapper>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </ContentWrapper>
      </Container>
    </Layout>
  );
}
