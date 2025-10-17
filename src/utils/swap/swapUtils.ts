import { Address, formatUnits, parseUnits } from 'viem';
import { Token } from '../../hooks/contracts/useTokens';

// 🔄 交易路径类型
export interface SwapRoute {
  path: Address[];
  symbols: string[];
  type: 'direct' | 'multihop';
  hops: number;
}

// 📊 价格影响计算
export interface PriceImpact {
  percentage: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  warning?: string;
}

// 💱 Slippage 设置
export interface SlippageSettings {
  auto: boolean;
  custom: number; // 百分比
  presets: number[]; // 预设值
}

// 🛠️ 格式化价格
export function formatPrice(
  amount: bigint | string, 
  decimals: number, 
  displayDecimals: number = 4
): string {
  try {
    const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
    const formatted = formatUnits(amountBigInt, decimals);
    const number = parseFloat(formatted);
    
    if (number === 0) return '0';
    if (number < Math.pow(10, -displayDecimals)) {
      return `<${Math.pow(10, -displayDecimals)}`;
    }
    
    return number.toFixed(displayDecimals);
  } catch {
    return '0';
  }
}

// 📈 计算价格影响
export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  marketPrice?: number
): PriceImpact {
  try {
    // 如果没有市场价格，暂时返回低影响
    if (!marketPrice) {
      return {
        percentage: '<0.01%',
        level: 'low'
      };
    }

    const input = parseFloat(inputAmount);
    const output = parseFloat(outputAmount);
    const expectedOutput = input * marketPrice;
    
    const impact = Math.abs((output - expectedOutput) / expectedOutput) * 100;
    
    let level: PriceImpact['level'] = 'low';
    let warning: string | undefined;
    
    if (impact < 0.1) {
      level = 'low';
    } else if (impact < 1) {
      level = 'medium';
    } else if (impact < 5) {
      level = 'high';
      warning = 'High price impact';
    } else {
      level = 'critical';
      warning = 'Critical price impact! Consider a smaller amount.';
    }
    
    return {
      percentage: impact < 0.01 ? '<0.01%' : `${impact.toFixed(2)}%`,
      level,
      warning
    };
  } catch {
    return {
      percentage: 'Unknown',
      level: 'medium'
    };
  }
}

// 🛣️ 查找最佳交易路径
export function findBestRoute(
  tokenIn: Token,
  tokenOut: Token,
  availableTokens: Token[]
): SwapRoute[] {
  const routes: SwapRoute[] = [];
  
  // 直接路径
  routes.push({
    path: [tokenIn.address, tokenOut.address],
    symbols: [tokenIn.symbol, tokenOut.symbol],
    type: 'direct',
    hops: 1
  });
  
  // 通过WOKB的路径（如果不是WOKBTrading pair）
  const wokb = availableTokens.find(token => token.symbol === 'WOKB');
  if (wokb && tokenIn.symbol !== 'WOKB' && tokenOut.symbol !== 'WOKB') {
    routes.push({
      path: [tokenIn.address, wokb.address, tokenOut.address],
      symbols: [tokenIn.symbol, 'WOKB', tokenOut.symbol],
      type: 'multihop',
      hops: 2
    });
  }
  
  // 通过稳定币的路径
  const stablecoins = availableTokens.filter(token => 
    ['mUSDT', 'mUSDC', 'mDAI'].includes(token.symbol)
  );
  
  for (const stable of stablecoins) {
    if (stable.symbol !== tokenIn.symbol && stable.symbol !== tokenOut.symbol) {
      routes.push({
        path: [tokenIn.address, stable.address, tokenOut.address],
        symbols: [tokenIn.symbol, stable.symbol, tokenOut.symbol],
        type: 'multihop',
        hops: 2
      });
    }
  }
  
  return routes;
}

// ⏱️ 生成交易截止时间
export function generateDeadline(minutes: number = 20): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60);
}

// 🔢 计算滑点保护金额
export function calculateMinAmountOut(
  expectedAmount: string,
  slippagePercent: number,
  decimals: number
): bigint {
  try {
    const expectedBigInt = parseUnits(expectedAmount, decimals);
    const slippageMultiplier = BigInt(10000 - Math.floor(slippagePercent * 100));
    return expectedBigInt * slippageMultiplier / BigInt(10000);
  } catch {
    return BigInt(0);
  }
}

// 🔢 计算最大输入金额
export function calculateMaxAmountIn(
  expectedAmount: string,
  slippagePercent: number,
  decimals: number
): bigint {
  try {
    const expectedBigInt = parseUnits(expectedAmount, decimals);
    const slippageMultiplier = BigInt(10000 + Math.floor(slippagePercent * 100));
    return expectedBigInt * slippageMultiplier / BigInt(10000);
  } catch {
    return BigInt(0);
  }
}

// 💵 格式化USD价值
export function formatUSDValue(
  amount: string,
  tokenPrice: number,
  decimals: number = 2
): string {
  try {
    const value = parseFloat(amount) * tokenPrice;
    if (value < 0.01) return '<$0.01';
    return `$${value.toFixed(decimals)}`;
  } catch {
    return '$0.00';
  }
}

// 🔄 反转Trading pair
export function reverseSwapPair<T>(tokenA: T, tokenB: T): [T, T] {
  return [tokenB, tokenA];
}

// ⚖️ 验证交易金额
export function validateSwapAmount(
  amount: string,
  token: Token,
  balance?: string
): {
  valid: boolean;
  error?: string;
} {
  if (!amount || amount === '0') {
    return { valid: false, error: 'Enter an amount' };
  }
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (balance) {
    const numBalance = parseFloat(balance);
    if (numAmount > numBalance) {
      return { valid: false, error: `Insufficient ${token.symbol} balance` };
    }
  }
  
  // 检查最小交易量（防止尘额交易）
  const minAmount = Math.pow(10, -(token.decimals - 2)); // 最小为0.01 token
  if (numAmount < minAmount) {
    return { valid: false, error: 'Amount too small' };
  }
  
  return { valid: true };
}

// 📊 默认Slippage settings
export const DEFAULT_SLIPPAGE_SETTINGS: SlippageSettings = {
  auto: true,
  custom: 0.5,
  presets: [0.1, 0.5, 1.0, 3.0]
};

// 🎯 获取推荐滑点
export function getRecommendedSlippage(
  tokenIn: Token,
  tokenOut: Token,
  priceImpact: PriceImpact
): number {
  // 基础滑点
  let baseSlippage = 0.5;
  
  // 根据价格影响调整
  switch (priceImpact.level) {
    case 'low':
      baseSlippage = 0.1;
      break;
    case 'medium':
      baseSlippage = 0.5;
      break;
    case 'high':
      baseSlippage = 1.0;
      break;
    case 'critical':
      baseSlippage = 3.0;
      break;
  }
  
  // 对于某些代币增加额外滑点
  const volatileTokens = ['mMEME']; // 高波动性代币
  if (volatileTokens.includes(tokenIn.symbol) || volatileTokens.includes(tokenOut.symbol)) {
    baseSlippage += 1.0;
  }
  
  return Math.min(baseSlippage, 5.0); // 最大不超过5%
}
