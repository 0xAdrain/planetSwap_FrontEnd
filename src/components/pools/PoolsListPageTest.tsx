import React from 'react'
import styled from '@emotion/styled'
import { useAllPools } from '../../hooks/pools/useAllPools'

const Container = styled.div`
  padding: 20px;
  color: white;
`

export default function PoolsListPageTest() {
  const { allPools, isLoading, error } = useAllPools()

  if (error) {
    return (
      <Container>
        <h1>Pools List (Test Version)</h1>
        <p>Error: {error}</p>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container>
        <h1>Pools List (Test Version)</h1>
        <p>Loading...</p>
      </Container>
    )
  }

  return (
    <Container>
      <h1>Pools List (Test Version)</h1>
      <p>Found {allPools.length} pools</p>
      {allPools.map(pool => (
        <div key={pool.id}>
          {pool.tokenA.symbol}/{pool.tokenB.symbol} - TVL: ${pool.tvlUSD}
        </div>
      ))}
    </Container>
  )
}
