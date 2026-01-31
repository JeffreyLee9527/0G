import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useZeroG } from '../hooks/useZeroG';
import { useWeb3 } from '../hooks/useWeb3';
import LoadingSpinner from '../components/LoadingSpinner';
import { SAMPLE_STRATEGIES } from '../data/sampleStrategies';
import { BLOCK_EXPLORER_URL } from '../utils/constants';

const REGISTER_SUCCESS_KEY = 'deai-register-success';

const loadPersistedResult = () => {
  try {
    const raw = sessionStorage.getItem(REGISTER_SUCCESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.txHash && Date.now() - (data._ts || 0) < 300000) {
      return { strategyId: data.strategyId, daUrl: data.daUrl, txHash: data.txHash };
    }
  } catch {
    // ignore
  }
  return null;
};

export default function Register() {
  const { isConnected } = useWeb3();
  const { registerStrategy } = useContract();
  const { uploadToDA, computeCodeHash } = useZeroG();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(loadPersistedResult);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const fillSample = () => {
    const sample = SAMPLE_STRATEGIES[0];
    setFormData({
      name: sample.name,
      description: sample.description,
      code: sample.code,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const name = formData.name.trim();
    const description = formData.description.trim();
    const code = formData.code.trim();
    if (!name || !description || !code) {
      setError('请填写完整：名称、描述、代码均不能为空');
      setLoading(false);
      return;
    }

    try {
      // 1. MVP: 使用 mock DA - 上传到模拟 DA
      const daResult = await uploadToDA({
        name,
        code,
        metadata: { description },
      });

      // 2. 计算代码哈希
      const codeHash = computeCodeHash(code);

      // 3. 注册策略到合约（将唤起 MetaMask 确认交易）
      const { strategyId, txHash } = await registerStrategy({
        name,
        description,
        codeHash,
        daStorageUrl: daResult.url,
      });

      const successData = {
        strategyId,
        daUrl: daResult.url,
        txHash,
        _ts: Date.now(),
      };
      setResult(successData);
      try {
        sessionStorage.setItem(REGISTER_SUCCESS_KEY, JSON.stringify(successData));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.reason || err.message || 'Registration failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Register Your AI Strategy</h2>

      {!isConnected && (
        <div className="mb-6 p-4 bg-amber-900/30 border border-amber-600 rounded-lg text-amber-200">
          <strong>请先连接钱包</strong> — 点击顶部「Connect Wallet」连接 MetaMask，并确保已切换到 0G Galileo 网络。
        </div>
      )}

      {result ? (
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">注册成功</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Strategy ID:</strong> {result.strategyId ?? '—'}</p>
            <p>
              <strong>DA Storage URL:</strong>{' '}
              <span className="text-gray-400">（MVP 演示用模拟地址，非真实存储）</span>
              <br />
              <span className="text-gray-500">{result.daUrl}</span>
            </p>
            {result.txHash && (
              <p>
                <strong>Tx Hash:</strong>{' '}
                <a
                  href={`${BLOCK_EXPLORER_URL}/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                </a>
                <span className="text-gray-400 ml-1">（点击在区块浏览器查看）</span>
              </p>
            )}
          </div>
          <p className="mt-3 text-gray-400 text-xs">
            可点击顶部 Arena 查看已注册策略列表
          </p>
          <button
            onClick={() => {
              setResult(null);
              try {
                sessionStorage.removeItem(REGISTER_SUCCESS_KEY);
              } catch {
                // ignore
              }
            }}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            继续注册
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">填写后需支付 0.01 0G 注册费</span>
            <button
              type="button"
              onClick={fillSample}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
            >
              一键填写示例
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Strategy Name（策略名称）</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-500"
              placeholder="例如: Momentum Trader v1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description（策略描述）</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-500"
              placeholder="简要描述策略逻辑，例如: Uses momentum indicators for trend following"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Strategy Code（策略代码，Python/JS 均可）
            </label>
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm focus:outline-none focus:border-purple-500"
              placeholder="# 粘贴或编写策略代码，至少一行非空内容"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              代码哈希将存储在链上用于验证
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Registering...</span>
              </>
            ) : (
              isConnected ? 'Register Strategy (0.01 0G)' : '请先连接钱包'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
