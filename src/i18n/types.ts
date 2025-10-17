export type Language = 'en' | 'zh';

export interface Translations {
  // Common
  connect: string;
  disconnect: string;
  balance: string;
  max: string;
  
  // Swap
  swap: {
    title: string;
    from: string;
    to: string;
    exchangeRate: string;
    priceImpact: string;
    tradingFee: string;
    poolTax: string;
    burnFee: string;
    executeSwap: string;
  };
  
  // Liquidity
  liquidity: {
    createPool: string;
    managePool: string;
    selectPoolType: string;
    selectFeeTier: string;
    setPriceRange: string;
    minPrice: string;
    maxPrice: string;
    tokenPairConfig: string;
    tokenA: string;
    tokenB: string;
    customTaxSettings: string;
    buyTaxRate: string;
    sellTaxRate: string;
    taxDistribution: string;
    standard: string;
    custom: string;
    stablecoin: string;
    standardPair: string;
    highVolatility: string;
    createPoolButton: string;
  };
  
  // Farm
  farm: {
    live: string;
    finished: string;
    stakedOnly: string;
    details: string;
    hide: string;
    apr: string;
    tvl: string;
    dailyRewards: string;
    yourStake: string;
    totalStaked: string;
    pendingRewards: string;
    stake: string;
    unstake: string;
    claim: string;
    unstakeAll: string;
    enterAmount: string;
    lp: string;
    stakeToken: string;
    noPoolsFound: string;
    startStaking: string;
    noPools: string;
  };
  
  // Stats
  stats: {
    loadingData: string;
    tvl: string;
    volume24h: string;
    totalUsers: string;
    sleepingBurned: string;
    activePools: string;
    volumeAndTVL: string;
    liquidityDistribution: string;
    sleepingBurn: string;
    monthlyBurn: string;
    accumulatedBurn: string;
  };
  
  // Navigation
  nav: {
    swap: string;
    liquidity: string;
    farm: string;
    stats: string;
  };
  
  // Alerts
  alerts: {
    underDevelopment: string;
  };
}

