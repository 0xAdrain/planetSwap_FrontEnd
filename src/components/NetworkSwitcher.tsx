import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SwitchButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NetworkBadge = styled.div<{ isCorrect: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => props.isCorrect ? 
    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  };
  color: white;
  margin-bottom: 12px;
`;

const WarningCard = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  text-align: center;
`;

const WarningTitle = styled.h3`
  color: #ef4444;
  margin: 0 0 12px 0;
  font-size: 18px;
`;

const WarningText = styled.p`
  color: #fca5a5;
  margin: 8px 0 16px 0;
  line-height: 1.5;
`;

interface NetworkSwitcherProps {
  requiredChainId?: number;
  children?: React.ReactNode;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ 
  requiredChainId = 1952, // X Layer Testnet
  children 
}) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  // 如果没有Connect wallet，显示子组件
  if (!isConnected) {
    return <>{children}</>;
  }

  // 如果已经在正确的网络，显示子组件
  if (chainId === requiredChainId) {
    return (
      <>
        <NetworkBadge isCorrect={true}>
          🟢 X Layer Testnet 已连接
        </NetworkBadge>
        {children}
      </>
    );
  }

  // 如果在错误的网络，显示切换提示
  return (
    <>
      <NetworkBadge isCorrect={false}>
        🔴 网络错误：当前 Chain ID {chainId}
      </NetworkBadge>
      
      <WarningCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WarningTitle>⚠️ 网络不匹配</WarningTitle>
        <WarningText>
          请切换到 <strong>X Layer Testnet</strong> 网络来使用 PlanetSwap。
          <br />
          Chain ID: {requiredChainId}
        </WarningText>
        
        <SwitchButton
          disabled={isPending}
          onClick={() => switchChain({ chainId: requiredChainId })}
          whileTap={{ scale: 0.95 }}
        >
          {isPending ? '切换中...' : '切换到 X Layer Testnet'}
        </SwitchButton>
        
        <div style={{ marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
          💡 提示：如果没有 X Layer Testnet，请先在钱包中添加此网络
        </div>
      </WarningCard>
    </>
  );
};

export default NetworkSwitcher;
