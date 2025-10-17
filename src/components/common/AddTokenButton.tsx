import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Token } from '../../config/tokens';
import { useAccount } from 'wagmi';

interface AddTokenButtonProps {
  token: Token;
  size?: 'small' | 'medium';
  className?: string;
}

const AddButton = styled(motion.button)<{ $size: 'small' | 'medium' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(50, 205, 50, 0.1);
  border: 1px solid rgba(50, 205, 50, 0.3);
  border-radius: ${props => props.$size === 'small' ? '6px' : '8px'};
  color: #32CD32;
  font-size: ${props => props.$size === 'small' ? '11px' : '12px'};
  font-weight: 500;
  padding: ${props => props.$size === 'small' ? '4px 6px' : '6px 8px'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(50, 205, 50, 0.2);
    border-color: rgba(50, 205, 50, 0.5);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  svg {
    width: ${props => props.$size === 'small' ? '12px' : '14px'};
    height: ${props => props.$size === 'small' ? '12px' : '14px'};
    margin-right: ${props => props.$size === 'small' ? '2px' : '4px'};
  }
`;

const SuccessButton = styled(AddButton)`
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
  
  &:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.5);
  }
`;

export const AddTokenButton: React.FC<AddTokenButtonProps> = ({
  token,
  size = 'medium',
  className
}) => {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToken = async () => {
    if (!isConnected || !window.ethereum || token.isNative) return;

    setIsLoading(true);
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.logoURI || undefined, // 可选的代币图标
          },
        },
      });

      if (wasAdded) {
        setIsAdded(true);
        console.log(`✅ ${token.symbol} 已添加到钱包`);
        
        // 3秒后重置状态
        setTimeout(() => {
          setIsAdded(false);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ 添加代币失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 原生代币不需要添加按钮
  if (token.isNative || token.address === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  // 如果钱包未连接，不显示按钮
  if (!isConnected || !window.ethereum) {
    return null;
  }

  const ButtonComponent = isAdded ? SuccessButton : AddButton;

  return (
    <ButtonComponent
      $size={size}
      className={className}
      onClick={handleAddToken}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      title={isAdded ? `${token.symbol} 已添加到钱包` : `添加 ${token.symbol} 到钱包`}
    >
      <PlusIcon />
      {isLoading ? (
        size === 'small' ? 'Adding...' : 'Adding...'
      ) : isAdded ? (
        size === 'small' ? '✓ Added' : '✓ Added'
      ) : (
        size === 'small' ? 'Add' : 'Add to Wallet'
      )}
    </ButtonComponent>
  );
};

export default AddTokenButton;
