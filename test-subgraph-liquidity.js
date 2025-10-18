/**
 * 🧪 测试Subgraph流动性数据查询
 * 验证subgraph是否运行正常，数据是否可以查询
 */

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/planetswap/v2-v3'

// 测试用的owner钱包地址（需要根据实际情况修改）
const OWNER_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // 默认Hardhat账户0

// 1. 🔍 测试基础Schema查询
const TEST_SCHEMA = `
  query TestSchema {
    _meta {
      block {
        number
        hash
        timestamp
      }
      deployment
      hasIndexingErrors
    }
  }
`

// 2. 📊 测试V2基础数据
const TEST_V2_DATA = `
  query TestV2Data {
    pairs(first: 5) {
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
      reserve0
      reserve1
      totalSupply
      totalTransactions
    }
    
    tokens(first: 10) {
      id
      symbol
      name
      totalLiquidity
      tradeVolume
    }
  }
`

// 3. 🏊‍♂️ 测试用户流动性 - 完整用户数据
const TEST_USER_LIQUIDITY = `
  query TestUserLiquidity($userAddress: String!) {
    user(id: $userAddress) {
      id
      liquidityPositions {
        id
        liquidityTokenBalance
        pair {
          id
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          reserve0
          reserve1
          totalSupply
        }
      }
    }
  }
`

// 4. 🎨 测试V3数据
const TEST_V3_DATA = `
  query TestV3Data {
    v3Pools(first: 5) {
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
      feeTier
      liquidity
      sqrtPrice
    }
    
    v3Positions(first: 5) {
      id
      owner
      tokenId
      pool {
        id
        token0 { symbol }
        token1 { symbol }
      }
      liquidity
    }
  }
`

// 5. 🔍 查找所有用户（调试用）
const FIND_ALL_USERS = `
  query FindAllUsers {
    users(first: 10) {
      id
      liquidityPositions {
        id
        liquidityTokenBalance
        pair {
          id
          token0 { symbol }
          token1 { symbol }
        }
      }
    }
  }
`

async function testGraphQLQuery(query, variables = {}, description = '') {
  console.log(`\n🧪 ${description}`)
  console.log('📝 Query:', query.trim().split('\n')[1].trim())
  
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors)
      return null
    }

    console.log('✅ Query Success')
    console.log('📊 Data:', JSON.stringify(result.data, null, 2))
    return result.data
    
  } catch (error) {
    console.error('❌ Query Failed:', error.message)
    return null
  }
}

async function runAllTests() {
  console.log('🚀 开始测试PlanetSwap Subgraph')
  console.log('🔗 Subgraph URL:', SUBGRAPH_URL)
  console.log('👤 测试用户地址:', OWNER_ADDRESS)
  
  // 测试1: Schema和基础信息
  await testGraphQLQuery(TEST_SCHEMA, {}, '测试Schema和Meta信息')
  
  // 测试2: V2基础数据
  await testGraphQLQuery(TEST_V2_DATA, {}, '测试V2池子和代币数据')
  
  // 测试3: 查找所有用户
  await testGraphQLQuery(FIND_ALL_USERS, {}, '查找所有用户（调试）')
  
  // 测试4: 特定用户流动性
  await testGraphQLQuery(
    TEST_USER_LIQUIDITY, 
    { userAddress: OWNER_ADDRESS.toLowerCase() }, 
    `测试用户流动性 (${OWNER_ADDRESS})`
  )
  
  // 测试5: V3数据
  await testGraphQLQuery(TEST_V3_DATA, {}, '测试V3池子和持仓数据')
  
  console.log('\n🎯 测试完成!')
  console.log('\n💡 如果看到数据为空:')
  console.log('1. 检查subgraph是否完全同步')
  console.log('2. 检查合约地址是否正确')
  console.log('3. 检查startBlock是否设置正确')
  console.log('4. 检查是否有实际的流动性交易')
}

// 运行测试
runAllTests().catch(console.error)
