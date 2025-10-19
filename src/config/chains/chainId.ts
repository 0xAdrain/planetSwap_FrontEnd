// 🌍 CometSwap 多链配置 - 基于 PancakeSwap 架构
// Fork from: pancake-frontend-develop/packages/chains/src/chainId.ts

export enum ChainId {
  // 💻 本地开发网络
  LOCALHOST = 31337,
  
  // 🎯 主要支持链
  X_LAYER_TESTNET = 1952,

  // 🔮 未来扩展链 (预留)
  ETHEREUM = 1,
  BSC = 56,
  BSC_TESTNET = 97,
  ARBITRUM_ONE = 42161,
  BASE = 8453,
  OPBNB = 204,
  
  // 测试网络
  GOERLI = 5,
  SEPOLIA = 11155111,
  ARBITRUM_SEPOLIA = 421614,
  BASE_SEPOLIA = 84532,
  OPBNB_TESTNET = 5611,
}

export enum NonEVMChainId {
  SOLANA = 8000001001,
  APTOS = 8000002000,
}

export type UnifiedChainId = ChainId | NonEVMChainId

// 测试网链ID列表
export const testnetChainIds = [
  ChainId.X_LAYER_TESTNET,      // 🎯 当前主要测试网
  ChainId.BSC_TESTNET,
  ChainId.GOERLI,
  ChainId.SEPOLIA,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.BASE_SEPOLIA,
  ChainId.OPBNB_TESTNET,
] as const

// 主网链ID列表  
export const mainnetChainIds = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.ARBITRUM_ONE,
  ChainId.BASE,
  ChainId.OPBNB,
] as const

// 当前支持的链ID
export const supportedChainIds = [
  ChainId.X_LAYER_TESTNET,      // 🎯 主要测试网 (X Layer) - 已修复
  ChainId.SEPOLIA,              // 🧪 备用测试网 (Sepolia)
  ChainId.LOCALHOST,            // 💻 本地测试网
  // 未来扩展时取消注释：
  // ChainId.BSC,
  // ChainId.ETHEREUM,
] as const

// 默认链ID - X Layer测试网已修复
export const DEFAULT_CHAIN_ID = ChainId.X_LAYER_TESTNET
