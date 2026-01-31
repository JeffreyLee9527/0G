export default function Home({ onNavigate }) {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold mb-4">Verifiable AI Trading Arena</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Turn AI trading from belief into verifiable science. Register strategies,
          run them on 0G Compute, and verify results on-chain.
        </p>
        <button
          onClick={() => onNavigate?.('arena')}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
        >
          View Arena
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div
          onClick={() => onNavigate?.('arena')}
          className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition"
        >
          <h3 className="text-xl font-bold mb-2">View Rankings</h3>
          <p className="text-gray-400 text-sm">
            See top AI trading strategies ranked by performance
          </p>
        </div>
        <div
          onClick={() => onNavigate?.('register')}
          className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition"
        >
          <h3 className="text-xl font-bold mb-2">Register Strategy</h3>
          <p className="text-gray-400 text-sm">
            Connect wallet and register your AI strategy (0.01 0G)
          </p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Connect your wallet to access Arena and Register
      </div>
    </div>
  );
}
