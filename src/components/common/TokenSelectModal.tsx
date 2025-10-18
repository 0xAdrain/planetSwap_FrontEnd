import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Token } from '../../config/tokens';
import AddTokenButton from './AddTokenButton';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  tokens: Token[];
  selectedToken?: Token | null;
  title?: string;
}

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px 20px 16px 52px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: rgba(34, 197, 94, 0.4);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
`;

const CommonTokensSection = styled.div`
  margin-bottom: 16px;
`;

const CommonTokensTitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const CommonTokensGrid = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const CommonTokenChip = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.selected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.2);
  }
`;

const TokenListContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  flex: 1;
  overflow: hidden;
`;

const TokenListTitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const TokenList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -4px;
  padding: 4px;
  
  /* PancakeSwap风格滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TokenItem = styled(motion.div)<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  border-radius: 12px;
  margin-bottom: 4px;
  background: ${props => props.$selected ? 'rgba(34, 197, 94, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$selected ? 'rgba(34, 197, 94, 0.2)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.1);
  }
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
`;

const TokenInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TokenSymbol = styled.div`
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenName = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TokenRightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const TokenBalance = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const TokenUsdValue = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
`;

const NoResults = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 60px 20px;
  font-size: 16px;
`;

const NoResultsEmoji = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  tokens,
  selectedToken,
  title = "Select a token"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 🎯 常用代币（前4个非原生代币）
  const commonTokens = useMemo(() => {
    return (tokens || [])
      .filter(token => !token.isNative)
      .slice(0, 4);
  }, [tokens]);

  // 🔍 过滤代币
  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokens || [];
    
    const search = searchTerm.toLowerCase();
    return (tokens || []).filter(token => 
      token.symbol.toLowerCase().includes(search) ||
      token.name.toLowerCase().includes(search) ||
      token.address.toLowerCase().includes(search)
    );
  }, [tokens, searchTerm]);

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    onClose();
    setSearchTerm(''); // 清除搜索
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <Title>{title}</Title>
            <CloseButton onClick={onClose}>
              <XMarkIcon width={24} height={24} />
            </CloseButton>
          </Header>

          <SearchContainer>
            <SearchIcon>
              <MagnifyingGlassIcon width={20} height={20} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search name or paste address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          {/* 常用代币 - 只在没有搜索时显示 */}
          {!searchTerm && commonTokens.length > 0 && (
            <CommonTokensSection>
              <CommonTokensTitle>Common tokens</CommonTokensTitle>
              <CommonTokensGrid>
                {commonTokens.map((token) => (
                  <CommonTokenChip
                    key={token.address}
                    selected={selectedToken?.address === token.address}
                    onClick={() => handleSelectToken(token)}
                  >
                    <TokenIcon style={{ width: '20px', height: '20px', fontSize: '10px' }}>
                      {token.symbol.slice(0, 2)}
                    </TokenIcon>
                    {token.symbol}
                  </CommonTokenChip>
                ))}
              </CommonTokensGrid>
            </CommonTokensSection>
          )}

          {/* 代币列表 */}
          <TokenListContainer>
            <TokenListTitle>
              {searchTerm ? `Search results` : `All tokens`} ({filteredTokens.length})
            </TokenListTitle>
            <TokenList>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <TokenItem
                    key={token.address}
                    $selected={selectedToken?.address === token.address}
                    onClick={() => handleSelectToken(token)}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <TokenIcon>
                      {token.logoURI || token.symbol.slice(0, 2)}
                    </TokenIcon>
                    <TokenInfo>
                      <TokenSymbol>{token.symbol}</TokenSymbol>
                      <TokenName>{token.name}</TokenName>
                    </TokenInfo>
                    <TokenRightSection>
                      <TokenBalance>
                        {token.balanceFormatted ? parseFloat(token.balanceFormatted).toFixed(4) : '0.0000'}
                      </TokenBalance>
                      <TokenUsdValue>
                        ${token.balanceFormatted ? (parseFloat(token.balanceFormatted) * 200).toFixed(2) : '0.00'}
                      </TokenUsdValue>
                    </TokenRightSection>
                  </TokenItem>
                ))
              ) : (tokens || []).length === 0 ? (
                <NoResults>
                  <NoResultsEmoji>🪙</NoResultsEmoji>
                  <div>No tokens available</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                    Please check your network connection
                  </div>
                </NoResults>
              ) : (
                <NoResults>
                  <NoResultsEmoji>🔍</NoResultsEmoji>
                  <div>No results found</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                    Try a different search term or check the spelling
                  </div>
                </NoResults>
              )}
            </TokenList>
          </TokenListContainer>
        </Modal>
      </Backdrop>
    </AnimatePresence>
  );
};

export default TokenSelectModal;



