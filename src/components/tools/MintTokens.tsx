import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { 
  GiftIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useTokens } from '../../hooks/contracts/useTokens';
import ERC20ABI from '../../contracts/abis/ERC20.json';
import NetworkSwitcher from '../NetworkSwitcher';

const Container = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(34, 139, 34, 0.2);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TokenCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(34, 139, 34, 0.5);
    background: rgba(0, 0, 0, 0.4);
  }
`;

const TokenHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.div`
  font-size: 1.5rem;
`;

const TokenName = styled.div`
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
`;

const TokenBalance = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: right;
`;

const MintSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AmountInput = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 0.9rem;
  outline: none;
  flex: 1;
  transition: all 0.3s ease;

  &:focus {
    border-color: #32CD32;
    box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const MintButton = styled(motion.button)<{ disabled?: boolean }>`
  background: ${props => props.disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)'
  };
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(34, 139, 34, 0.3);
    `}
  }
`;

const MintAllButton = styled(motion.button)`
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatusMessage = styled(motion.div)<{ type: 'success' | 'error' | 'info' }>`
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props =>
    props.type === 'success' ? 'rgba(34, 139, 34, 0.1)' :
    props.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(255, 107, 53, 0.1)'
  };
  border: 1px solid ${props =>
    props.type === 'success' ? 'rgba(34, 139, 34, 0.3)' :
    props.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
    'rgba(255, 107, 53, 0.3)'
  };
  color: ${props =>
    props.type === 'success' ? '#32CD32' :
    props.type === 'error' ? '#ef4444' :
    '#FF6B35'
  };
`;

// 默认mint数量配置
const DEFAULT_MINT_AMOUNTS = {
  'mUSDT': '10000',
  'mUSDC': '10000', 
  'mWBTC': '1',
  'mETH': '10',
  'mDAI': '10000',
  'mMEME': '100000',
  'WOKB': '1000'
};

export const MintTokens: React.FC = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { tokens, isLoading: tokensLoading } = useTokens();
  
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error } = useWaitForTransactionReceipt({
    hash,
  });

  const [mintAmounts, setMintAmounts] = useState<Record<string, string>>(DEFAULT_MINT_AMOUNTS);
  const [lastMintedToken, setLastMintedToken] = useState<string>('');
  const [isMintingAll, setIsMintingAll] = useState(false);

  // 过滤掉原生OKB，只显示可mint的ERC20代币
  const mintableTokens = tokens.filter(token => 
    !token.isNative && token.address !== '0x0000000000000000000000000000000000000000'
  );

  const handleMintToken = async (tokenAddress: Address, symbol: string, decimals: number) => {
    if (!userAddress || !mintAmounts[symbol]) return;

    try {
      const amount = parseUnits(mintAmounts[symbol], decimals);
      
      await writeContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'mint',
        args: [userAddress, amount],
      });

      setLastMintedToken(symbol);
    } catch (error) {
      console.error(`Mint ${symbol} 失败:`, error);
    }
  };

  const handleMintAll = async () => {
    if (!userAddress || isMintingAll) return;
    
    setIsMintingAll(true);
    
    try {
      for (const token of mintableTokens) {
        const amount = mintAmounts[token.symbol];
        if (!amount || parseFloat(amount) <= 0) continue;
        
        console.log(`正在mint ${token.symbol}...`);
        
        const mintAmount = parseUnits(amount, token.decimals);
        
        await writeContract({
          address: token.address,
          abi: ERC20ABI,
          functionName: 'mint',
          args: [userAddress, mintAmount],
        });
        
        // 等待一下避免交易冲突
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setLastMintedToken('ALL');
    } catch (error) {
      console.error('批量mint失败:', error);
    } finally {
      setIsMintingAll(false);
    }
  };

  const updateMintAmount = (symbol: string, amount: string) => {
    setMintAmounts(prev => ({
      ...prev,
      [symbol]: amount
    }));
  };

  return (
    <NetworkSwitcher>
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          <GiftIcon width={32} height={32} />
          🎁 免费获取测试代币
        </Title>
        
        <Description>
          所有代币都是免费的测试代币，任何人都可以无限mint用于在PlanetSwap上测试交易。
          这些代币仅用于X Layer Testnet测试，没有任何实际价值。
        </Description>

        {!isConnected && (
          <StatusMessage type="info">
            <ExclamationTriangleIcon width={20} height={20} />
            请先Connect wallet到X Layer Testnet
          </StatusMessage>
        )}

        {tokensLoading ? (
          <StatusMessage type="info">
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
            正在加载代币信息...
          </StatusMessage>
        ) : (
          <>
            <TokenGrid>
              {mintableTokens.map((token) => (
                <TokenCard
                  key={token.address}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <TokenHeader>
                    <TokenInfo>
                      <TokenIcon>{token.logoURI || '🪙'}</TokenIcon>
                      <div>
                        <TokenName>{token.symbol}</TokenName>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                          {token.name}
                        </div>
                      </div>
                    </TokenInfo>
                    <TokenBalance>
                      余额: {token.balanceFormatted || '0'}
                    </TokenBalance>
                  </TokenHeader>

                  <MintSection>
                    <AmountInput
                      type="number"
                      placeholder={DEFAULT_MINT_AMOUNTS[token.symbol] || '1000'}
                      value={mintAmounts[token.symbol] || ''}
                      onChange={(e) => updateMintAmount(token.symbol, e.target.value)}
                    />
                    <MintButton
                      onClick={() => handleMintToken(
                        token.address, 
                        token.symbol, 
                        token.decimals
                      )}
                      disabled={!isConnected || isConfirming || !mintAmounts[token.symbol]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GiftIcon width={14} height={14} />
                      {isConfirming && lastMintedToken === token.symbol ? 'Minting...' : 'Mint'}
                    </MintButton>
                  </MintSection>
                </TokenCard>
              ))}
            </TokenGrid>

            <MintAllButton
              onClick={handleMintAll}
              disabled={!isConnected || isMintingAll || isConfirming}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GiftIcon width={20} height={20} />
              {isMintingAll ? '正在批量Mint...' : '🎁 一键获取所有代币'}
            </MintAllButton>
          </>
        )}

        {/* 状态消息 */}
        {isConfirming && (
          <StatusMessage type="info">
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
            Trade confirmation中...
          </StatusMessage>
        )}

        {isSuccess && (
          <StatusMessage type="success">
            <CheckCircleIcon width={20} height={20} />
            {lastMintedToken === 'ALL' 
              ? '🎉 所有代币mint成功！现在可以去交易了！'
              : `🎉 ${lastMintedToken} mint成功！`
            }
          </StatusMessage>
        )}

        {error && (
          <StatusMessage type="error">
            <ExclamationTriangleIcon width={20} height={20} />
            Mint失败: {error.message}
          </StatusMessage>
        )}
      </Container>
    </NetworkSwitcher>
  );
};

export default MintTokens;
