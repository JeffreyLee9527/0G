// 从环境变量读取
export const CHAIN_ID = parseInt(import.meta.env.VITE_0G_CHAIN_ID || '16602');
export const RPC_URL = import.meta.env.VITE_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';

export const ZERO_G_GALILEO = {
  name: '0G Galileo Testnet',
  chainId: CHAIN_ID,
  chainIdHex: '0x' + CHAIN_ID.toString(16),
  rpcUrls: [RPC_URL],
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai/'],
  faucet: 'https://faucet.0g.ai/',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
};

export const BLOCK_EXPLORER_URL = 'https://chainscan-galileo.0g.ai';

// 0G Storage Explorer - 策略存证查看
export const OG_STORAGE_EXPLORER_URL = 'https://storagescan-galileo.0g.ai/submissions';

export const CONTRACT_ADDRESSES = {
  Arena: import.meta.env.VITE_ARENA_CONTRACT || '',
  StrategyNFT: import.meta.env.VITE_STRATEGY_NFT_CONTRACT || '',
  Ranking: import.meta.env.VITE_RANKING_CONTRACT || '',
};
