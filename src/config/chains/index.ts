// 🌍 CometSwap 多链配置统一入口
// Fork from: pancake-frontend-develop/packages/chains/src/index.ts

// 链ID和枚举
export * from './chainId'

// 链名称配置
export * from './chainNames'

// 链配置和定义
export * from './chains'

// 合约地址管理
export * from './contracts'

// 🎯 快速导入的常用配置
export {
  DEFAULT_CHAIN_ID,
  supportedChainIds,
  testnetChainIds,
  mainnetChainIds,
} from './chainId'

export {
  XLAYER_TESTNET,
  ActiveChains,
  Chains,
  getChain,
  isTestnet,
  isSupportedChain,
} from './chains'

export {
  CONTRACT_ADDRESSES,
  getContractAddresses,
  getContractAddress,
  isContractDeployed,
  getDeployedContracts,
} from './contracts'

// 🔧 常用工具类型
export type {
  Chain,
  ContractAddresses,
  UnifiedChainId,
} from './chains'
