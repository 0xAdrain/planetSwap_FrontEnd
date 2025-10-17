import React, { useEffect, useState } from 'react'
import { useAccount, useChainId, usePublicClient, useReadContract } from 'wagmi'
import { getContractAddresses } from '../../config/chains/contracts'
import { ChainId } from '../../config/chains/chainId'
import { useTokens } from '../../hooks/contracts/useTokens'
import styled from '@emotion/styled'
import PlanetFactoryABI from '../../contracts/abis/PlanetFactory.json'

const DebugContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  margin: 20px;
  border-radius: 12px;
  font-family: monospace;
  font-size: 12px;
`

const Section = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`

const Title = styled.h3`
  color: #22c55e;
  margin: 0 0 8px 0;
  font-size: 14px;
`

const Info = styled.div`
  margin: 4px 0;
`

const Status = styled.span<{ success?: boolean }>`
  color: ${props => props.success ? '#22c55e' : '#ef4444'};
  font-weight: bold;
`

export default function ContractDebug() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { tokens } = useTokens()
  const [contractAddresses, setContractAddresses] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 获取合约地址
  useEffect(() => {
    try {
      const addresses = getContractAddresses(chainId as ChainId)
      setContractAddresses(addresses)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setContractAddresses(null)
    }
  }, [chainId])

  // 测试Factory合约调用
  const { data: factoryData, error: factoryError } = useReadContract({
    address: contractAddresses?.PLANET_FACTORY as `0x${string}`,
    abi: PlanetFactoryABI,
    functionName: 'allPairsLength',
    query: {
      enabled: !!contractAddresses?.PLANET_FACTORY
    }
  })

  return (
    <DebugContainer>
      <Title>🔧 合约连接诊断工具</Title>
      
      <Section>
        <Title>📡 网络连接状态</Title>
        <Info>钱包连接: <Status success={isConnected}>{isConnected ? '已连接' : '未连接'}</Status></Info>
        <Info>当前链ID: <Status success={!!chainId}>{chainId}</Status></Info>
        <Info>用户地址: <Status success={!!address}>{address || '无'}</Status></Info>
        <Info>PublicClient: <Status success={!!publicClient}>{publicClient ? '已连接' : '未连接'}</Status></Info>
      </Section>

      <Section>
        <Title>🏭 合约地址配置</Title>
        {error ? (
          <Info>❌ 错误: <Status>{error}</Status></Info>
        ) : contractAddresses ? (
          <>
            <Info>Factory: <Status success={!!contractAddresses.PLANET_FACTORY}>{contractAddresses.PLANET_FACTORY}</Status></Info>
            <Info>Router: <Status success={!!contractAddresses.PLANET_ROUTER}>{contractAddresses.PLANET_ROUTER}</Status></Info>
            <Info>WETH: <Status success={!!contractAddresses.WETH}>{contractAddresses.WETH}</Status></Info>
          </>
        ) : (
          <Info>🔄 加载中...</Info>
        )}
      </Section>

      <Section>
        <Title>🪙 代币列表</Title>
        <Info>代币数量: <Status success={tokens.length > 0}>{tokens.length}</Status></Info>
        {tokens.slice(0, 3).map(token => (
          <Info key={token.address}>
            {token.symbol}: {token.address}
          </Info>
        ))}
        {tokens.length > 3 && <Info>... 还有 {tokens.length - 3} 个代币</Info>}
      </Section>

      <Section>
        <Title>📞 合约调用测试</Title>
        <Info>Factory调用状态: 
          {factoryError ? (
            <Status>❌ 失败: {factoryError.message}</Status>
          ) : factoryData !== undefined ? (
            <Status success>✅ 成功: {factoryData?.toString()} 个池子</Status>
          ) : (
            <Status>🔄 调用中...</Status>
          )}
        </Info>
      </Section>

      <Section>
        <Title>🏊‍♂️ 诊断建议</Title>
        {!isConnected && <Info>❗ 请先Connect wallet</Info>}
        {isConnected && error && <Info>❗ 当前网络不支持，请切换到 X Layer Testnet</Info>}
        {isConnected && !error && tokens.length === 0 && <Info>❗ 代币列表未加载</Info>}
        {isConnected && !error && tokens.length > 0 && !factoryData && <Info>❗ 合约调用失败，检查合约地址和ABI</Info>}
        {isConnected && !error && tokens.length > 0 && factoryData !== undefined && <Info>✅ 一切正常！</Info>}
      </Section>
    </DebugContainer>
  )
}
