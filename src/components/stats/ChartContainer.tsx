import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const ChartWrapper = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  color: #32CD32;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const TimeFilter = styled.div`
  display: flex;
  gap: 8px;
`;

const TimeButton = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(50, 205, 50, 0.3)' : 'transparent'};
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(50, 205, 50, 0.2);
    color: #fff;
  }
`;

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  timeFilter?: '7d' | '30d' | '90d' | '1y';
  onTimeFilterChange?: (filter: '7d' | '30d' | '90d' | '1y') => void;
  animationDelay?: number;
}

const ChartContainer = ({ title, children, timeFilter, onTimeFilterChange, animationDelay = 0 }: ChartContainerProps) => {
  return (
    <ChartWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Header>
        <Title>{title}</Title>
        {timeFilter && onTimeFilterChange && (
          <TimeFilter>
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <TimeButton
                key={period}
                active={timeFilter === period}
                onClick={() => onTimeFilterChange(period)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period}
              </TimeButton>
            ))}
          </TimeFilter>
        )}
      </Header>
      <div>{children}</div>
    </ChartWrapper>
  );
};

export default ChartContainer;
