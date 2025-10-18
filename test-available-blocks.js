/**
 * 🔍 测试X Layer testnet可访问的区块范围
 * 找到最早可访问的区块，然后调整startBlock
 */

const RPC_URL = 'https://xlayertestrpc.okx.com'

async function testBlockAccess() {
  console.log('🔍 测试X Layer testnet可访问的区块范围')
  
  // 获取当前最新区块
  const currentResponse = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  })
  
  const currentResult = await currentResponse.json()
  const currentBlock = parseInt(currentResult.result, 16)
  console.log(`📊 当前最新区块: ${currentBlock}`)
  
  // 测试不同的历史区块
  const testBlocks = [
    currentBlock - 1000,   // 1000个区块前
    currentBlock - 10000,  // 1万个区块前
    currentBlock - 50000,  // 5万个区块前
    currentBlock - 100000, // 10万个区块前
    12196248,              // 我们的目标startBlock
    12171999               // Graph Node尝试的区块
  ]
  
  console.log('\n🎯 测试区块可访问性:')
  
  for (const blockNum of testBlocks) {
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [`0x${blockNum.toString(16)}`, false],
          id: 1
        })
      })
      
      const result = await response.json()
      
      if (result.error) {
        console.log(`   ❌ 区块 ${blockNum}: ${result.error.message}`)
      } else if (result.result) {
        console.log(`   ✅ 区块 ${blockNum}: 可访问`)
      } else {
        console.log(`   ⚠️ 区块 ${blockNum}: 未知状态`)
      }
    } catch (error) {
      console.log(`   ❌ 区块 ${blockNum}: 网络错误 - ${error.message}`)
    }
    
    // 添加小延迟避免RPC限制
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // 建议新的startBlock
  const recommendedStart = currentBlock - 5000
  console.log(`\n💡 建议解决方案:`)
  console.log(`   - 将startBlock改为: ${recommendedStart} (当前区块-5000)`)
  console.log(`   - 这样可以快速验证subgraph功能`)
  console.log(`   - 虽然不会有真实的createPair数据，但能确认映射函数正常工作`)
}

testBlockAccess().catch(console.error)
