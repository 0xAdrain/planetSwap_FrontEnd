import React from 'react'
import styled from '@emotion/styled'
import { useAllPools } from '../../hooks/pools/useAllPools'
import PoolCard from './PoolCard'
import ContractDebug from '../Debug/ContractDebug'

const Container = styled.div`
  padding: 20px;
  color: white;
`

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`

export default function PoolsListPageWithCard() {
  const { allPools, isLoading, error } = useAllPools()

  if (error) {
    return (
      <Container>
        <h1>Pools List (With Card Test)</h1>
        <p>Error: {error}</p>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container>
        <h1>Pools List (With Card Test)</h1>
        <p>Loading...</p>
      </Container>
    )
  }

  return (
    <Container>
      <ContractDebug />
      
      <h1>Pools List (With Card Test)</h1>
      <p>Found {allPools.length} pools</p>
      
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {isLoading && <p>Loading pools...</p>}
      
      <Grid>
        {allPools.slice(0, 3).map(pool => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </Grid>
    </Container>
  )
}




