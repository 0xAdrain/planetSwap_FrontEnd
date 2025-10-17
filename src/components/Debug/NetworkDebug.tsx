import React, { useState } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import styled from '@emotion/styled';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 11px;
  z-index: 999;
  max-width: 280px;
  word-break: break-all;
  border: 1px solid rgba(34, 139, 34, 0.3);
`;

const DebugLine = styled.div`
  margin: 2px 0;
`;

const StatusBadge = styled.span<{ status: 'success' | 'error' | 'warning' }>`
  padding: 2px 6px;
  border-radius: 3px;
  background: ${props => 
    props.status === 'success' ? '#22c55e' : 
    props.status === 'error' ? '#ef4444' : 
    '#f59e0b'
  };
  margin-right: 5px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  
  &:hover {
    color: #ef4444;
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 50%;
  color: #32CD32;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 16px;
  z-index: 998;
  
  &:hover {
    background: rgba(34, 139, 34, 0.2);
  }
`;

export const NetworkDebug: React.FC = () => {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: balance, isLoading, error } = useBalance({
    address,
    chainId: chainId,
  });

  if (!isOpen) {
    return (
      <ToggleButton onClick={() => setIsOpen(true)} title="开启调试信息">
        🐛
      </ToggleButton>
    );
  }

  return (
    <DebugContainer>
      <CloseButton onClick={() => setIsOpen(false)} title="关闭调试信息">
        ×
      </CloseButton>
      
      <DebugLine>
        <StatusBadge status={isConnected ? 'success' : 'error'}>
          {isConnected ? '🟢' : '🔴'}
        </StatusBadge>
        钱包连接状态
      </DebugLine>
      
      <DebugLine>
        <strong>Chain ID:</strong> {chainId}
        <StatusBadge status={chainId === 1952 ? 'success' : 'warning'}>
          {chainId === 1952 ? 'X Layer ✓' : 'Wrong Network'}
        </StatusBadge>
      </DebugLine>
      
      <DebugLine>
        <strong>地址:</strong> {address ? `${address.slice(0,8)}...` : 'None'}
      </DebugLine>
      
      <DebugLine>
        <strong>连接器:</strong> {connector?.name || 'None'}
      </DebugLine>
      
      <DebugLine>
        <StatusBadge status={isLoading ? 'warning' : balance ? 'success' : 'error'}>
          {isLoading ? '⏳' : balance ? '💰' : '❌'}
        </StatusBadge>
        <strong>余额:</strong>
      </DebugLine>
      
      {balance && (
        <>
          <DebugLine>• {balance.formatted} {balance.symbol}</DebugLine>
        </>
      )}
      
      {error && (
        <DebugLine style={{ color: '#ef4444' }}>
          错误: {error.message.slice(0, 50)}...
        </DebugLine>
      )}
      
      {chainId !== 1952 && (
        <DebugLine style={{ color: '#f59e0b' }}>
          ⚠️ 请切换到X Layer测试网 (Chain ID: 1952)
        </DebugLine>
      )}
    </DebugContainer>
  );
};

export default NetworkDebug;




