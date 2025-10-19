import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import ChartContainer from './ChartContainer';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
`;

const LoadingSpinner = styled(motion.div)`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(34, 139, 34, 0.2);
  border-top: 4px solid #32CD32;
  border-radius: 50%;
`;

const LoadingText = styled(motion.div)`
  color: #32CD32;
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
`;

const StatCard = styled(motion.div)`
  background: rgba(15, 35, 15, 0.4);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#4ADE80' : '#F87171'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const MainChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const generateTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.random() * 1000000 + 500000,
      tvl: Math.random() * 5000000 + 2000000,
    });
  }
  return data;
};

const pieData = [
  { name: 'COMET/OKB', value: 35, color: '#32CD32' },
  { name: 'COMET/USDT', value: 25, color: '#228B22' },
  { name: 'OKB/USDT', value: 20, color: '#90EE90' },
  { name: 'Other', value: 20, color: '#006400' }
];

const burnData = [
  { month: 'Jan', burned: 125000, accumulated: 125000 },
  { month: 'Feb', burned: 180000, accumulated: 305000 },
  { month: 'Mar', burned: 220000, accumulated: 525000 },
  { month: 'Apr', burned: 195000, accumulated: 720000 },
  { month: 'May', burned: 240000, accumulated: 960000 },
  { month: 'Jun', burned: 280000, accumulated: 1240000 }
];

export default function StatsInterface() {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;
      setChartData(generateTimeSeriesData(days));
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [timeFilter]);

  const stats = [
    { title: 'Total Value Locked (TVL)', value: '$12.5M', change: '+15.2%', positive: true },
    { title: '24h Volume', value: '$2.8M', change: '+8.7%', positive: true },
    { title: 'Total Users', value: '45,231', change: '+12.1%', positive: true },
    { title: 'Total SLEEPING Burned', value: '1.24M', change: '+5.8%', positive: true },
    { title: 'Active Pools', value: '127', change: '+3', positive: true },
  ];

  if (loading) {
    return (
      <Container>
        <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          <LoadingText>Loading Analytical Data...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <StatTitle>{stat.title}</StatTitle>
            <StatValue>{stat.value}</StatValue>
            <StatChange positive={stat.positive}>{stat.change}</StatChange>
          </StatCard>
        ))}
      </StatsGrid>

      <MainChartsGrid>
        <ChartContainer
          title="Volume & TVL"
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          animationDelay={0.2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="rgba(34, 139, 34, 0.1)" />
              <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Area type="monotone" dataKey="volume" stroke="#32CD32" fill="rgba(50, 205, 50, 0.2)" name="Volume" />
              <Area type="monotone" dataKey="tvl" stroke="#90EE90" fill="rgba(144, 238, 144, 0.2)" name="TVL" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Liquidity Distribution" animationDelay={0.3}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </MainChartsGrid>

      <ChartContainer title="SLEEPING Token Burn" animationDelay={0.4}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={burnData}>
            <CartesianGrid stroke="rgba(34, 139, 34, 0.1)" />
            <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
            <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="burned" fill="#FF6B35" name="Monthly Burn" />
            <Line type="monotone" dataKey="accumulated" stroke="#32CD32" strokeWidth={2} name="Accumulated Burn" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
}