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
  feeTier?: number  // V3 specific: fee tier (100, 500, 3000, 10000)
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
    console.log('🔍 [ROUTER ADDRESS] useRouterAddress called:', {
      hasTrade: !!trade,
      trade: trade ? {
        inputToken: trade.inputToken.symbol,
        outputToken: trade.outputToken.symbol,
        routeType: trade.routeType
      } : null
    })

    if (!trade) {
      console.log('❌ No trade provided, returning empty address')
      return '0x' as Address
    }

    const chainId = ChainId.X_LAYER_TESTNET // TODO: 从context获取当前chainId
    const contracts = getContractAddresses(chainId)

    console.log('🔍 Contract addresses:', {
      V2_ROUTER: contracts.PLANET_ROUTER,
      SMART_ROUTER: contracts.PLANET_SMART_ROUTER
    })

    // 🎯 智能选择逻辑 - 参考PancakeSwap
    const useV2 = shouldUseV2Router(trade)
    console.log('🔍 Router selection result:', { useV2 })
    
    if (useV2) {
      console.log('🎯 Using V2 Router for simple trade:', trade.inputToken.symbol, '→', trade.outputToken.symbol)
      return contracts.PLANET_ROUTER as Address
    }

    // 🛡️ 安全检查：Smart Router是否已部署
    if (!contracts.PLANET_SMART_ROUTER || contracts.PLANET_SMART_ROUTER === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ Smart Router not deployed, falling back to V2 Router')
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
  console.log('🔍 [ROUTER SELECTION] shouldUseV2Router called:', {
    inputToken: trade.inputToken.symbol,
    outputToken: trade.outputToken.symbol,
    routeType: trade.routeType,
    hasRoutes: !!trade.routes,
    routesLength: trade.routes?.length
  })

  // 🔍 检查是否明确指定了V2路由并且有有效路由
  if (trade.routeType === RouteType.V2 && isSingleV2Route(trade)) {
    console.log('✅ Using V2 Router: Explicit V2 route type')
    return true
  }

  // 🔍 检查是否为简单V2直接交易，但要排除可能没有流动性的稳定币对
  const isDirectPair = isDirectV2Pair(trade)
  console.log('🔍 isDirectV2Pair result:', isDirectPair)
  
  // 🚨 特殊处理：mDAI可能流动性不足，优先用Smart Router
  if (trade.inputToken.symbol === 'mDAI' || trade.outputToken.symbol === 'mDAI') {
    console.log('⚠️ mDAI detected, forcing Smart Router due to potential liquidity issues')
    return false
  }
  
  if (isDirectPair) {
    console.log('✅ Using V2 Router: Direct V2 pair detected')
    return true
  }

  // 🧠 复杂路径使用Smart Router
  console.log('🧠 Using Smart Router: Complex routing needed')
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

  console.log('🔍 [DIRECT PAIR CHECK]', {
    inputToken: inputToken.symbol,
    outputToken: outputToken.symbol,
    inputAddress: inputToken.address,
    outputAddress: outputToken.address
  })

  // WOKB相关的直接交易对
  const WOKB_ADDRESS = '0xFCF165C4C8925682aE5facEC596D474eB36CE825'
  
  const hasWOKB = inputToken.address === WOKB_ADDRESS || outputToken.address === WOKB_ADDRESS
  console.log('🔍 WOKB pair check:', { hasWOKB, WOKB_ADDRESS })
  
  if (hasWOKB) {
    console.log('✅ Direct V2 pair: WOKB involved')
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
  
  console.log('🔍 Stable coins check:', { isInputStable, isOutputStable, STABLE_COINS })

  // 稳定币之间的交易可能有直接pair
  if (isInputStable && isOutputStable) {
    console.log('✅ Direct V2 pair: Stable-to-stable')
    return true
  }

  // 默认情况下，假设需要通过WOKB中转，使用SmartRouter优化
  console.log('❌ Not a direct V2 pair, needs Smart Router')
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
  feeTier?: number  // V3 specific: fee tier (100, 500, 3000, 10000)
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
    console.log('🔍 [ROUTER ADDRESS] useRouterAddress called:', {
      hasTrade: !!trade,
      trade: trade ? {
        inputToken: trade.inputToken.symbol,
        outputToken: trade.outputToken.symbol,
        routeType: trade.routeType
      } : null
    })

    if (!trade) {
      console.log('❌ No trade provided, returning empty address')
      return '0x' as Address
    }

    const chainId = ChainId.X_LAYER_TESTNET // TODO: 从context获取当前chainId
    const contracts = getContractAddresses(chainId)

    console.log('🔍 Contract addresses:', {
      V2_ROUTER: contracts.PLANET_ROUTER,
      SMART_ROUTER: contracts.PLANET_SMART_ROUTER
    })

    // 🎯 智能选择逻辑 - 参考PancakeSwap
    const useV2 = shouldUseV2Router(trade)
    console.log('🔍 Router selection result:', { useV2 })
    
    if (useV2) {
      console.log('🎯 Using V2 Router for simple trade:', trade.inputToken.symbol, '→', trade.outputToken.symbol)
      return contracts.PLANET_ROUTER as Address
    }

    // 🛡️ 安全检查：Smart Router是否已部署
    if (!contracts.PLANET_SMART_ROUTER || contracts.PLANET_SMART_ROUTER === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ Smart Router not deployed, falling back to V2 Router')
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
  console.log('🔍 [ROUTER SELECTION] shouldUseV2Router called:', {
    inputToken: trade.inputToken.symbol,
    outputToken: trade.outputToken.symbol,
    routeType: trade.routeType,
    hasRoutes: !!trade.routes,
    routesLength: trade.routes?.length
  })

  // 🔍 检查是否明确指定了V2路由并且有有效路由
  if (trade.routeType === RouteType.V2 && isSingleV2Route(trade)) {
    console.log('✅ Using V2 Router: Explicit V2 route type')
    return true
  }

  // 🔍 检查是否为简单V2直接交易，但要排除可能没有流动性的稳定币对
  const isDirectPair = isDirectV2Pair(trade)
  console.log('🔍 isDirectV2Pair result:', isDirectPair)
  
  // 🚨 特殊处理：mDAI可能流动性不足，优先用Smart Router
  if (trade.inputToken.symbol === 'mDAI' || trade.outputToken.symbol === 'mDAI') {
    console.log('⚠️ mDAI detected, forcing Smart Router due to potential liquidity issues')
    return false
  }
  
  if (isDirectPair) {
    console.log('✅ Using V2 Router: Direct V2 pair detected')
    return true
  }

  // 🧠 复杂路径使用Smart Router
  console.log('🧠 Using Smart Router: Complex routing needed')
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

  console.log('🔍 [DIRECT PAIR CHECK]', {
    inputToken: inputToken.symbol,
    outputToken: outputToken.symbol,
    inputAddress: inputToken.address,
    outputAddress: outputToken.address
  })

  // WOKB相关的直接交易对
  const WOKB_ADDRESS = '0xFCF165C4C8925682aE5facEC596D474eB36CE825'
  
  const hasWOKB = inputToken.address === WOKB_ADDRESS || outputToken.address === WOKB_ADDRESS
  console.log('🔍 WOKB pair check:', { hasWOKB, WOKB_ADDRESS })
  
  if (hasWOKB) {
    console.log('✅ Direct V2 pair: WOKB involved')
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
  
  console.log('🔍 Stable coins check:', { isInputStable, isOutputStable, STABLE_COINS })

  // 稳定币之间的交易可能有直接pair
  if (isInputStable && isOutputStable) {
    console.log('✅ Direct V2 pair: Stable-to-stable')
    return true
  }

  // 默认情况下，假设需要通过WOKB中转，使用SmartRouter优化
  console.log('❌ Not a direct V2 pair, needs Smart Router')
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



