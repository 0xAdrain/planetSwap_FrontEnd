// 🌍 链切换组件
// 支持多链切换，当前专注 X Layer Testnet

import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { 
  ChainId,
  getChain,
  supportedChainIds,
  isTestnet,
  isSupportedChain 
} from '../config/chains';
import { supportedChains } from '../lib/wagmi';

interface ChainSwitcherProps {
  className?: string;
}

export const ChainSwitcher: React.FC<ChainSwitcherProps> = ({ className = '' }) => {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  // 获取当前链信息
  const currentChain = getChain(currentChainId as ChainId);
  const isCurrentChainSupported = isSupportedChain(currentChainId as ChainId);

  // 处理链切换
  const handleSwitchChain = (chainId: ChainId) => {
    if (switchChain) {
      switchChain({ chainId });
    }
  };

  // 如果未连接钱包，不显示组件
  if (!isConnected) {
    return null;
  }

  return (
    <div className={`chain-switcher ${className}`}>
      {/* 当前链显示 */}
      <div className="current-chain">
        <div 
          className={`chain-indicator ${
            isCurrentChainSupported ? 'supported' : 'unsupported'
          }`}
        >
          <div className="chain-info">
            <span className="chain-name">
              {currentChain?.fullName || `Chain ${currentChainId}`}
            </span>
            {isTestnet(currentChainId as ChainId) && (
              <span className="testnet-badge">Testnet</span>
            )}
          </div>
          
          {!isCurrentChainSupported && (
            <div className="unsupported-warning">
              ⚠️ Unsupported Network
            </div>
          )}
        </div>
      </div>

      {/* 支持的链列表 */}
      {!isCurrentChainSupported && (
        <div className="supported-chains">
          <h4>Switch to supported network:</h4>
          <div className="chain-list">
            {supportedChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleSwitchChain(chain.id as ChainId)}
                disabled={isPending}
                className={`chain-option ${
                  currentChainId === chain.id ? 'active' : ''
                }`}
              >
                <div className="chain-option-info">
                  <span className="chain-name">{chain.name}</span>
                  {chain.testnet && (
                    <span className="testnet-badge">Testnet</span>
                  )}
                </div>
                {currentChainId === chain.id && (
                  <span className="active-indicator">✓</span>
                )}
              </button>
            ))}\n          </div>
        </div>
      )}

      <style jsx>{`
        .chain-switcher {
          position: relative;
        }

        .current-chain {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chain-indicator {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid;
          transition: all 0.2s;
        }

        .chain-indicator.supported {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .chain-indicator.unsupported {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .chain-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chain-name {
          font-weight: 500;
          font-size: 14px;
        }

        .testnet-badge {
          background: #f59e0b;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .unsupported-warning {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .supported-chains {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 50;
          margin-top: 8px;
          min-width: 250px;
        }

        .supported-chains h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .chain-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chain-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chain-option:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .chain-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chain-option.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .chain-option-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .active-indicator {
          color: #10b981;
          font-weight: bold;
        }

        @media (prefers-color-scheme: dark) {
          .chain-indicator.supported {
            background: rgba(16, 185, 129, 0.2);
          }
          
          .chain-indicator.unsupported {
            background: rgba(239, 68, 68, 0.2);
          }
          
          .supported-chains {
            background: #1f2937;
            border-color: #374151;
          }
          
          .chain-option {
            background: #1f2937;
            border-color: #374151;
          }
          
          .chain-option:hover {
            background: rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChainSwitcher;
