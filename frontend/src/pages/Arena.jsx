import { useEffect, useState, useCallback } from 'react';
import { useContract } from '../hooks/useContract';
import { useWeb3 } from '../hooks/useWeb3';
import RankingList from '../components/RankingList';
import StrategyCard from '../components/StrategyCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Arena() {
  const { account } = useWeb3();
  const { arena, getTopStrategies, getStrategy, getRegistrationTxHash, submitComputeTask, verifyResult } = useContract();
  const [topStrategies, setTopStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStrategies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const strategies = await getTopStrategies(10);
      setTopStrategies(strategies || []);
    } catch (err) {
      console.error('Failed to load strategies:', err);
      setError(err.message || 'Failed to load strategies');
      setTopStrategies([]);
    } finally {
      setLoading(false);
    }
  }, [getTopStrategies]);

  useEffect(() => {
    if (arena) {
      loadStrategies();
    } else {
      setLoading(false);
      setTopStrategies([]);
    }
  }, [arena, loadStrategies]);

  const handleStrategyClick = async (strategyId) => {
    try {
      const [strategy, registrationTxHash] = await Promise.all([
        getStrategy(strategyId),
        getRegistrationTxHash(strategyId),
      ]);
      setSelectedStrategy({ ...strategy, registrationTxHash });
    } catch (err) {
      console.error('Failed to load strategy:', err);
    }
  };

  const isOwner = Boolean(
    account && selectedStrategy && account.toLowerCase() === selectedStrategy.owner?.toLowerCase()
  );

  const handleSubmitComputeTask = useCallback(
    async (strategyId) => {
      await submitComputeTask(strategyId, '{}');
      await loadStrategies();
      if (selectedStrategy?.id === strategyId) {
        const [s, txHash] = await Promise.all([getStrategy(strategyId), getRegistrationTxHash(strategyId)]);
        setSelectedStrategy({ ...s, registrationTxHash: txHash });
      }
    },
    [submitComputeTask, loadStrategies, getStrategy, getRegistrationTxHash, selectedStrategy?.id]
  );

  const handleVerifyResult = useCallback(
    async (strategyId, daRoot, computeProof, performance) => {
      await verifyResult(strategyId, daRoot, computeProof, performance);
      await loadStrategies();
      if (selectedStrategy?.id === strategyId) {
        const [s, txHash] = await Promise.all([getStrategy(strategyId), getRegistrationTxHash(strategyId)]);
        setSelectedStrategy({ ...s, registrationTxHash: txHash });
      }
    },
    [verifyResult, loadStrategies, getStrategy, getRegistrationTxHash, selectedStrategy?.id]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-2">AI Trading Arena</h2>
        <p className="text-gray-400">
          Verifiable strategies, transparent results, on-chain rankings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-400">{topStrategies.length}</div>
          <div className="text-gray-400">Active Strategies</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400">0G</div>
          <div className="text-gray-400">0G Galileo</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-400">Verifiable</div>
          <div className="text-gray-400">Chain-Verified</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Top Strategies</h3>
          <button
            onClick={loadStrategies}
            disabled={loading || !arena}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded"
          >
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        <RankingList
          strategies={topStrategies}
          onStrategyClick={handleStrategyClick}
        />
      </div>

      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <StrategyCard
              strategy={selectedStrategy}
              onClose={() => setSelectedStrategy(null)}
              isOwner={isOwner}
              onSubmitComputeTask={handleSubmitComputeTask}
              onVerifyResult={handleVerifyResult}
            />
          </div>
        </div>
      )}
    </div>
  );
}
