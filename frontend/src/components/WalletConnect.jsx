import { useWeb3 } from '../hooks/useWeb3';

export default function WalletConnect() {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading } = useWeb3();

  return (
    <div>
      {isLoading ? (
        <span className="text-gray-400 text-sm">Connecting...</span>
      ) : isConnected ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 font-mono">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
