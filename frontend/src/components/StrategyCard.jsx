import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { OG_STORAGE_EXPLORER_URL, BLOCK_EXPLORER_URL } from '../utils/constants';

// 旧 mock URL 会 404，统一跳转到 0G Storage Explorer
function getDaViewUrl(daStorageUrl) {
  if (!daStorageUrl) return null;
  if (daStorageUrl.includes('da.0g.ai/mock') || daStorageUrl.includes('da.0g.ai/')) {
    return OG_STORAGE_EXPLORER_URL;
  }
  return daStorageUrl;
}

export default function StrategyCard({
  strategy,
  onClose,
  isOwner = false,
  onSubmitComputeTask,
  onVerifyResult,
}) {
  const [verifyForm, setVerifyForm] = useState({
    daRoot: '0x' + '00'.repeat(32),
    computeProof: '0x' + '01'.repeat(32),
    totalReturn: 10500,
    sharpeRatio: 150,
    maxDrawdown: 200,
    winRate: 6000,
    tradesCount: 10,
  });
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!strategy) return null;

  const perf = strategy.performance || {};
  const ver = strategy.verification || {};

  const handleSubmitComputeTask = async () => {
    if (!onSubmitComputeTask) return;
    setLoading(true);
    setError('');
    try {
      await onSubmitComputeTask(strategy.id);
    } catch (err) {
      setError(err.reason || err.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResult = async (e) => {
    e.preventDefault();
    if (!onVerifyResult) return;
    setLoading(true);
    setError('');
    try {
      const daRoot = verifyForm.daRoot.startsWith('0x') && verifyForm.daRoot.length === 66
        ? verifyForm.daRoot
        : '0x' + '00'.repeat(32);
      const computeProof = verifyForm.computeProof.startsWith('0x') && verifyForm.computeProof.length === 66
        ? verifyForm.computeProof
        : '0x' + '01'.repeat(32);
      await onVerifyResult(strategy.id, daRoot, computeProof, {
        totalReturn: parseInt(verifyForm.totalReturn, 10) || 10000,
        sharpeRatio: parseInt(verifyForm.sharpeRatio, 10) || 0,
        maxDrawdown: parseInt(verifyForm.maxDrawdown, 10) || 0,
        winRate: parseInt(verifyForm.winRate, 10) || 0,
        tradesCount: Math.max(1, parseInt(verifyForm.tradesCount, 10) || 1),
      });
      setShowVerifyForm(false);
    } catch (err) {
      setError(err.reason || err.message || 'Verify failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold">{strategy.name || 'Unnamed'}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Description</h4>
        <p className="text-gray-300">{strategy.description || 'No description'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Return</div>
          <div
            className={`text-2xl font-bold ${
              (perf.totalReturn ?? 10000) >= 10000 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {(((perf.totalReturn ?? 10000) - 10000) / 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
          <div className="text-2xl font-bold text-blue-400">
            {((perf.sharpeRatio ?? 0) / 10000).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Max Drawdown</div>
          <div className="text-2xl font-bold text-red-400">
            {((perf.maxDrawdown ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-2xl font-bold text-purple-400">
            {((perf.winRate ?? 0) / 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Verification</h4>
        {ver.verified ? (
          <div className="flex items-center gap-2 text-green-400">
            <span>Verified</span>
            <span className="text-gray-400 text-sm">
              {ver.verifiedAt
                ? new Date(ver.verifiedAt * 1000).toLocaleString()
                : ''}
            </span>
          </div>
        ) : (
          <div className="text-yellow-400">Pending verification...</div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {strategy.registrationTxHash && (
          <a
            href={`${BLOCK_EXPLORER_URL}/tx/${strategy.registrationTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
          >
            查看注册交易
          </a>
        )}
        {getDaViewUrl(strategy.daStorageUrl) && (
          <a
            href={getDaViewUrl(strategy.daStorageUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
          >
            View on 0G DA
          </a>
        )}
        {!ver.verified && isOwner && onSubmitComputeTask && (
          <button
            onClick={handleSubmitComputeTask}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded font-semibold transition flex items-center gap-2"
          >
            {loading ? <LoadingSpinner /> : null}
            提交计算任务
          </button>
        )}
        {!ver.verified && onVerifyResult && (
          <button
            onClick={() => setShowVerifyForm(!showVerifyForm)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded font-semibold transition"
          >
            {showVerifyForm ? '收起验证表单' : '验证结果 (Demo)'}
          </button>
        )}
      </div>

      {showVerifyForm && onVerifyResult && (
        <form onSubmit={handleVerifyResult} className="space-y-3 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400">验证结果（Demo 可填模拟值）</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input
              type="text"
              placeholder="daRoot (0x+64hex)"
              value={verifyForm.daRoot}
              onChange={(e) => setVerifyForm((f) => ({ ...f, daRoot: e.target.value }))}
              className="col-span-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              type="text"
              placeholder="computeProof (0x+64hex)"
              value={verifyForm.computeProof}
              onChange={(e) => setVerifyForm((f) => ({ ...f, computeProof: e.target.value }))}
              className="col-span-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              type="number"
              placeholder="totalReturn (10500=+5%)"
              value={verifyForm.totalReturn}
              onChange={(e) => setVerifyForm((f) => ({ ...f, totalReturn: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              type="number"
              placeholder="sharpeRatio"
              value={verifyForm.sharpeRatio}
              onChange={(e) => setVerifyForm((f) => ({ ...f, sharpeRatio: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              type="number"
              placeholder="tradesCount"
              value={verifyForm.tradesCount}
              onChange={(e) => setVerifyForm((f) => ({ ...f, tradesCount: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading || parseInt(verifyForm.tradesCount, 10) < 1}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded font-semibold flex items-center gap-2"
          >
            {loading ? <LoadingSpinner /> : null}
            提交验证
          </button>
        </form>
      )}
    </div>
  );
}
