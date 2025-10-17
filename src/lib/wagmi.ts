import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { getDefaultConfig } from 'connectkit';
import { 
  DEFAULT_CHAIN_ID,
  LOCALHOST_TESTNET,
  XLAYER_TESTNET,
  SEPOLIA_TESTNET,
  ActiveChains,
  getContractAddresses
} from '../config/chains';

// 💻 定义本地测试网链配置
export const localhostTestnet = defineChain({
  id: LOCALHOST_TESTNET.id,
  name: LOCALHOST_TESTNET.fullName,
  nativeCurrency: LOCALHOST_TESTNET.nativeCurrency,
  rpcUrls: {
    default: {
      http: LOCALHOST_TESTNET.rpcUrls,
    },
    public: {
      http: LOCALHOST_TESTNET.rpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: LOCALHOST_TESTNET.blockExplorers[0].name,
      url: LOCALHOST_TESTNET.blockExplorers[0].url,
    },
  },
  contracts: LOCALHOST_TESTNET.contracts,
  testnet: true,
})

// 🧪 定义 Sepolia 测试网链配置 (使用wagmi内置)
export const sepoliaTestnet = sepolia;

// 🌍 定义 X Layer Testnet 链配置  
export const xLayerTestnet = defineChain({
  id: XLAYER_TESTNET.id,
  name: XLAYER_TESTNET.fullName,
  nativeCurrency: XLAYER_TESTNET.nativeCurrency,
  rpcUrls: {
    default: {
      http: XLAYER_TESTNET.rpcUrls,
    },
    public: {
      http: XLAYER_TESTNET.rpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: XLAYER_TESTNET.blockExplorers[0].name,
      url: XLAYER_TESTNET.blockExplorers[0].url,
    },
  },
  contracts: XLAYER_TESTNET.contracts,
  testnet: true,
})

// 🎯 当前支持的链列表
export const supportedChains = [
  xLayerTestnet,     // 🎯 主要测试网 (X Layer - 已修复)
  sepoliaTestnet,    // 🧪 备用测试网 (Sepolia)
  localhostTestnet,  // 💻 本地测试网
  // 开发环境备用链
  ...(process.env.NODE_ENV === 'development' ? [mainnet] : [])
]

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // 🌍 支持的链
    chains: supportedChains as any,
          transports: {
            // 🎯 X Layer Testnet 配置 (主要 - 已修复)
            [xLayerTestnet.id]: http(XLAYER_TESTNET.rpcUrls[0]),
            
            // 🧪 Sepolia 测试网配置 (备用)
            [sepoliaTestnet.id]: http(SEPOLIA_TESTNET.rpcUrls[0]),
            
            // 💻 本地测试网配置
            [localhostTestnet.id]: http(LOCALHOST_TESTNET.rpcUrls[0]),
      
      // 开发环境备用
      ...(process.env.NODE_ENV === 'development' ? {
        [mainnet.id]: http(),
      } : {})
    },

    // WalletConnect Project ID (可选，为空则禁用二维码扫描功能)
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // 🌟 PlanetSwap App Info
    appName: 'PlanetSwap V4',
    appDescription: 'Revolutionary DEX with Bitcoin-style Halving Tokenomics',
    appUrl: 'https://planetswap.io',
    appIcon: '/favicon.ico',
  })
);

// 导出链配置
export const chains = supportedChains;

// 🛠️ 工具函数
export function getCurrentChainId(): number {
  return DEFAULT_CHAIN_ID;
}

export function isChainSupported(chainId: number): boolean {
  return supportedChains.some(chain => chain.id === chainId);
}

// 获取当前链的合约地址
export function getCurrentContracts() {
  return getContractAddresses(DEFAULT_CHAIN_ID);
}
