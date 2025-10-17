// 🪙 PlanetSwap 多链代币配置
// 根据不同网络动态加载代币列表

import { Address } from 'viem';
import { ChainId } from '../chains/chainId';
import { getContractAddresses } from '../chains/contracts';

// 💻 本地测试网代币配置
export const LOCALHOST_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000' as Address,
    symbol: 'ETH',
    name: 'Ether (Native)',
    decimals: 18,
    logoURI: '⚡',
    isNative: true,
  },
  {
    address: '0x0165878A594ca255338adfa4d48449f69242Eb8F' as Address,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    symbol: 'mUSDT',
    name: 'Mock USDT',
    decimals: 6,
  },
  {
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
    symbol: 'mUSDC',
    name: 'Mock USDC',
    decimals: 6,
  },
  {
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address,
    symbol: 'mWBTC',
    name: 'Mock WBTC',
    decimals: 8,
  },
  {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address,
    symbol: 'mETH',
    name: 'Mock ETH',
    decimals: 18,
  },
  {
    address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as Address,
    symbol: 'mDAI',
    name: 'Mock DAI',
    decimals: 18,
  },
  {
    address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' as Address,
    symbol: 'mMEME',
    name: 'Mock MEME',
    decimals: 18,
  }
];

// 🪙 代币接口定义
export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  balanceFormatted?: string;
  isNative?: boolean;
}

// 🧪 Sepolia 测试网代币配置
export const SEPOLIA_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000' as Address,
    symbol: 'ETH',
    name: 'Ether (Native)',
    decimals: 18,
    logoURI: '⚡',
    isNative: true,
  },
  {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as Address, // Sepolia WETH
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  // 测试代币将在部署后动态添加
];

// 🌊 X Layer 测试网代币配置 
export const XLAYER_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000' as Address,
    symbol: 'OKB',
    name: 'OKB (Native)', 
    decimals: 18,
    logoURI: '🟡',
    isNative: true,
  },
  {
    address: '0xFCF165C4C8925682aE5facEC596D474eB36CE825' as Address,
    symbol: 'mWOKB',
    name: 'Mock Wrapped OKB',
    decimals: 18,
    logoURI: '🔄',
  },
  {
    address: '0xE196aaADEbAcCE2354Aa414D202E0AB1C907d8B5' as Address,
    symbol: 'mUSDT',
    name: 'Mock USDT',
    decimals: 6,
  },
  {
    address: '0x70b759Ba2ca756fAD20B232De07F583AA5E676FC' as Address,
    symbol: 'mUSDC',
    name: 'Mock USDC',
    decimals: 6,
  },
  {
    address: '0x3f806e22414060286632d5f5C67B6afbD4B1D7b9' as Address,
    symbol: 'mWBTC',
    name: 'Mock WBTC',
    decimals: 8,
  },
  {
    address: '0xb16637fA04A286C0EE2874935970cdA0b595e16a' as Address,
    symbol: 'mETH',
    name: 'Mock ETH',
    decimals: 18,
  },
  {
    address: '0x4Ec24e2da05F7C6fC54C3234137E07d0A8826610' as Address,
    symbol: 'mDAI',
    name: 'Mock DAI',
    decimals: 18,
  },
  {
    address: '0x826DB476956eE85D9b3807dE4889945f9dd81740' as Address,
    symbol: 'mMEME',
    name: 'Mock MEME',
    decimals: 18,
  }
];

// 🌍 所有网络的代币配置
export const TOKEN_LISTS: Record<ChainId, Token[]> = {
  [ChainId.LOCALHOST]: LOCALHOST_TOKENS,
  [ChainId.SEPOLIA]: SEPOLIA_TOKENS,
  [ChainId.X_LAYER_TESTNET]: XLAYER_TOKENS,
  
  // 其他网络默认为空列表
  [ChainId.ETHEREUM]: [],
  [ChainId.BSC]: [],
  [ChainId.BSC_TESTNET]: [],
  [ChainId.ARBITRUM_ONE]: [],
  [ChainId.BASE]: [],
  [ChainId.OPBNB]: [],
  [ChainId.GOERLI]: [],
  [ChainId.ARBITRUM_SEPOLIA]: [],
  [ChainId.BASE_SEPOLIA]: [],
  [ChainId.OPBNB_TESTNET]: [],
};

// 🛠️ 工具函数

/**
 * 获取指定网络的代币列表
 */
export function getTokenListForChain(chainId: ChainId): Token[] {
  console.log('🔍 getTokenListForChain 调试:', {
    chainId,
    chainIdType: typeof chainId,
    availableChains: Object.keys(TOKEN_LISTS).map(k => ({ key: k, type: typeof k }))
  });
  
  const baseTokens = TOKEN_LISTS[chainId] || [];
  console.log('📋 BaseTokens for chain', chainId, ':', baseTokens.length, 'tokens');
  
  // 尝试从环境变量或合约配置中获取实际部署的代币地址
  try {
    const contracts = getContractAddresses(chainId);
    console.log('🏭 合约配置:', contracts);
    
    // 动态更新WETH地址
    const updatedTokens = baseTokens.map(token => {
      if (token.symbol === 'WETH' || token.symbol === 'WOKB') {
        const updatedToken = {
          ...token,
          address: contracts.WETH as Address
        };
        console.log(`🔄 更新 ${token.symbol} 地址:`, token.address, '→', updatedToken.address);
        return updatedToken;
      }
      return token;
    });
    
    console.log('✅ 最终代币列表:', updatedTokens.length, '个代币');
    return updatedTokens;
  } catch (error) {
    console.error(`❌ 无法加载链 ${chainId} 的合约配置:`, error);
    console.warn(`使用默认代币列表: ${baseTokens.length} 个代币`);
    return baseTokens;
  }
}

/**
 * 获取原生代币信息
 */
export function getNativeToken(chainId: ChainId): Token | undefined {
  const tokens = getTokenListForChain(chainId);
  return tokens.find(token => token.isNative);
}

/**
 * 获取包装代币信息
 */
export function getWrappedToken(chainId: ChainId): Token | undefined {
  const tokens = getTokenListForChain(chainId);
  return tokens.find(token => 
    token.symbol === 'WETH' || 
    token.symbol === 'WOKB' ||
    token.symbol === 'WBNB'
  );
}

/**
 * 根据地址查找代币
 */
export function getTokenByAddress(chainId: ChainId, address: Address): Token | undefined {
  const tokens = getTokenListForChain(chainId);
  return tokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * 根据符号查找代币
 */
export function getTokenBySymbol(chainId: ChainId, symbol: string): Token | undefined {
  const tokens = getTokenListForChain(chainId);
  return tokens.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * 获取测试代币列表 (排除原生和包装代币)
 */
export function getTestTokens(chainId: ChainId): Token[] {
  const tokens = getTokenListForChain(chainId);
  return tokens.filter(token => 
    !token.isNative && 
    token.symbol !== 'WETH' && 
    token.symbol !== 'WOKB' && 
    token.symbol !== 'WBNB'
  );
}

// 默认导出
export default {
  TOKEN_LISTS,
  getTokenListForChain,
  getNativeToken,
  getWrappedToken,
  getTokenByAddress,
  getTokenBySymbol,
  getTestTokens
};




