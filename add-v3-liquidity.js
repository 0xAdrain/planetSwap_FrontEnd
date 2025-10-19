/**
 * 🏊‍♂️ 为V3池子添加流动性
 * 基于V2池子的价格比例和流动性规模
 */

const { createWalletClient, createPublicClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// 配置 - Owner钱包私钥 (直接使用正确的私钥)
// Owner地址: 0x169C5b4a3b829006294AAf381B3B94143948069F  
const PRIVATE_KEY = '0xfed6cce7a2ac5152b71e8f3c9e5d823b31e816a2c51baaae3ace3d6d839ce268';
const RPC_URL = 'https://testrpc.xlayer.tech/terigon';

// X Layer Testnet 配置
const chain = {
  id: 1952,
  name: 'X Layer Testnet',
  network: 'xlayer-testnet',
  nativeCurrency: { decimals: 18, name: 'OKB', symbol: 'OKB' },
  rpcUrls: { default: { http: [RPC_URL] } },
};

const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

// 合约地址
const contracts = {
  V2_FACTORY: '0x5D94f4c717F3D69A837DFC36D91e1a87b8F1aE40',
  V3_FACTORY: '0x7e4Fe502ee78ab7728B00B3bD7fD182a4B17C45F',
  SMART_ROUTER: '0xDD7776497095CE5B9d6aF2487dB2194555B2E801',
  POOL_DEPLOYER: '0xF9df8Fce74325c5A546d45f0C646E02830582d31', // 作为Position Manager
};

// 代币配置
const TOKENS = {
  mWOKB: { address: '0xFCF165C4C8925682aE5facEC596D474eB36CE825', decimals: 18, symbol: 'mWOKB' },
  mUSDT: { address: '0xE196aaADEbAcCE2354Aa414D202E0AB1C907d8B5', decimals: 6, symbol: 'mUSDT' },
  mUSDC: { address: '0x70b759Ba2ca756fAD20B232De07F583AA5E676FC', decimals: 6, symbol: 'mUSDC' },
  mETH: { address: '0xb16637fA04A286C0EE2874935970cdA0b595e16a', decimals: 18, symbol: 'mETH' }
};

// V3 池子地址 (从之前创建的结果)
const V3_POOLS = {
  'mWOKB-mUSDT': '0x2947C79dc86987879713f035d295Df2548f66f36',
  'mWOKB-mUSDC': '0xa84fda6b4a76C18Ab8Ada0390ca5234f938c4A23',
  'mWOKB-mETH': '0xBEDe0B7926Ea0a8Ff3FAEBD15134Fa1381E024C3'
};

// ABI 定义
const V2_FACTORY_ABI = [
  { "inputs": [{"name": "tokenA", "type": "address"}, {"name": "tokenB", "type": "address"}], "name": "getPair", "outputs": [{"name": "", "type": "address"}], "type": "function" }
];

const V2_PAIR_ABI = [
  { "inputs": [], "name": "getReserves", "outputs": [{"name": "reserve0", "type": "uint112"}, {"name": "reserve1", "type": "uint112"}, {"name": "blockTimestampLast", "type": "uint32"}], "type": "function" },
  { "inputs": [], "name": "token0", "outputs": [{"name": "", "type": "address"}], "type": "function" }
];

const V3_POOL_ABI = [
  { "inputs": [], "name": "slot0", "outputs": [{"name": "sqrtPriceX96", "type": "uint160"}, {"name": "tick", "type": "int24"}, {"name": "observationIndex", "type": "uint16"}, {"name": "observationCardinality", "type": "uint16"}, {"name": "observationCardinalityNext", "type": "uint16"}, {"name": "feeProtocol", "type": "uint8"}, {"name": "unlocked", "type": "bool"}], "type": "function" },
  { "inputs": [{"name": "sqrtPriceX96", "type": "uint160"}], "name": "initialize", "outputs": [], "type": "function" },
  { "inputs": [], "name": "token0", "outputs": [{"name": "", "type": "address"}], "type": "function" },
  { "inputs": [], "name": "token1", "outputs": [{"name": "", "type": "address"}], "type": "function" }
];

const ERC20_ABI = [
  { "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function" },
  { "inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "type": "function" }
];

// 简化的Smart Router ABI (用于添加流动性)
const SMART_ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"name": "token0", "type": "address"},
          {"name": "token1", "type": "address"},
          {"name": "fee", "type": "uint24"},
          {"name": "tickLower", "type": "int24"},
          {"name": "tickUpper", "type": "int24"},
          {"name": "amount0Desired", "type": "uint256"},
          {"name": "amount1Desired", "type": "uint256"},
          {"name": "amount0Min", "type": "uint256"},
          {"name": "amount1Min", "type": "uint256"},
          {"name": "recipient", "type": "address"},
          {"name": "deadline", "type": "uint256"}
        ],
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "liquidity", "type": "uint128"},
      {"name": "amount0", "type": "uint256"},
      {"name": "amount1", "type": "uint256"}
    ],
    "type": "function"
  }
];

// 获取V2价格信息
async function getV2Price(tokenA, tokenB) {
  try {
    console.log(`📊 获取 ${tokenA.symbol}-${tokenB.symbol} V2价格...`);
    
    const pairAddress = await publicClient.readContract({
      address: contracts.V2_FACTORY,
      abi: V2_FACTORY_ABI,
      functionName: 'getPair',
      args: [tokenA.address, tokenB.address]
    });
    
    if (pairAddress === '0x0000000000000000000000000000000000000000') {
      console.log(`   ❌ V2池子不存在`);
      return null;
    }
    
    const [reserves, token0Address] = await Promise.all([
      publicClient.readContract({ address: pairAddress, abi: V2_PAIR_ABI, functionName: 'getReserves' }),
      publicClient.readContract({ address: pairAddress, abi: V2_PAIR_ABI, functionName: 'token0' })
    ]);
    
    const [reserve0, reserve1] = reserves;
    const isTokenAFirst = tokenA.address.toLowerCase() === token0Address.toLowerCase();
    
    const reserveA = isTokenAFirst ? reserve0 : reserve1;
    const reserveB = isTokenAFirst ? reserve1 : reserve0;
    
    const amountA = Number(formatUnits(reserveA, tokenA.decimals));
    const amountB = Number(formatUnits(reserveB, tokenB.decimals));
    
    const price = amountB / amountA;
    
    console.log(`   ✅ 储备: ${amountA.toFixed(4)} ${tokenA.symbol} + ${amountB.toFixed(4)} ${tokenB.symbol}`);
    console.log(`   💰 价格: 1 ${tokenA.symbol} = ${price.toFixed(6)} ${tokenB.symbol}`);
    
    return { amountA, amountB, price, pairAddress };
  } catch (error) {
    console.log(`   ❌ 获取V2价格失败: ${error.message}`);
    return null;
  }
}

// 计算V3的sqrtPriceX96
function calculateSqrtPriceX96(price, decimalsA, decimalsB) {
  // price = tokenB/tokenA，需要调整小数位
  const decimalAdjustedPrice = price * Math.pow(10, decimalsA - decimalsB);
  const sqrtPrice = Math.sqrt(decimalAdjustedPrice);
  const sqrtPriceX96 = sqrtPrice * Math.pow(2, 96);
  
  return BigInt(Math.floor(sqrtPriceX96));
}

// 检查V3池子是否已初始化
async function isPoolInitialized(poolAddress) {
  try {
    const slot0 = await publicClient.readContract({
      address: poolAddress,
      abi: V3_POOL_ABI,
      functionName: 'slot0'
    });
    
    const [sqrtPriceX96] = slot0;
    return sqrtPriceX96 > 0n;
  } catch (error) {
    return false;
  }
}

// 初始化V3池子
async function initializePool(poolAddress, sqrtPriceX96, walletClient) {
  console.log(`   🔧 初始化池子价格: ${sqrtPriceX96.toString()}`);
  
  try {
    const hash = await walletClient.writeContract({
      address: poolAddress,
      abi: V3_POOL_ABI,
      functionName: 'initialize',
      args: [sqrtPriceX96]
    });
    
    console.log(`   ⏳ 初始化交易: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`   ✅ 池子初始化成功`);
      return true;
    } else {
      console.log(`   ❌ 池子初始化失败`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 初始化失败: ${error.message}`);
    return false;
  }
}

// 为V3池子添加流动性
async function addLiquidityToV3Pool(poolInfo, walletClient, publicClient, account) {
  const { tokenA, tokenB, poolAddress, price } = poolInfo;
  
  console.log(`\n💰 为 ${tokenA.symbol}-${tokenB.symbol} 池子添加流动性...`);
  console.log(`   池子地址: ${poolAddress}`);
  
  try {
    // 1. 检查池子是否已初始化
    const initialized = await isPoolInitialized(poolAddress);
    if (!initialized) {
      console.log(`   🔧 池子未初始化，正在初始化...`);
      const sqrtPriceX96 = calculateSqrtPriceX96(price, tokenA.decimals, tokenB.decimals);
      const initSuccess = await initializePool(poolAddress, sqrtPriceX96, walletClient);
      if (!initSuccess) return false;
    } else {
      console.log(`   ✅ 池子已初始化`);
    }
    
    // 2. 计算流动性数量 (基于V2池子规模的10%)
    const liquidityScale = 0.1; // 10%的V2流动性规模
    const amount0Desired = parseUnits((poolInfo.v2AmountA * liquidityScale).toFixed(tokenA.decimals), tokenA.decimals);
    const amount1Desired = parseUnits((poolInfo.v2AmountB * liquidityScale).toFixed(tokenB.decimals), tokenB.decimals);
    
    console.log(`   💰 计划添加: ${formatUnits(amount0Desired, tokenA.decimals)} ${tokenA.symbol} + ${formatUnits(amount1Desired, tokenB.decimals)} ${tokenB.symbol}`);
    
    // 3. 检查代币余额
    const [balance0, balance1] = await Promise.all([
      publicClient.readContract({ address: tokenA.address, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] }),
      publicClient.readContract({ address: tokenB.address, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] })
    ]);
    
    console.log(`   💳 当前余额: ${formatUnits(balance0, tokenA.decimals)} ${tokenA.symbol}, ${formatUnits(balance1, tokenB.decimals)} ${tokenB.symbol}`);
    
    if (balance0 < amount0Desired || balance1 < amount1Desired) {
      console.log(`   ⚠️ 余额不足，跳过该池子`);
      return false;
    }
    
    // 4. 授权代币 (如果需要)
    console.log(`   🔐 检查代币授权...`);
    
    // 这里简化处理，实际需要检查当前授权额度
    const approvalAmount = parseUnits('1000000', tokenA.decimals); // 大额授权
    
    try {
      const approve0Hash = await walletClient.writeContract({
        address: tokenA.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contracts.SMART_ROUTER, approvalAmount]
      });
      console.log(`   ✅ ${tokenA.symbol} 授权: ${approve0Hash}`);
      
      const approve1Hash = await walletClient.writeContract({
        address: tokenB.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contracts.SMART_ROUTER, approvalAmount]
      });
      console.log(`   ✅ ${tokenB.symbol} 授权: ${approve1Hash}`);
      
      // 等待授权确认
      await Promise.all([
        publicClient.waitForTransactionReceipt({ hash: approve0Hash }),
        publicClient.waitForTransactionReceipt({ hash: approve1Hash })
      ]);
      
    } catch (error) {
      console.log(`   ⚠️ 授权可能已存在: ${error.message}`);
    }
    
    // 5. 添加流动性 (使用全价格范围)
    console.log(`   🏊‍♂️ 添加流动性...`);
    
    // 全价格范围的tick
    const tickLower = -887272; // 最小tick
    const tickUpper = 887272;  // 最大tick
    
    const mintParams = {
      token0: tokenA.address,
      token1: tokenB.address,
      fee: 3000, // 0.3%
      tickLower,
      tickUpper,
      amount0Desired,
      amount1Desired,
      amount0Min: amount0Desired * 95n / 100n, // 5% slippage
      amount1Min: amount1Desired * 95n / 100n,
      recipient: account.address,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 1800) // 30分钟
    };
    
    // 实际执行V3流动性添加
    console.log(`   📋 Mint参数:`, {
      token0: mintParams.token0,
      token1: mintParams.token1, 
      fee: mintParams.fee,
      tickRange: `${mintParams.tickLower} to ${mintParams.tickUpper}`,
      amount0Desired: formatUnits(mintParams.amount0Desired, tokenA.decimals),
      amount1Desired: formatUnits(mintParams.amount1Desired, tokenB.decimals)
    });
    
    try {
      // 直接使用Smart Router添加V3流动性 (我们的部署方案)
      console.log(`   🧠 使用Smart Router添加V3流动性...`);
      
      const routerTx = await walletClient.writeContract({
        address: contracts.SMART_ROUTER, // 0xDD7776497095CE5B9d6aF2487dB2194555B2E801
        abi: [{
          "inputs": [
            {"name": "params", "type": "tuple", "components": [
              {"name": "token0", "type": "address"},
              {"name": "token1", "type": "address"}, 
              {"name": "fee", "type": "uint24"},
              {"name": "tickLower", "type": "int24"},
              {"name": "tickUpper", "type": "int24"},
              {"name": "amount0Desired", "type": "uint256"},
              {"name": "amount1Desired", "type": "uint256"},
              {"name": "amount0Min", "type": "uint256"},
              {"name": "amount1Min", "type": "uint256"},
              {"name": "recipient", "type": "address"},
              {"name": "deadline", "type": "uint256"}
            ]}
          ],
          "name": "addLiquidity",
          "outputs": [
            {"name": "tokenId", "type": "uint256"},
            {"name": "liquidity", "type": "uint128"},
            {"name": "amount0", "type": "uint256"},
            {"name": "amount1", "type": "uint256"}
          ],
          "type": "function"
        }],
        functionName: 'addLiquidity',
        args: [mintParams],
        gas: 2000000n
      });
      
      console.log(`   ✅ 流动性添加交易: ${routerTx}`);
      
      // 等待交易确认
      console.log(`   ⏳ 等待交易确认...`);
      await publicClient.waitForTransactionReceipt({ hash: routerTx });
      
      console.log(`   🎉 V3流动性添加成功！`);
      return true;
      
    } catch (routerError) {
      console.log(`   ❌ Smart Router V3流动性添加失败: ${routerError.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ 添加流动性失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 开始为V3池子添加流动性...\n');
  
  const account = privateKeyToAccount(PRIVATE_KEY);
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(RPC_URL)
  });
  
  const publicClient = createPublicClient({
    chain,
    transport: http(RPC_URL)
  });
  
  console.log(`👤 脚本账户: ${account.address}`);
  console.log(`🎯 目标Owner: 0x169C5b4a3b829006294AAf381B3B94143948069F`);
  console.log(`⚠️  注意: 余额检查使用Owner地址，交易使用脚本账户\n`);
  
  // 获取V2价格信息
  const pairs = [
    [TOKENS.mWOKB, TOKENS.mUSDT, 'mWOKB-mUSDT'],
    [TOKENS.mWOKB, TOKENS.mUSDC, 'mWOKB-mUSDC'],
    [TOKENS.mWOKB, TOKENS.mETH, 'mWOKB-mETH']
  ];
  
  const poolsToProcess = [];
  
  for (const [tokenA, tokenB, poolKey] of pairs) {
    const v2Info = await getV2Price(tokenA, tokenB);
    if (v2Info) {
      poolsToProcess.push({
        tokenA,
        tokenB,
        poolAddress: V3_POOLS[poolKey],
        price: v2Info.price,
        v2AmountA: v2Info.amountA,
        v2AmountB: v2Info.amountB
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📋 准备处理 ${poolsToProcess.length} 个V3池子\n`);
  
  // 处理每个池子
  let successCount = 0;
  for (const poolInfo of poolsToProcess) {
    const success = await addLiquidityToV3Pool(poolInfo, walletClient, publicClient, account);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 总结
  console.log('\n' + '='.repeat(80));
  console.log('🎉 V3流动性添加完成');
  console.log('='.repeat(80));
  
  console.log(`\n📊 结果: ${successCount}/${poolsToProcess.length} 个池子处理成功`);
  
  if (successCount > 0) {
    console.log('\n🎯 下一步测试建议:');
    console.log('1. 🧠 前端测试Smart Router多跳路由');
    console.log('2. 🔄 验证V2/V3智能切换');
    console.log('3. 💰 比较V2和V3的价格差异');
    
    console.log('\n💡 重要提醒:');
    console.log('- V3流动性可能需要通过专用的Position Manager合约');
    console.log('- 建议先测试Smart Router是否能检测到V3池子');
    console.log('- 可以手动通过前端添加少量V3流动性进行测试');
  }
}

main().catch(console.error);





