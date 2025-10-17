import styled from '@emotion/styled';

const TooltipContainer = styled.div`
  background: rgba(10, 15, 10, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 14px;
`;

const TooltipLabel = styled.p`
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const ItemLabel = styled.span`
  color: rgba(255, 255, 255, 0.9);
`;

const ItemValue = styled.span`
  font-weight: 600;
  margin-left: auto;
  padding-left: 16px;
`;

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const formatNumber = (value: number) => {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const ChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <TooltipLabel>{label}</TooltipLabel>
        {payload.map((pld, index) => (
          <TooltipItem key={index}>
            <ColorSwatch color={pld.color} />
            <ItemLabel>{pld.name}:</ItemLabel>
            <ItemValue>
              {typeof pld.value === 'number' ? formatNumber(pld.value) : pld.value}
            </ItemValue>
          </TooltipItem>
        ))}
      </TooltipContainer>
    );
  }

  return null;
};

export default ChartTooltip;
