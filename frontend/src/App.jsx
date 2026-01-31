import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import Home from './pages/Home';
import Arena from './pages/Arena';
import Register from './pages/Register';
import { useWeb3 } from './hooks/useWeb3';

function App() {
  const { isConnected } = useWeb3();
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    if (!isConnected) {
      return <Home onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'arena':
        return <Arena />;
      case 'register':
        return <Register />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1
              onClick={() => setCurrentPage('home')}
              className="text-xl font-bold text-purple-400 cursor-pointer hover:text-purple-300"
            >
              Verifiable AI Trading Arena
            </h1>
            {isConnected && (
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('arena')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Arena
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Register
                </button>
              </nav>
            )}
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">{renderPage()}</main>
    </div>
  );
}

export default App;
