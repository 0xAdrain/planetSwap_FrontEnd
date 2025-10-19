import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #32CD32;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Section = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.6) 0%, rgba(25, 55, 25, 0.5) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #32CD32;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SectionContent = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.8;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #32CD32;
    background: rgba(0, 0, 0, 0.4);
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #32CD32;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 16px;
`;

const SocialLink = styled.a`
  display: inline-block;
  background: rgba(34, 139, 34, 0.2);
  border: 1px solid rgba(34, 139, 34, 0.4);
  border-radius: 8px;
  padding: 10px 20px;
  color: #32CD32;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(34, 139, 34, 0.3);
    border-color: #32CD32;
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #32CD32;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TeamSection = styled.div`
  margin-top: 32px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const TeamMember = styled(motion.div)`
  text-align: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #32CD32;
    transform: translateY(-4px);
  }
`;

const TeamAvatar = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
`;

const TeamName = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  color: #32CD32;
  margin-bottom: 8px;
`;

const TeamRole = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
`;

export default function AboutInterface() {
  return (
    <Container>
      <Hero
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>About CometSwap</Title>
        <Subtitle>
          The Revolutionary Decentralized Exchange with Smart Pool Technology and Custom Tax Rules
        </Subtitle>
      </Hero>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <SectionTitle>Our Mission（我们的使命）</SectionTitle>
        <SectionContent>
          CometSwap 正在通过创新的智能池技术与可定制的税收机制相结合，避免通过 ERC 代币的高危代码定制带来的风险和项目方 Rug，构建去中心化金融的未来。
          我们赋能项目方发行具有内置可持续性功能并利好社区建设的代币池规则，同时为交易者提供透明、高效和安全的交易体验。
          
          <br/><br/>
          
          我们的目标是创建一个更加公平、透明的 DeFi 生态系统，让每个参与者都能从中受益。
          除了支持传统的安全、多轮牛熊验证的 AMM Pool 之外，还通过革命性的智能池技术和灵活的税收分配机制，CometSwap 为区块链项目提供了全新的启动和运营方式。
        </SectionContent>
      </Section>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionTitle>Key Features</SectionTitle>
        <FeatureGrid>
          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Smart Pool Swap</FeatureTitle>
            <FeatureDescription>
              Advanced liquidity aggregation and intelligent routing for optimal trade execution
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Token Launchpad</FeatureTitle>
            <FeatureDescription>
              Launch tokens with custom tax rules and automated distribution mechanisms
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Custom Tax Pools</FeatureTitle>
            <FeatureDescription>
              Create V2/V4 pools with configurable buy/sell taxes and distribution rules
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Liquidity Mining</FeatureTitle>
            <FeatureDescription>
              Earn rewards by providing liquidity to our innovative pool ecosystem
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Burn Mechanism</FeatureTitle>
            <FeatureDescription>
              Automated buyback and burn features to support token value appreciation
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureTitle>Analytics Dashboard</FeatureTitle>
            <FeatureDescription>
              Comprehensive statistics and real-time data for informed decision making
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <SectionTitle>Join Our Community</SectionTitle>
        <SectionContent style={{ marginBottom: '32px' }}>
          Be part of the DeFi revolution! Follow us on social media, join our community channels,
          and stay updated with the latest developments. Together, we're building the future of decentralized finance.
        </SectionContent>
        
        <FeatureGrid>
          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureIcon>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </FeatureIcon>
            <FeatureTitle>Telegram</FeatureTitle>
            <FeatureDescription>
              Join our Telegram community for real-time updates and discussions
            </FeatureDescription>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              Coming Soon
            </SocialLink>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.02 }}>
            <FeatureIcon>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </FeatureIcon>
            <FeatureTitle>Twitter</FeatureTitle>
            <FeatureDescription>
              Follow us on Twitter for the latest news and announcements
            </FeatureDescription>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              Coming Soon
            </SocialLink>
          </FeatureCard>
        </FeatureGrid>
      </Section>
    </Container>
  );
}

