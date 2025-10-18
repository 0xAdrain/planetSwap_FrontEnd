/**
 * 🎯 使用正确Schema字段的测试
 * 基于实际schema.graphql的字段名称
 */

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/planetswap/v2-v3'

// 合约地址 
const V2_FACTORY = '0x5D94f4c717F3D69A837DFC36D91e1a87b8F1aE40'
const V3_FACTORY = '0x7e4Fe502ee78ab7728B00B3bD7fD182a4B17C45F'

// 1. ✅ 正确的Factory查询
const CORRECT_FACTORY_QUERY = `
  query CorrectFactoryQuery {
    planetFactory(id: "${V2_FACTORY.toLowerCase()}") {
      id
      totalPairs
      totalTransactions
      totalVolumeOKB
      totalVolumeUSD
      totalLiquidityOKB
      totalLiquidityUSD
    }
  }
`

// 2. ✅ 正确的V2 Pairs查询
const CORRECT_V2_PAIRS_QUERY = `
  query CorrectV2PairsQuery {
    pairs(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      name
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
      totalTransactions
      block
      timestamp
      volumeUSD
      reserveUSD
    }
  }
`

// 3. ✅ 正确的用户流动性查询
const CORRECT_USER_LIQUIDITY_QUERY = `
  query CorrectUserLiquidityQuery($userAddress: String!) {
    user(id: $userAddress) {
      id
      liquidityPositions {
        id
        liquidityTokenBalance
        pair {
          id
          name
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

// 4. ✅ 正确的Tokens查询
const CORRECT_TOKENS_QUERY = `
  query CorrectTokensQuery {
    tokens(first: 10, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      decimals
      totalSupply
      tradeVolume
      tradeVolumeUSD
      totalTransactions
      totalLiquidity
      derivedOKB
      derivedUSD
    }
  }
`

// 5. ✅ 正确的交易事件查询  
const CORRECT_EVENTS_QUERY = `
  query CorrectEventsQuery {
    mints(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      transaction { id }
      pair { 
        id
        token0 { symbol }
        token1 { symbol }
      }
      to
      liquidity
      amount0
      amount1
      timestamp
    }
    
    burns(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      transaction { id }
      pair {
        id
        token0 { symbol }
        token1 { symbol }
      }
      liquidity
      amount0
      amount1
      timestamp
    }
    
    swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      transaction { id }
      pair {
        id
        token0 { symbol }
        token1 { symbol }
      }
      amount0In
      amount1In
      amount0Out
      amount1Out
      timestamp
    }
  }
`

// 6. ✅ 查找所有用户（调试）
const FIND_ALL_USERS_QUERY = `
  query FindAllUsersQuery {
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

async function testCorrectQuery(query, variables = {}, description = '') {
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
    
    // 分析结果
    const data = result.data
    let foundData = false
    
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          foundData = true
          console.log(`📊 ${key}: ${value.length} items`)
          if (value.length <= 3) {
            // 如果数据少，显示全部
            console.log(JSON.stringify(value, null, 2))
          } else {
            // 如果数据多，只显示第一个
            console.log('   Sample:', JSON.stringify(value[0], null, 2))
          }
        } else {
          console.log(`📭 ${key}: empty array`)
        }
      } else if (value && typeof value === 'object') {
        if (Object.keys(value).length > 0) {
          foundData = true
          console.log(`📊 ${key}:`, JSON.stringify(value, null, 2))
        } else {
          console.log(`📭 ${key}: null/empty object`)
        }
      } else if (value === null) {
        console.log(`📭 ${key}: null`)
      }
    })
    
    if (!foundData) {
      console.log('📭 No data found')
    }
    
    return result.data
    
  } catch (error) {
    console.error('❌ Query Failed:', error.message)
    return null
  }
}

async function runCorrectTests() {
  console.log('🎯 使用正确Schema进行测试')
  console.log('🔗 Subgraph URL:', SUBGRAPH_URL)
  console.log('🏭 V2 Factory:', V2_FACTORY)
  
  // 测试Factory状态
  await testCorrectQuery(CORRECT_FACTORY_QUERY, {}, '测试Factory状态 (正确字段)')
  
  // 测试V2 Pairs
  await testCorrectQuery(CORRECT_V2_PAIRS_QUERY, {}, '测试V2 Pairs (正确字段)')
  
  // 测试Tokens
  await testCorrectQuery(CORRECT_TOKENS_QUERY, {}, '测试Tokens (正确字段)')
  
  // 查找所有用户 
  await testCorrectQuery(FIND_ALL_USERS_QUERY, {}, '查找所有用户 (调试)')
  
  // 测试事件
  await testCorrectQuery(CORRECT_EVENTS_QUERY, {}, '测试交易事件 (正确字段)')
  
  // 测试特定用户
  const testUsers = [
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // Hardhat账户0
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // Hardhat账户1  
    '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'  // Hardhat账户2
  ]
  
  for (const userAddress of testUsers) {
    await testCorrectQuery(
      CORRECT_USER_LIQUIDITY_QUERY, 
      { userAddress: userAddress.toLowerCase() }, 
      `测试用户流动性: ${userAddress.slice(0,8)}...`
    )
  }
  
  console.log('\n🎉 测试完成!')
  console.log('\n💡 如果仍然没有数据，问题可能是:')
  console.log('1. 🏭 合约部署后没有创建任何池子')  
  console.log('2. 📅 startBlock设置在实际交易之后')
  console.log('3. 🔧 事件处理函数有问题')
  console.log('4. 🌐 网络配置不匹配')
}

runCorrectTests().catch(console.error)
