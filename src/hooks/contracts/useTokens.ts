import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useBalance, useChainId } from 'wagmi';
import { Address, formatUnits, parseUnits } from 'viem';
import { getCurrentContracts } from '../../lib/wagmi';
import { getTokenListForChain, Token } from '../../config/tokens';

export type { Token } from '../../config/tokens';
import ERC20ABI from '../../contracts/abis/ERC20.json';

// 🔧 useTokens Hook - Multi-chain support
export function useTokens() {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const [baseTokens, setBaseTokens] = useState<Token[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Dynamically load token list for current network
  useEffect(() => {
    console.log('🔍 Token Debug - Chain ID:', chainId);
    const networkTokens = getTokenListForChain(chainId as any);
    console.log('🪙 Token List for Chain', chainId, ':', networkTokens.length, 'tokens');
    console.log('📋 Tokens:', networkTokens.map(t => ({ symbol: t.symbol, address: t.address })));
    setBaseTokens(networkTokens);
    setTokens(networkTokens); // Immediately set tokens so components can see token list
  }, [chainId]);

  // 🌟 Get native token balance (dynamic chain ID)
  const { data: nativeBalance, isLoading: isLoadingNative } = useBalance({
    address: userAddress,
    chainId: chainId, // 🎯 Use current chain ID
    query: {
      enabled: isConnected && !!userAddress,
      refetchInterval: 10000,
    }
  });

  // 📊 Batch read ERC20 token balances (excluding native token)
  const erc20Tokens = baseTokens.filter(token => token.address !== '0x0000000000000000000000000000000000000000');
  const { data: balancesData, isLoading: isLoadingBalances } = useReadContracts({
    contracts: erc20Tokens.map(token => ({
      address: token.address,
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })),
    query: {
      enabled: isConnected && !!userAddress && erc20Tokens.length > 0,
      refetchInterval: 10000, // Refresh balance every 10 seconds
    }
  });

  // 🔄 Update token balances
  useEffect(() => {
    // Only update balances when baseTokens is not empty
    if (baseTokens.length === 0) {
      console.log('⏳ Waiting for token list to load...');
      return;
    }

    // 🐛 Debug information
    console.log('🔍 Balance Update Effect:', {
      userAddress,
      isConnected,
      baseTokensCount: baseTokens.length,
      nativeBalance: nativeBalance ? {
        value: nativeBalance.value.toString(),
        decimals: nativeBalance.decimals,
        symbol: nativeBalance.symbol,
        formatted: nativeBalance.formatted
      } : null,
      isLoadingNative,
      balancesDataLength: balancesData?.length || 0,
      erc20TokensCount: erc20Tokens.length
    });

    const updatedTokens = baseTokens.map((token, tokenIndex) => {
      // 🌟 Handle native OKB
      if (token.isNative || token.address === '0x0000000000000000000000000000000000000000') {
        if (nativeBalance) {
          console.log('✅ Native Balance Found:', nativeBalance.formatted, nativeBalance.symbol);
          return {
            ...token,
            balance: nativeBalance.value.toString(),
            balanceFormatted: formatUnits(nativeBalance.value, token.decimals),
          };
        } else {
          console.log('❌ No Native Balance');
        }
        return {
          ...token,
          balance: '0',
          balanceFormatted: '0',
        };
      }
      
      // 📊 Handle ERC20 tokens
      const erc20Index = erc20Tokens.findIndex(t => t.address === token.address);
      if (erc20Index >= 0 && balancesData && balancesData[erc20Index]) {
        const balanceResult = balancesData[erc20Index];
        if (balanceResult?.status === 'success') {
          const balance = balanceResult.result as bigint;
          return {
            ...token,
            balance: balance.toString(),
            balanceFormatted: formatUnits(balance, token.decimals),
          };
        }
      }
      
      return {
        ...token,
        balance: '0',
        balanceFormatted: '0',
      };
    });
    
    setTokens(updatedTokens);
  }, [baseTokens, balancesData, isLoadingBalances, nativeBalance, isLoadingNative]);

  // 🔍 Find token by symbol
  const findTokenBySymbol = (symbol: string): Token | undefined => {
    return tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
  };

  // 🔍 Find token by address
  const findTokenByAddress = (address: Address): Token | undefined => {
    return tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
  };

  // 💰 Get token balance
  const getTokenBalance = (tokenSymbol: string): string => {
    const token = findTokenBySymbol(tokenSymbol);
    return token?.balanceFormatted || '0';
  };

  // ⚖️ Check if balance is sufficient
  const hasEnoughBalance = (tokenSymbol: string, amount: string): boolean => {
    const token = findTokenBySymbol(tokenSymbol);
    if (!token || !amount) return false;
    
    try {
      const amountBigInt = parseUnits(amount, token.decimals);
      const balanceBigInt = BigInt(token.balance || '0');
      return balanceBigInt >= amountBigInt;
    } catch {
      return false;
    }
  };

  // 🔄 Refresh token list
  const refreshTokens = async () => {
    setIsLoading(true);
    // 这里可以添加从链上或API获取最新代币列表的逻辑
    setTimeout(() => setIsLoading(false), 1000);
  };

  return {
    tokens,
    isLoading: isLoading || isLoadingBalances || isLoadingNative,
    findTokenBySymbol,
    findTokenByAddress,
    getTokenBalance,
    hasEnoughBalance,
    refreshTokens,
  };
}

// 🔧 useTokenAllowance Hook - Check token allowance
export function useTokenAllowance(tokenAddress: Address, spenderAddress: Address) {
  const { address: userAddress } = useAccount();

  const { data: allowance, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [userAddress, spenderAddress],
    query: {
      enabled: !!userAddress && !!tokenAddress && !!spenderAddress,
    }
  });

  // 🔍 Check if approval is needed
  const needsApproval = (amount: string, decimals: number): boolean => {
    if (!allowance || !amount) return true;
    
    try {
      const amountBigInt = parseUnits(amount, decimals);
      const allowanceBigInt = allowance as bigint;
      return allowanceBigInt < amountBigInt;
    } catch {
      return true;
    }
  };

  return {
    allowance: allowance as bigint,
    isLoading,
    needsApproval,
    refetch,
  };
}

// 🔧 useTokenInfo Hook - Get single token information
export function useTokenInfo(tokenAddress: Address) {
  const { data: tokenInfo, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'symbol',
      },
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'decimals',
      },
    ],
    query: {
      enabled: !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    }
  });

  if (!tokenInfo || isLoading) {
    return { token: null, isLoading };
  }

  const [nameResult, symbolResult, decimalsResult] = tokenInfo;
  
  if (nameResult?.status === 'success' && symbolResult?.status === 'success' && decimalsResult?.status === 'success') {
    const token: Token = {
      address: tokenAddress,
      name: nameResult.result as string,
      symbol: symbolResult.result as string,
      decimals: decimalsResult.result as number,
    };
    return { token, isLoading: false };
  }

  return { token: null, isLoading: false };
}




