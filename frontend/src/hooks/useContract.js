import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import ArenaABI from '../contracts/Arena.json';
import { CONTRACT_ADDRESSES } from '../utils/constants';

export function useContract() {
  const { provider, signer } = useWeb3();
  const [arena, setArena] = useState(null);
  const [arenaSigner, setArenaSigner] = useState(null);

  useEffect(() => {
    if (provider && CONTRACT_ADDRESSES.Arena && CONTRACT_ADDRESSES.Arena.startsWith('0x')) {
      const arenaContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Arena,
        ArenaABI.abi,
        provider
      );
      setArena(arenaContract);

      if (signer) {
        const arenaWithSigner = new ethers.Contract(
          CONTRACT_ADDRESSES.Arena,
          ArenaABI.abi,
          signer
        );
        setArenaSigner(arenaWithSigner);
      } else {
        setArenaSigner(null);
      }
    } else {
      setArena(null);
      setArenaSigner(null);
    }
  }, [provider, signer]);

  const registerStrategy = useCallback(
    async (params) => {
      if (!arenaSigner) throw new Error('请先连接钱包');
      if (!CONTRACT_ADDRESSES.Arena) throw new Error('Arena contract not configured');

      const tx = await arenaSigner.registerStrategy(
        params.name,
        params.description,
        params.codeHash,
        params.daStorageUrl,
        { value: ethers.utils.parseEther('0.01') }
      );

      const receipt = await tx.wait();
      const txHash = receipt && receipt.transactionHash ? receipt.transactionHash : null;
      let strategyId = null;
      try {
        const event = receipt.events?.find((e) => e.event === 'StrategyRegistered');
        if (event && event.args) {
          strategyId = event.args.strategyId?.toNumber ? event.args.strategyId.toNumber() : Number(event.args.strategyId || 0);
        } else if (receipt.logs && receipt.logs.length > 0) {
          const iface = new ethers.utils.Interface(ArenaABI.abi);
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog(log);
              if (parsed && parsed.name === 'StrategyRegistered' && parsed.args) {
                strategyId = parsed.args.strategyId?.toNumber ? parsed.args.strategyId.toNumber() : Number(parsed.args.strategyId || 0);
                break;
              }
            } catch {
              // skip
            }
          }
        }
      } catch {
        // parsing failed, but tx succeeded - still return txHash
      }
      return { strategyId: strategyId || null, txHash };
    },
    [arenaSigner]
  );

  const getTopStrategies = useCallback(
    async (n = 10) => {
      if (!arena) return [];

      const count = await arena.strategyCount();
      const strategyIds = [];
      for (let i = 1; i <= count.toNumber() && strategyIds.length < n * 2; i++) {
        strategyIds.push(i);
      }

      const strategiesWithPerf = await Promise.all(
        strategyIds.map(async (id) => {
          try {
            const [strategy, performance] = await Promise.all([
              arena.getStrategy(id),
              arena.getPerformance(id),
            ]);
            return {
              id: strategy.id.toNumber(),
              tokenId: strategy.tokenId.toNumber(),
              owner: strategy.owner,
              name: strategy.name,
              description: strategy.description,
              totalReturn: performance.totalReturn.toNumber(),
              sharpeRatio: performance.sharpeRatio.toNumber(),
              tradesCount: performance.tradesCount.toNumber(),
              lastUpdated: performance.lastUpdated.toNumber(),
            };
          } catch {
            return null;
          }
        })
      );

      const valid = strategiesWithPerf.filter(Boolean);
      valid.sort((a, b) => (b.totalReturn || 0) - (a.totalReturn || 0));
      return valid.slice(0, n);
    },
    [arena]
  );

  const getRegistrationTxHash = useCallback(
    async (strategyId) => {
      if (!arena) return null;
      try {
        const filter = arena.filters.StrategyRegistered(strategyId);
        const events = await arena.queryFilter(filter, 0, 'latest');
        if (events.length > 0 && events[0].transactionHash) {
          return events[0].transactionHash;
        }
      } catch (err) {
        console.warn('getRegistrationTxHash failed:', err);
      }
      return null;
    },
    [arena]
  );

  const getStrategy = useCallback(
    async (strategyId) => {
      if (!arena) throw new Error('Arena contract not loaded');

      const [strategy, performance, verification] = await Promise.all([
        arena.getStrategy(strategyId),
        arena.getPerformance(strategyId),
        arena.getVerification(strategyId),
      ]);

      return {
        id: strategy.id.toNumber(),
        tokenId: strategy.tokenId.toNumber(),
        owner: strategy.owner,
        name: strategy.name,
        description: strategy.description,
        codeHash: strategy.codeHash,
        daStorageUrl: strategy.daStorageUrl,
        createdAt: strategy.createdAt.toNumber(),
        performance: {
          totalReturn: performance.totalReturn.toNumber(),
          sharpeRatio: performance.sharpeRatio.toNumber(),
          maxDrawdown: performance.maxDrawdown.toNumber(),
          winRate: performance.winRate.toNumber(),
          tradesCount: performance.tradesCount.toNumber(),
          lastUpdated: performance.lastUpdated.toNumber(),
        },
        verification: {
          verified: verification.verified,
          verifiedAt: verification.verifiedAt.toNumber(),
        },
      };
    },
    [arena]
  );

  const getRegistrationFee = useCallback(async () => {
    if (!arena) return null;
    return await arena.registrationFee();
  }, [arena]);

  const submitComputeTask = useCallback(
    async (strategyId, computeInput = '{}') => {
      if (!arenaSigner) throw new Error('请先连接钱包');
      const tx = await arenaSigner.submitComputeTask(strategyId, computeInput);
      await tx.wait();
      return tx.hash;
    },
    [arenaSigner]
  );

  const verifyResult = useCallback(
    async (strategyId, daRoot, computeProof, performance) => {
      if (!arenaSigner) throw new Error('请先连接钱包');
      const perf = {
        totalReturn: performance.totalReturn ?? 10000,
        sharpeRatio: performance.sharpeRatio ?? 0,
        maxDrawdown: performance.maxDrawdown ?? 0,
        winRate: performance.winRate ?? 0,
        tradesCount: performance.tradesCount ?? 1,
        lastUpdated: Math.floor(Date.now() / 1000),
      };
      const tx = await arenaSigner.verifyResult(strategyId, daRoot, computeProof, perf);
      await tx.wait();
      return tx.hash;
    },
    [arenaSigner]
  );

  return {
    arena,
    arenaSigner,
    registerStrategy,
    getTopStrategies,
    getStrategy,
    getRegistrationTxHash,
    getRegistrationFee,
    submitComputeTask,
    verifyResult,
  };
}
