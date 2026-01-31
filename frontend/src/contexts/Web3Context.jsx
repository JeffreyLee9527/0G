import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ZERO_G_GALILEO } from '../utils/constants';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
    } else {
      setAccount(accounts[0]);
      if (window.ethereum) {
        const p = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(p);
        setSigner(p.getSigner());
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const p = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await p.listAccounts();

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setProvider(p);
          setSigner(p.getSigner());
        }
      } catch (err) {
        console.error('Connection check failed:', err);
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      setIsLoading(true);

      const p = new ethers.providers.Web3Provider(window.ethereum);
      await p.send('eth_requestAccounts', []);

      const s = p.getSigner();
      const address = await s.getAddress();
      const network = await p.getNetwork();

      if (network.chainId !== ZERO_G_GALILEO.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ZERO_G_GALILEO.chainIdHex }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: ZERO_G_GALILEO.chainIdHex,
                chainName: ZERO_G_GALILEO.name,
                nativeCurrency: ZERO_G_GALILEO.nativeCurrency,
                rpcUrls: ZERO_G_GALILEO.rpcUrls,
                blockExplorerUrls: ZERO_G_GALILEO.blockExplorerUrls,
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setAccount(address);
      setIsConnected(true);
      setProvider(p);
      setSigner(p.getSigner());
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    account,
    isConnected,
    provider,
    signer,
    isLoading,
    connectWallet,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return ctx;
}
