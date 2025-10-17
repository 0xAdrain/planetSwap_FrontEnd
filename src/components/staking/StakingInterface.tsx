import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ComingSoonCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(34, 139, 34, 0.2);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 20px rgba(34, 139, 34, 0.5));
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: left;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
`;

const FeatureTitle = styled.h3`
  color: #32CD32;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

export default function StakingInterface() {
  const features = [
    {
      icon: '⭐',
      title: 'PLANET 质押',
      description: '质押 PLANET 代币获得稳定收益和协议治理权'
    },
    {
      icon: '🗳️',
      title: '治理投票',
      description: '参与 StarPump 协议重要决策投票，影响协议发展方向'
    },
    {
      icon: '🔒',
      title: '灵活锁定',
      description: '选择不同锁定期限，获得相应的收益倍数加成'
    },
    {
      icon: '💎',
      title: '奖励分配',
      description: '获得协议收入分成和额外的 PLANET 代币奖励'
    }
  ];

  return (
    <Container>
      <ComingSoonCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Icon>⭐</Icon>
        <Title>PLANET 质押</Title>
        <Subtitle>
          PLANET 代币质押系统即将上线！
          质押 PLANET 代币获得额外收益，参与 StarPump 协议治理。
        </Subtitle>

        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </ComingSoonCard>
    </Container>
  );
}
