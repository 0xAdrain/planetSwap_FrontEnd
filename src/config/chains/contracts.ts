// 🌍 CometSwap 合约地址配置
// 多链合约地址管理，支持环境变量覆盖

import { ChainId } from './chainId'

// 合约地址接口定义
export interface ContractAddresses {
  // 🪙 核心代币合约
  PLANET_TOKEN: string
  WETH: string  // Wrapped Native Token (在X Layer上是WOKB)
  
  // 🏭 V2 核心合约
  PLANET_FACTORY: string
  PLANET_ROUTER: string
  PLANET_INIT_CODE_HASH: string
  
  // 🧠 智能路由器 - 支持V2/V3混合路由
  PLANET_SMART_ROUTER: string
  
  // 🎯 V3 核心合约 (未来)
  PLANET_V3_FACTORY?: string
  PLANET_V3_ROUTER?: string
  NONFUNGIBLE_POSITION_MANAGER?: string
  
  // 🚜 Farm & Staking 合约
  MASTER_CHEF: string
  PLANET_VAULT?: string  // 质押合约
  
  // 🎁 空投合约
  MERKLE_DISTRIBUTOR: string
  
  // 🔧 工具合约
  MULTICALL3: string
  
  // 📊 Oracle 合约 (未来)
  PRICE_ORACLE?: string
}

// 🎯 X Layer Testnet 合约地址 (2025-10-16 更新 - 使用mWOKB)
const XLAYER_TESTNET_CONTRACTS: ContractAddresses = {
  // 🪙 代币合约 (部署后更新)
  PLANET_TOKEN: process.env.NEXT_PUBLIC_PLANET_TOKEN_XLAYER || '0x0000000000000000000000000000000000000000',
  WETH: process.env.NEXT_PUBLIC_WOKB_XLAYER || '0xFCF165C4C8925682aE5facEC596D474eB36CE825', // mWOKB on X Layer
  
  // 🏭 V2 合约 (重新部署 - 使用mWOKB)
  PLANET_FACTORY: process.env.NEXT_PUBLIC_PLANET_FACTORY_XLAYER || '0x5D94f4c717F3D69A837DFC36D91e1a87b8F1aE40',
  PLANET_ROUTER: process.env.NEXT_PUBLIC_PLANET_ROUTER_XLAYER || '0x1e1561ec8F1F83E36B8BfC3f8D5c01e2587Fbcb6', // 修复后的Router
  PLANET_INIT_CODE_HASH: process.env.NEXT_PUBLIC_INIT_CODE_HASH_XLAYER || '0xad06924f5ab1bdbe259989ff87d714315c060f93b058490f62f4145a7e6dad0d',
  
  // 🧠 SmartRouter - 支持V2/V3混合路由
  PLANET_SMART_ROUTER: process.env.NEXT_PUBLIC_SMART_ROUTER_XLAYER || '0xDD7776497095CE5B9d6aF2487dB2194555B2E801',
  
  // 🎯 V3 核心合约 (已部署!)
  PLANET_V3_FACTORY: process.env.NEXT_PUBLIC_V3_FACTORY_XLAYER || '0x7e4Fe502ee78ab7728B00B3bD7fD182a4B17C45F',
  PLANET_V3_ROUTER: process.env.NEXT_PUBLIC_V3_ROUTER_XLAYER || '0xDD7776497095CE5B9d6aF2487dB2194555B2E801', // Smart Router包含V3功能
  NONFUNGIBLE_POSITION_MANAGER: process.env.NEXT_PUBLIC_NFT_MANAGER_XLAYER || '0xF9df8Fce74325c5A546d45f0C646E02830582d31', // Pool Deployer作为NFT Manager
  
  // 🚜 Farm 合约
  MASTER_CHEF: process.env.NEXT_PUBLIC_MASTER_CHEF_XLAYER || '0x0000000000000000000000000000000000000000',
  
  // 🎁 空投合约
  MERKLE_DISTRIBUTOR: process.env.NEXT_PUBLIC_MERKLE_DISTRIBUTOR_XLAYER || '0x0000000000000000000000000000000000000000',
  
  // 🔧 工具合约
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11', // 标准Multicall3
}

// 🧪 Sepolia 测试网合约地址
const SEPOLIA_CONTRACTS: ContractAddresses = {
  // 🪙 代币合约 (将要部署)
  PLANET_TOKEN: process.env.NEXT_PUBLIC_PLANET_TOKEN_SEPOLIA || '0x0000000000000000000000000000000000000000',
  WETH: process.env.NEXT_PUBLIC_WETH_SEPOLIA || '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH on Sepolia
  
  // 🏭 V2 合约 (即将部署)
  PLANET_FACTORY: process.env.NEXT_PUBLIC_PLANET_FACTORY_SEPOLIA || '0x0000000000000000000000000000000000000000',
  PLANET_ROUTER: process.env.NEXT_PUBLIC_PLANET_ROUTER_SEPOLIA || '0x0000000000000000000000000000000000000000',
  PLANET_INIT_CODE_HASH: process.env.NEXT_PUBLIC_INIT_CODE_HASH_SEPOLIA || '0x1ea8f6901dba38f0727fc9423b8d836f000adde7dc1ae5ce8420240e8c211c2e',
  
  // 🧠 SmartRouter - 支持V2/V3混合路由  
  PLANET_SMART_ROUTER: process.env.NEXT_PUBLIC_SMART_ROUTER_SEPOLIA || '0x0000000000000000000000000000000000000000',
  
  // 🚜 Farm 合约
  MASTER_CHEF: process.env.NEXT_PUBLIC_MASTER_CHEF_SEPOLIA || '0x0000000000000000000000000000000000000000',
  
  // 🎁 空投合约
  MERKLE_DISTRIBUTOR: process.env.NEXT_PUBLIC_MERKLE_DISTRIBUTOR_SEPOLIA || '0x0000000000000000000000000000000000000000',
  
  // 🔧 工具合约
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11', // 标准Multicall3
}

// 🔮 未来链合约地址 (预留)
const BSC_CONTRACTS: ContractAddresses = {
  PLANET_TOKEN: '0x0000000000000000000000000000000000000000',
  WETH: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
  PLANET_FACTORY: '0x0000000000000000000000000000000000000000',
  PLANET_ROUTER: '0x0000000000000000000000000000000000000000',
  PLANET_INIT_CODE_HASH: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
  PLANET_SMART_ROUTER: '0x0000000000000000000000000000000000000000',
  MASTER_CHEF: '0x0000000000000000000000000000000000000000',
  MERKLE_DISTRIBUTOR: '0x0000000000000000000000000000000000000000',
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11',
}

// 💻 本地测试网合约地址
const LOCALHOST_CONTRACTS: ContractAddresses = {
  // 🪙 代币合约 (本地部署)
  PLANET_TOKEN: '0x0000000000000000000000000000000000000000',
  WETH: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // 本地WETH
  
  // 🏭 V2 合约 (本地部署)
  PLANET_FACTORY: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  PLANET_ROUTER: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  PLANET_INIT_CODE_HASH: '0xad06924f5ab1bdbe259989ff87d714315c060f93b058490f62f4145a7e6dad0d',
  
  // 🎯 V3 合约 (本地部署)
  PLANET_V3_FACTORY: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  PLANET_V3_ROUTER: '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  
  // 🧠 SmartRouter - 支持V2/V3混合路由 (需要部署)
  PLANET_SMART_ROUTER: '0x0000000000000000000000000000000000000000',
  
  // 🚜 Farm 合约
  MASTER_CHEF: '0x0000000000000000000000000000000000000000',
  
  // 🎁 空投合约
  MERKLE_DISTRIBUTOR: '0x0000000000000000000000000000000000000000',
  
  // 🔧 工具合约
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11', // 标准Multicall3
}

// 🌍 所有链的合约地址映射
export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  // 💻 本地测试网
  [ChainId.LOCALHOST]: LOCALHOST_CONTRACTS,            // 🏠 Hardhat本地网络
  
  // 🎯 当前支持的测试网  
  [ChainId.X_LAYER_TESTNET]: XLAYER_TESTNET_CONTRACTS, // 🔄 主要测试网
  [ChainId.SEPOLIA]: SEPOLIA_CONTRACTS,                // 🚀 备用测试网
  
  // 🔮 未来扩展 (预留)
  [ChainId.BSC]: BSC_CONTRACTS,
  [ChainId.ETHEREUM]: BSC_CONTRACTS, // 临时使用BSC配置作为模板
  [ChainId.BSC_TESTNET]: BSC_CONTRACTS,
  [ChainId.ARBITRUM_ONE]: BSC_CONTRACTS,
  [ChainId.BASE]: BSC_CONTRACTS,
  [ChainId.OPBNB]: BSC_CONTRACTS,
  [ChainId.GOERLI]: BSC_CONTRACTS,
  [ChainId.ARBITRUM_SEPOLIA]: BSC_CONTRACTS,
  [ChainId.BASE_SEPOLIA]: BSC_CONTRACTS,
  [ChainId.OPBNB_TESTNET]: BSC_CONTRACTS,
}

// 🛠️ 工具函数
export function getContractAddresses(chainId: ChainId): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return addresses
}

export function getContractAddress(chainId: ChainId, contract: keyof ContractAddresses): string {
  const addresses = getContractAddresses(chainId)
  const address = addresses[contract]
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn(`Contract ${contract} not deployed on chain ${chainId}`)
    return '0x0000000000000000000000000000000000000000'
  }
  return address
}

// 检查合约是否已部署
export function isContractDeployed(chainId: ChainId, contract: keyof ContractAddresses): boolean {
  const address = getContractAddress(chainId, contract)
  return address !== '0x0000000000000000000000000000000000000000'
}

// 获取所有已部署的合约
export function getDeployedContracts(chainId: ChainId): Partial<ContractAddresses> {
  const addresses = getContractAddresses(chainId)
  return Object.entries(addresses).reduce((acc, [key, value]) => {
    if (value !== '0x0000000000000000000000000000000000000000') {
      acc[key as keyof ContractAddresses] = value
    }
    return acc
  }, {} as Partial<ContractAddresses>)
}