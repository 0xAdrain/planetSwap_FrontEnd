/**
 * 🔍 检查Graph Node同步进度和创建V2池子的预估时间
 */

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/planetswap/v2-v3'
const RPC_URL = 'https://xlayertestrpc.okx.com'

async function checkSyncProgress() {
  console.log('🔍 检查Graph Node同步进度')
  
  try {
    // 获取Graph Node当前同步状态
    const graphResponse = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            _meta {
              block {
                number
                timestamp
              }
              deployment
            }
          }
        `
      })
    })
    
    const graphResult = await graphResponse.json()
    const graphBlock = parseInt(graphResult.data._meta.block.number)
    
    // 获取网络当前最新区块
    const rpcResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })
    
    const rpcResult = await rpcResponse.json()
    const networkBlock = parseInt(rpcResult.result, 16)
    
    console.log('\n📊 当前同步状态:')
    console.log(`   - Graph Node同步区块: ${graphBlock}`)
    console.log(`   - 网络最新区块: ${networkBlock}`)
    console.log(`   - 同步差距: ${networkBlock - graphBlock} 个区块`)
    
    // 估算同步速度（基于观察，大约每秒10-50个区块）
    const averageSpeed = 25 // 每秒同步25个区块（保守估计）
    const blocksToSync = networkBlock - graphBlock
    const estimatedSeconds = Math.ceil(blocksToSync / averageSpeed)
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60)
    
    console.log('\n⏱️ 时间估算:')
    console.log(`   - 预计同步时间: ${estimatedMinutes} 分钟 (${estimatedSeconds} 秒)`)
    
    if (blocksToSync <= 10) {
      console.log('\n🎉 Graph Node已接近最新状态!')
      console.log('💡 如果你现在创建V2池子，大约1-2分钟内就能在subgraph中看到数据')
    } else if (blocksToSync <= 100) {
      console.log('\n⚡ Graph Node接近最新状态')
      console.log(`💡 如果你现在创建V2池子，大约${estimatedMinutes + 2}分钟内能在subgraph中看到数据`)
    } else {
      console.log('\n⏳ Graph Node还需要一些时间同步')
      console.log(`💡 建议等${estimatedMinutes}分钟后再创建V2池子，或者创建后等待${estimatedMinutes + 3}分钟查看数据`)
    }
    
    // 提供实时创建建议
    console.log('\n🚀 如果现在立即创建V2池子:')
    console.log(`   1. 交易会在区块 ~${networkBlock + 1} 被打包`)
    console.log(`   2. Graph Node需要同步 ${(networkBlock + 1) - graphBlock} 个区块`)
    console.log(`   3. 预计 ${Math.ceil(((networkBlock + 1) - graphBlock) / averageSpeed / 60)} 分钟后能在subgraph查到数据`)
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  }
}

checkSyncProgress().catch(console.error)
