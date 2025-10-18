/**
 * 🔍 检查X Layer Testnet当前最新区块
 * 确认我们的startBlock是否超过了网络当前高度
 */

const RPC_URL = 'https://xlayertestrpc.okx.com'

async function checkCurrentBlock() {
  console.log('🔍 检查X Layer Testnet当前区块高度')
  
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })

    const result = await response.json()
    
    if (result.error) {
      console.error('❌ RPC Error:', result.error)
      return
    }

    const currentBlockHex = result.result
    const currentBlock = parseInt(currentBlockHex, 16)
    
    console.log('\n📊 区块高度分析:')
    console.log(`   - 网络当前最新区块: ${currentBlock}`)
    console.log(`   - Graph Node同步区块: 12171999`)
    console.log(`   - 我们的startBlock: 12196248`)
    console.log(`   - createPair交易区块: 12196249, 12196254, 12196259, 12197295`)
    
    console.log('\n🎯 状态分析:')
    if (currentBlock >= 12196248) {
      console.log('✅ 网络已达到我们的startBlock，Graph Node应该能同步到')
      if (currentBlock >= 12197295) {
        console.log('✅ 网络已包含所有createPair交易')
      } else {
        console.log('⚠️ 网络还未包含所有createPair交易')
      }
    } else {
      console.log('❌ 网络还未达到我们的startBlock！')
      console.log(`💡 建议：将startBlock改为 ${currentBlock - 100} 以下`)
    }
    
    const graphGap = 12196248 - 12171999
    const networkGap = currentBlock - 12171999
    console.log(`\n📈 同步差距:`)
    console.log(`   - Graph Node需要同步: ${graphGap} 个区块到达startBlock`)
    console.log(`   - 网络总共有: ${networkGap} 个区块可同步`)
    
  } catch (error) {
    console.error('❌ 检查区块高度失败:', error.message)
  }
}

checkCurrentBlock().catch(console.error)
