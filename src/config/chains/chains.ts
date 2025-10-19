// 🌍 CometSwap 链配置定义
// Fork from: pancake-frontend-develop/packages/chains/src/chains.ts

import { ChainId, NonEVMChainId, UnifiedChainId } from './chainId'
import { chainNames, chainFullNames } from './chainNames'

export interface Chain {
  id: UnifiedChainId
  name: string
  fullName: string
  isEVM: boolean
  testnet?: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorers: {
    name: string
    url: string
  }[]
  contracts?: {
    multicall3?: {
      address: string
      blockCreated?: number
    }
  }
}

// 💻 Localhost 测试网配置
export const LOCALHOST_TESTNET: Chain = {
  id: ChainId.LOCALHOST,
  name: chainNames[ChainId.LOCALHOST],
  fullName: chainFullNames[ChainId.LOCALHOST],
  isEVM: true,
  testnet: true,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'http://127.0.0.1:8545'
  ],
  blockExplorers: [
    {
      name: 'Localhost Explorer',
      url: 'http://localhost:8545'
    }
  ],
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    }
  }
}

// 🎯 X Layer Testnet 完整配置
export const XLAYER_TESTNET: Chain = {
  id: ChainId.X_LAYER_TESTNET,
  name: chainNames[ChainId.X_LAYER_TESTNET],
  fullName: chainFullNames[ChainId.X_LAYER_TESTNET],
  isEVM: true,
  testnet: true,
  nativeCurrency: {
    name: 'OKB',
    symbol: 'OKB',
    decimals: 18,
  },
  rpcUrls: [
    'https://testrpc.xlayer.tech/terigon',
    'https://xlayertestrpc.okx.com'  // 备用RPC
  ],
  blockExplorers: [
    {
      name: 'X Layer Testnet Explorer',
      url: 'https://web3.okx.com/explorer/xlayer-test'
    }
  ],
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11', // 标准Multicall3地址
      blockCreated: 47416,  // 需要根据实际部署确定
    }
  }
}

// 🧪 Sepolia 测试网配置 (替代X Layer)
export const SEPOLIA_TESTNET: Chain = {
  id: ChainId.SEPOLIA,
  name: chainNames[ChainId.SEPOLIA],
  fullName: chainFullNames[ChainId.SEPOLIA],
  isEVM: true,
  testnet: true,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.ankr.com/eth_sepolia',
    'https://ethereum-sepolia.publicnode.com',
    'https://1rpc.io/sepolia',
    'https://sepolia.blockpi.network/v1/rpc/public'
  ],
  blockExplorers: [
    {
      name: 'Sepolia Etherscan',
      url: 'https://sepolia.etherscan.io'
    }
  ],
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 751532,
    }
  }
}

// 🔮 未来支持的链配置 (预留)
const ETHEREUM: Chain = {
  id: ChainId.ETHEREUM,
  name: chainNames[ChainId.ETHEREUM],
  fullName: chainFullNames[ChainId.ETHEREUM],
  isEVM: true,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth'
  ],
  blockExplorers: [
    {
      name: 'Etherscan',
      url: 'https://etherscan.io'
    }
  ]
}

const BSC: Chain = {
  id: ChainId.BSC,
  name: chainNames[ChainId.BSC],
  fullName: chainFullNames[ChainId.BSC],
  isEVM: true,
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    'https://bsc-dataseed1.binance.org',
    'https://rpc.ankr.com/bsc'
  ],
  blockExplorers: [
    {
      name: 'BSCScan',
      url: 'https://bscscan.com'
    }
  ]
}

// 🌍 Supported chains list
export const Chains: Chain[] = [
  LOCALHOST_TESTNET, // 💻 本地测试网
  XLAYER_TESTNET,    // 🔥 主要测试网
  SEPOLIA_TESTNET,   // 🧪 以太坊测试网 (备用)
  // 未来扩展时取消注释：
  // BSC,
  // ETHEREUM,
]

// 🎯 当前活跃链配置
export const ActiveChains: Chain[] = [
  XLAYER_TESTNET,    // 🎯 X Layer测试网 (已修复，优先)
  SEPOLIA_TESTNET,   // 🧪 Sepolia测试网 (备用)
  LOCALHOST_TESTNET  // 💻 本地开发测试
]

// 链ID到链配置的映射
export const chainMap = Chains.reduce((acc, chain) => {
  acc[chain.id] = chain
  return acc
}, {} as Record<UnifiedChainId, Chain>)

// 获取链配置的工具函数
export function getChain(chainId: UnifiedChainId): Chain | undefined {
  return chainMap[chainId]
}

// 检查是否为测试网
export function isTestnet(chainId: UnifiedChainId): boolean {
  const chain = getChain(chainId)
  return chain?.testnet === true
}

// 检查链是否受支持
export function isSupportedChain(chainId: UnifiedChainId): boolean {
  return ActiveChains.some(chain => chain.id === chainId)
}
