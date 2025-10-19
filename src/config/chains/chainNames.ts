// 🌍 CometSwap 链名称配置
// Fork from: pancake-frontend-develop/packages/chains/src/chainNames.ts

import { ChainId, NonEVMChainId, UnifiedChainId } from './chainId'

export const chainNames: Record<UnifiedChainId, string> = {
  // 💻 本地开发
  [ChainId.LOCALHOST]: 'localhost',
  
  // 🎯 主要支持
  [ChainId.X_LAYER_TESTNET]: 'xlayerTestnet',
  
  // 🔮 未来扩展
  [ChainId.ETHEREUM]: 'eth',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bscTestnet',
  [ChainId.ARBITRUM_ONE]: 'arb',
  [ChainId.BASE]: 'base',
  [ChainId.OPBNB]: 'opBNB',
  
  // 测试网络
  [ChainId.GOERLI]: 'goerli',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'arbSepolia',
  [ChainId.BASE_SEPOLIA]: 'baseSepolia',
  [ChainId.OPBNB_TESTNET]: 'opBnbTestnet',
  
  // 非EVM链
  [NonEVMChainId.SOLANA]: 'sol',
  [NonEVMChainId.APTOS]: 'aptos',
}

export const chainFullNames: Record<UnifiedChainId, string> = {
  // 💻 本地开发
  [ChainId.LOCALHOST]: 'Localhost Testnet',
  
  // 🎯 主要支持
  [ChainId.X_LAYER_TESTNET]: 'X Layer Testnet',
  
  // 🔮 未来扩展
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.BSC]: 'BNB Chain',
  [ChainId.BSC_TESTNET]: 'BNB Chain Testnet',
  [ChainId.ARBITRUM_ONE]: 'Arbitrum One',
  [ChainId.BASE]: 'Base',
  [ChainId.OPBNB]: 'opBNB',
  
  // 测试网络
  [ChainId.GOERLI]: 'Goerli',
  [ChainId.SEPOLIA]: 'Sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia',
  [ChainId.BASE_SEPOLIA]: 'Base Sepolia',
  [ChainId.OPBNB_TESTNET]: 'opBNB Testnet',
  
  // 非EVM链
  [NonEVMChainId.SOLANA]: 'Solana',
  [NonEVMChainId.APTOS]: 'Aptos',
}

export const chainNamesInKebabCase = {
  [ChainId.X_LAYER_TESTNET]: 'x-layer-testnet',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc-testnet',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.BASE]: 'base',
  [ChainId.OPBNB]: 'opbnb',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'arbitrum-sepolia',
  [ChainId.BASE_SEPOLIA]: 'base-sepolia',
  [ChainId.OPBNB_TESTNET]: 'opbnb-testnet',
  [NonEVMChainId.SOLANA]: 'sol',
  [NonEVMChainId.APTOS]: 'aptos',
} as const

// 链名称到链ID的映射
export const chainNameToChainId = Object.entries(chainNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

// 完整名称到链ID的映射
const chainFullNamesToChainId = Object.entries(chainFullNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

// 所有名称格式的综合映射
export const allCasesNameToChainId = Object.entries({
  ...chainFullNamesToChainId,
  ...chainNameToChainId,
}).reduce((acc, [chainName, chainId]) => {
  return {
    [chainName]: +chainId as UnifiedChainId,
    [chainName.toLowerCase()]: +chainId as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)
