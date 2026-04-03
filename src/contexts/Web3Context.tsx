import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { getContracts, ContractInstances } from "../lib/web3/contracts";
import { isNetworkSupported, DEFAULT_CHAIN_ID } from "../shared/constants/networks";

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  contracts: ContractInstances | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [contracts, setContracts] = useState<ContractInstances | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const isCorrectNetwork = chainId ? isNetworkSupported(chainId) : false;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet!");
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const web3Signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(browserProvider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(currentChainId);
      setIsConnected(true);

      if (isNetworkSupported(currentChainId)) {
        const contractInstances = getContracts(currentChainId, web3Signer);
        setContracts(contractInstances);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setContracts(null);
    setIsConnected(false);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toQuantity(targetChainId) }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        console.error("Network not added to wallet");
      } else {
        console.error("Failed to switch network:", error);
      }
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_accounts", []);

        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        contracts,
        isConnected,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
