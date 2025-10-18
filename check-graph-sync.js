/**
 * 🔍 检查Graph Node同步状态
 * 查看当前同步到哪个区块，确认是否已经处理createPair交易
 */

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/planetswap/v2-v3'

// 检查Meta信息和同步状态
const CHECK_SYNC_STATUS = `
  query CheckSyncStatus {
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

async function checkSyncStatus() {
  console.log('🔍 检查Graph Node同步状态')
  console.log('📊 预期要处理的区块:')
  console.log('   - createPair交易区块: 12196249, 12196254, 12196259, 12197295')
  console.log('   - startBlock设置: 12196248')
  
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CHECK_SYNC_STATUS
      })
    })

    const result = await response.json()
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors)
      return
    }

    const meta = result.data?._meta
    if (!meta) {
      console.error('❌ 无法获取Meta信息')
      return
    }

    console.log('\n📊 Graph Node同步状态:')
    console.log(`   - 当前同步区块: ${meta.block.number}`)
    console.log(`   - 区块哈希: ${meta.block.hash}`)
    console.log(`   - 时间戳: ${meta.block.timestamp}`)
    console.log(`   - 部署ID: ${meta.deployment}`)
    console.log(`   - 索引错误: ${meta.hasIndexingErrors}`)
    
    // 分析同步状态
    const currentBlock = parseInt(meta.block.number)
    const targetBlocks = [12196249, 12196254, 12196259, 12197295]
    const startBlock = 12196248
    
    console.log('\n🎯 同步状态分析:')
    console.log(`   - startBlock (${startBlock}): ${currentBlock >= startBlock ? '✅ 已达到' : '❌ 未达到'}`)
    
    for (const targetBlock of targetBlocks) {
      const status = currentBlock >= targetBlock ? '✅ 已处理' : '❌ 未处理'
      console.log(`   - createPair区块 ${targetBlock}: ${status}`)
    }
    
    if (currentBlock >= Math.max(...targetBlocks)) {
      console.log('\n🎉 所有createPair交易区块都已同步！')
      console.log('💡 如果还没有数据，问题可能在映射函数或事件处理')
    } else {
      console.log('\n⏳ 还需要等待同步更多区块')
      console.log(`📈 还需同步: ${Math.max(...targetBlocks) - currentBlock} 个区块`)
    }
    
  } catch (error) {
    console.error('❌ 检查同步状态失败:', error.message)
  }
}

checkSyncStatus().catch(console.error)
