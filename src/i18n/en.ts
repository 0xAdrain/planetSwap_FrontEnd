import { Translations } from './types';

export const en: Translations = {
  // Common
  connect: 'Connect Wallet',
  disconnect: 'Disconnect',
  balance: 'Balance',
  max: 'MAX',
  
  // Swap
  swap: {
    title: 'Token Swap',
    from: 'From',
    to: 'To',
    balance: 'Balance',
    exchangeRate: 'Exchange Rate',
    priceImpact: 'Price Impact',
    tradingFee: 'Trading Fee',
    poolTax: 'Pool Tax',
    burnFee: 'Burn Fee',
    executeSwap: 'Execute Swap',
    enterAmount: 'Enter an amount',
    fetchingPrice: 'Fetching Best Price',
    swapButton: 'Swap',
    details: 'Details',
    show: 'Show',
    hide: 'Hide',
    slippageTolerance: 'Slippage tolerance',
    minimumReceive: 'Minimum receive',
    networkFee: 'Network Fee',
    route: 'Route',
    edit: 'Edit',
    tokenSwap: 'Token Swap',
  },
  
  // Liquidity
  liquidity: {
    createPool: 'Create Pool',
    managePool: 'Manage Pool',
    selectPoolType: 'Select Pool Type',
    selectFeeTier: 'Select Fee Tier',
    setPriceRange: 'Set Price Range (V3 Only)',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    tokenPairConfig: 'Token Pair Configuration',
    tokenA: 'Token A',
    tokenB: 'Token B',
    customTaxSettings: 'Custom Tax Settings',
    buyTaxRate: 'Buy Tax Rate',
    sellTaxRate: 'Sell Tax Rate',
    taxDistribution: 'Tax Distribution Mechanism',
    standard: 'STANDARD',
    custom: 'CUSTOM',
    stablecoin: 'Stablecoin',
    standardPair: 'Standard',
    highVolatility: 'High Volatility',
    createPoolButton: 'Create Pool',
  },
  
  // Farm
  farm: {
    live: 'Live',
    finished: 'Finished',
    stakedOnly: 'Staked Only',
    details: 'Details',
    hide: 'Hide',
    apr: 'APR',
    tvl: 'TVL',
    dailyRewards: 'Daily Rewards',
    yourStake: 'Your Stake',
    totalStaked: 'Total Staked',
    pendingRewards: 'Pending Rewards',
    stake: 'Stake',
    unstake: 'Unstake',
    claim: 'Claim',
    unstakeAll: 'Unstake All & Claim Rewards',
    enterAmount: 'Enter amount',
    lp: 'LP',
    stakeToken: 'STAKE',
    noPoolsFound: 'No staked pools found. Start staking to see your positions here.',
    startStaking: 'Start staking to see your positions here.',
    noPools: 'No pools available.',
  },
  
  // Stats
  stats: {
    loadingData: 'Loading Analytical Data...',
    tvl: 'Total Value Locked (TVL)',
    volume24h: '24h Volume',
    totalUsers: 'Total Users',
    sleepingBurned: 'Total SLEEPING Burned',
    activePools: 'Active Pools',
    volumeAndTVL: 'Volume & TVL',
    liquidityDistribution: 'Liquidity Distribution',
    sleepingBurn: 'SLEEPING Token Burn',
    monthlyBurn: 'Monthly Burn',
    accumulatedBurn: 'Accumulated Burn',
  },
  
  // Navigation
  nav: {
    swap: 'Swap',
    liquidity: 'Liquidity',
    farm: 'Farm',
    stats: 'Stats',
  },
  
  // Alerts
  alerts: {
    underDevelopment: 'This feature is under development. Currently for demonstration purposes only.',
  },
};

