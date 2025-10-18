import { useMemo } from 'react'
import { Address } from 'viem'
import { ChainId } from '../../config/chains/chainId'
import { getContractAddresses } from '../../config/chains/contracts'
import { Token } from '../contracts/useTokens'

// 🎯 Route types - 参考PancakeSwap架构
export enum RouteType {
  V2 = 'V2',
  V3 = 'V3',
  MIXED = 'MIXED'
}

// 🔄 Route interface
export interface SwapRoute {
  type: RouteType
  pools: string[]
  path: Address[]
  gasEstimate?: bigint
  expectedOutput?: bigint
}

// 💹 Trade information for router selection
export interface TradeInfo {
  inputToken: Token
  outputToken: Token
  inputAmount: string
  routes?: SwapRoute[]
  routeType?: RouteType
}

/**
 * 🧠 Smart Router Address Selector
 * 参考PancakeSwap的智能Router选择逻辑
 * 
 * 选择策略：
 * - 简单V2直接交易 → 使用V2 Router (省Gas)
 * - V3交易或复杂路径 → 使用Smart Router (最优价格)
 */
export function useRouterAddress(trade?: TradeInfo): Address {
  return useMemo(() => {
    if (!trade) {
      return '0x' as Address
    }

    const chainId = ChainId.X_LAYER_TESTNET // TODO: 从context获取当前chainId
    const contracts = getContractAddresses(chainId)

    // 🎯 智能选择逻辑 - 参考PancakeSwap
    if (shouldUseV2Router(trade)) {
      console.log('🎯 Using V2 Router for simple trade:', trade.inputToken.symbol, '→', trade.outputToken.symbol)
      return contracts.PLANET_ROUTER as Address
    }

    console.log('🧠 Using Smart Router for complex trade:', trade.inputToken.symbol, '→', trade.outputToken.symbol)
    return contracts.PLANET_SMART_ROUTER as Address

  }, [trade])
}

/**
 * 🎯 判断是否使用V2 Router
 * 参考PancakeSwap的选择逻辑
 */
function shouldUseV2Router(trade: TradeInfo): boolean {
  // 如果明确指定了路由类型
  if (trade.routeType) {
    return trade.routeType === RouteType.V2 && isSingleV2Route(trade)
  }

  // 🔍 检查是否为简单V2直接交易
  if (isDirectV2Pair(trade)) {
    return true
  }

  // 默认使用SmartRouter处理复杂情况
  return false
}

/**
 * 🔍 检查是否为单一V2路由
 */
function isSingleV2Route(trade: TradeInfo): boolean {
  if (!trade.routes || trade.routes.length === 0) {
    return false
  }

  // 只有一条路由且为V2类型
  return trade.routes.length === 1 && trade.routes[0].type === RouteType.V2
}

/**
 * 💱 检查是否为直接的V2交易对
 * 简单启发式：如果是常见的代币对，很可能有直接的V2 pair
 */
function isDirectV2Pair(trade: TradeInfo): boolean {
  const { inputToken, outputToken } = trade

  // WOKB相关的直接交易对
  const WOKB_ADDRESS = '0xFCF165C4C8925682aE5facEC596D474eB36CE825'
  
  if (inputToken.address === WOKB_ADDRESS || outputToken.address === WOKB_ADDRESS) {
    return true
  }

  // 主要稳定币之间的交易
  const STABLE_COINS = [
    '0xE196aaADEbAcCE2354Aa414D202E0AB1C907d8B5', // mUSDT
    '0x70b759Ba2ca756fAD20B232De07F583AA5E676FC', // mUSDC
    '0x4Ec24e2da05F7C6fC54C3234137E07d0A8826610'  // mDAI
  ]

  const isInputStable = STABLE_COINS.includes(inputToken.address)
  const isOutputStable = STABLE_COINS.includes(outputToken.address)

  // 稳定币之间的交易可能有直接pair
  if (isInputStable && isOutputStable) {
    return true
  }

  // 默认情况下，假设需要通过WOKB中转，使用SmartRouter优化
  return false
}

/**
 * 🔧 获取Router合约地址的工具函数
 */
export function getRouterAddress(chainId: ChainId, routerType: 'V2' | 'SMART'): Address {
  const contracts = getContractAddresses(chainId)
  
  switch (routerType) {
    case 'V2':
      return contracts.PLANET_ROUTER as Address
    case 'SMART':
      return contracts.PLANET_SMART_ROUTER as Address
    default:
      throw new Error(`Unknown router type: ${routerType}`)
  }
}

/**
 * 📊 Router选择统计 (开发调试用)
 */
export const routerSelectionStats = {
  v2RouterUsage: 0,
  smartRouterUsage: 0,
  
  trackV2Usage() {
    this.v2RouterUsage++
    console.log(`📊 V2 Router usage: ${this.v2RouterUsage}`)
  },
  
  trackSmartRouterUsage() {
    this.smartRouterUsage++
    console.log(`📊 Smart Router usage: ${this.smartRouterUsage}`)
  },
  
  getStats() {
    return {
      v2: this.v2RouterUsage,
      smart: this.smartRouterUsage,
      total: this.v2RouterUsage + this.smartRouterUsage
    }
  }
}
