/**
 * 🔍 检查链上真实数据
 * 验证合约是否有真实的交易和事件
 */

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/planetswap/v2-v3'

// 实际合约地址
const V2_FACTORY = '0x5D94f4c717F3D69A837DFC36D91e1a87b8F1aE40'
const V3_FACTORY = '0x7e4Fe502ee78ab7728B00B3bD7fD182a4B17C45F'

// 测试不同的区块范围
const BLOCK_RANGES = [
  { name: 'Original Start', block: 12170578 },
  { name: 'Current Start', block: 12172000 },
  { name: 'Recent Block', block: 12174000 },
  { name: 'Latest', block: 12174886 }
]

// 1. 🎯 测试特定区块的数据
const TEST_SPECIFIC_BLOCKS = `
  query TestBlockData($blockNumber: Int!) {
    _meta(block: { number: $blockNumber }) {
      block {
        number
        hash
        timestamp
      }
    }
    pairs(first: 10, block: { number: $blockNumber }) {
      id
      token0 { symbol }
      token1 { symbol }
      createdAtTimestamp
      createdAtBlockNumber
    }
  }
`

// 2. 📊 查询最新数据但更详细
const DETAILED_CURRENT_DATA = `
  query DetailedCurrentData {
    planetFactory(id: "${V2_FACTORY.toLowerCase()}") {
      id
      pairCount
      totalTransactions
      totalVolumeOKB
    }
    
    pairs(first: 20, orderBy: createdAtTimestamp, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      createdAtTimestamp
      createdAtBlockNumber
      totalTransactions
      reserve0
      reserve1
    }
    
    tokens(first: 20, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
      tradeVolume
      totalTransactions
    }
  }
`

// 3. 🏭 检查Factory状态
const CHECK_FACTORY_STATUS = `
  query CheckFactoryStatus {
    planetFactory(id: "${V2_FACTORY.toLowerCase()}") {
      id
      pairCount
      totalTransactions
      totalVolumeOKB
      totalLiquidityOKB
    }
    
    v3Factory(id: "${V3_FACTORY.toLowerCase()}") {
      id
      poolCount
      totalTransactions
      totalVolumeOKB
      totalFeesOKB
    }
  }
`

// 4. 🔍 搜索任何V2事件
const SEARCH_ANY_V2_EVENTS = `
  query SearchV2Events {
    pairCreateds: planetPairCreateds(first: 10) {
      id
      token0
      token1
      pair
      blockNumber
      timestamp
    }
    
    mints(first: 10) {
      id
      transaction { id }
      pair { id }
      to
      liquidity
      amount0
      amount1
      blockNumber
      timestamp
    }
    
    burns(first: 10) {
      id
      transaction { id }
      pair { id }
      liquidity
      amount0
      amount1
      blockNumber
      timestamp
    }
    
    swaps(first: 10) {
      id
      transaction { id }
      pair { id }
      amount0In
      amount1In
      amount0Out
      amount1Out
      blockNumber
      timestamp
    }
  }
`

async function testQuery(query, variables = {}, description = '') {
  console.log(`\n🧪 ${description}`)
  
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    })

    const result = await response.json()
    
    if (result.errors) {
      console.error('❌ Errors:', result.errors.map(e => e.message))
      return null
    }

    console.log('✅ Success')
    
    // 分析数据
    const data = result.data
    let hasData = false
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === '_meta') return
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          hasData = true
          console.log(`📊 ${key}: ${value.length} items`)
          console.log('   Sample:', JSON.stringify(value[0], null, 2))
        } else {
          console.log(`📭 ${key}: empty`)
        }
      } else if (value && typeof value === 'object') {
        if (Object.keys(value).length > 0) {
          hasData = true
          console.log(`📊 ${key}:`, JSON.stringify(value, null, 2))
        } else {
          console.log(`📭 ${key}: null/empty`)
        }
      }
    })
    
    if (!hasData) {
      console.log('📭 No data found in this query')
    }
    
    return result.data
    
  } catch (error) {
    console.error('❌ Query Failed:', error.message)
    return null
  }
}

async function runDiagnostics() {
  console.log('🔍 开始链上数据诊断')
  console.log('🏭 V2 Factory:', V2_FACTORY)
  console.log('🎨 V3 Factory:', V3_FACTORY)
  
  // 检查Factory状态
  await testQuery(CHECK_FACTORY_STATUS, {}, '检查Factory状态')
  
  // 检查详细当前数据
  await testQuery(DETAILED_CURRENT_DATA, {}, '检查详细当前数据')
  
  // 搜索任何V2事件
  await testQuery(SEARCH_ANY_V2_EVENTS, {}, '搜索任何V2事件')
  
  // 测试不同区块
  for (const range of BLOCK_RANGES) {
    await testQuery(
      TEST_SPECIFIC_BLOCKS, 
      { blockNumber: range.block }, 
      `测试区块 ${range.block} (${range.name})`
    )
  }
  
  console.log('\n🎯 诊断完成!')
  console.log('\n💡 可能的问题:')
  console.log('1. 合约部署后没有实际创建池子')
  console.log('2. startBlock设置在实际交易之后')  
  console.log('3. Subgraph映射函数有问题')
  console.log('4. 事件签名不匹配')
  console.log('\n🔗 建议检查区块浏览器:')
  console.log(`V2 Factory: https://web3.okx.com/explorer/xlayer-test/address/${V2_FACTORY}`)
  console.log(`V3 Factory: https://web3.okx.com/explorer/xlayer-test/address/${V3_FACTORY}`)
}

runDiagnostics().catch(console.error)
