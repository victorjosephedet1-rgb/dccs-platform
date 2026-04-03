/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_DEFAULT_CHAIN_ID: string;
  readonly VITE_BASE_SEPOLIA_RPC_URL: string;
  readonly VITE_BASE_RPC_URL: string;
  readonly VITE_ROYALTY_SPLITTER_ADDRESS: string;
  readonly VITE_DCCS_REGISTRY_ADDRESS: string;
  readonly VITE_LICENSE_NFT_ADDRESS: string;
  readonly VITE_INSTANT_PAYOUT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
  };
}
