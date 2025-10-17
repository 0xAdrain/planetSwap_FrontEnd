import { Translations } from './types';

export const zh: Translations = {
  // Common
  connect: 'Connect wallet',
  disconnect: '断开连接',
  balance: '余额',
  max: '最大',
  
  // Swap
  swap: {
    title: '代币交换',
    from: '从',
    to: '到',
    balance: '余额',
    exchangeRate: '汇率',
    priceImpact: '价格影响',
    tradingFee: '交易费用',
    poolTax: '流动池税率',
    burnFee: '燃烧费用',
    executeSwap: '执行交换',
    enterAmount: '请输入数量',
    fetchingPrice: '获取最佳价格中',
    swapButton: '交换',
    details: '详情',
    show: '显示',
    hide: '隐藏',
    slippageTolerance: '滑点容差',
    minimumReceive: '最少收到',
    networkFee: '网络费用',
    route: '路由',
    edit: '编辑',
    tokenSwap: '代币交换',
  },
  
  // Liquidity
  liquidity: {
    createPool: '创建流动池',
    managePool: '管理流动池',
    selectPoolType: '选择池子类型',
    selectFeeTier: '选择费率等级',
    setPriceRange: '设置价格区间 (V3 专用)',
    minPrice: '最低价格',
    maxPrice: '最高价格',
    tokenPairConfig: '代币对配置',
    tokenA: '代币 A',
    tokenB: '代币 B',
    customTaxSettings: '自定义税率设置',
    buyTaxRate: '买入税率',
    sellTaxRate: '卖出税率',
    taxDistribution: '税率分配机制',
    standard: '标准池',
    custom: '特色池',
    stablecoin: '稳定币对',
    standardPair: '标准Trading pair',
    highVolatility: '高波动性',
    createPoolButton: '创建流动池',
  },
  
  // Farm
  farm: {
    live: '进行中',
    finished: '已结束',
    stakedOnly: '仅已质押',
    details: '详情',
    hide: '隐藏',
    apr: '年化收益',
    tvl: '总锁仓',
    dailyRewards: '每日奖励',
    yourStake: '你的质押',
    totalStaked: '总质押量',
    pendingRewards: '待领取奖励',
    stake: '质押',
    unstake: '解质押',
    claim: '领取',
    unstakeAll: '解质押全部 & 领取奖励',
    enterAmount: '输入数量',
    lp: 'LP',
    stakeToken: '质押',
    noPoolsFound: '未找到已质押的池子。开始质押以查看您的持仓。',
    startStaking: '开始质押以查看您的持仓。',
    noPools: '暂无可用池子。',
  },
  
  // Stats
  stats: {
    loadingData: '加载分析数据中...',
    tvl: '总锁定价值 (TVL)',
    volume24h: '24小时交易量',
    totalUsers: '总用户数',
    sleepingBurned: 'SLEEPING 燃烧总量',
    activePools: '活跃流动池',
    volumeAndTVL: '交易量 & TVL',
    liquidityDistribution: '流动性分布',
    sleepingBurn: 'SLEEPING 代币燃烧',
    monthlyBurn: '月度燃烧',
    accumulatedBurn: '累计燃烧',
  },
  
  // Navigation
  nav: {
    swap: '交换',
    liquidity: '流动性',
    farm: '农场',
    stats: '统计',
  },
  
  // Alerts
  alerts: {
    underDevelopment: '此功能正在开发中。当前仅用于演示目的。',
  },
};

