import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
// Import types only to avoid pulling realtime runtime code (and WASM) into server bundles
import type { BrowserWallet, DataSignature } from "@meshsdk/core";

/**
 * Constants for wallet configuration
 */
const WALLET_STORAGE_KEY = "wallet-state" as const;
const MIN_MESSAGE_LENGTH = 6;
const MAX_MESSAGE_LENGTH = 64;

/**
 * Required wallet methods that must be available for the wallet to function
 */
const REQUIRED_WALLET_METHODS = ["getUsedAddresses", "signData"] as const;

/**
 * Wallet state interface representing the persisted wallet connection state
 */
export interface WalletState {
  connected: boolean;
  address: string;
  walletName: string;
}

/**
 * Complete wallet state including the wallet instance
 */
export interface CompleteWalletState extends WalletState {
  wallet: BrowserWallet | null;
}

/**
 * Wallet connection result
 */
export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
}

/**
 * Wallet operation actions
 */
export type WalletAction =
  | { type: "connect"; walletId: string }
  | { type: "disconnect" };

/**
 * Sign data payload
 */
export interface SignDataPayload {
  address: string;
  message: string;
}

/**
 * Custom error classes for better error handling
 */
export class WalletError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "WalletError";
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}

export class WalletConnectionError extends WalletError {
  constructor(message: string, originalError?: unknown) {
    super(message, "WALLET_CONNECTION_ERROR", originalError);
    this.name = "WalletConnectionError";
  }
}

export class WalletValidationError extends WalletError {
  constructor(message: string) {
    super(message, "WALLET_VALIDATION_ERROR");
    this.name = "WalletValidationError";
  }
}

export class WalletSignError extends WalletError {
  constructor(message: string, originalError?: unknown) {
    super(message, "WALLET_SIGN_ERROR", originalError);
    this.name = "WalletSignError";
  }
}

/**
 * Default wallet state
 */
const DEFAULT_WALLET_STATE: WalletState = {
  connected: false,
  address: "",
  walletName: "",
};

/**
 * Creates a custom storage instance for wallet state
 */
const walletStateStorage = createJSONStorage<WalletState>(() => localStorage);

/**
 * Validates that a wallet instance has all required methods
 */
function validateWalletMethods(wallet: BrowserWallet): void {
  for (const methodName of REQUIRED_WALLET_METHODS) {
    if (typeof wallet[methodName] !== "function") {
      throw new WalletValidationError(
        `Wallet does not support required method: ${methodName}`
      );
    }
  }
}

/**
 * Processes a message for wallet signing by normalizing length and case
 */
function processMessageForSigning(message: string): string {
  let processed = message;

  // Ensure minimum length
  if (processed.length < MIN_MESSAGE_LENGTH) {
    processed = processed.padEnd(MIN_MESSAGE_LENGTH, " ");
  }

  // Truncate if too long
  if (processed.length > MAX_MESSAGE_LENGTH) {
    processed = processed.substring(0, MAX_MESSAGE_LENGTH);
  }

  // Convert to lowercase as required by wallet implementations
  return processed.toLowerCase();
}

/**
 * Attempts to sign data with a wallet using multiple strategies
 */
async function signDataWithWallet(
  wallet: BrowserWallet,
  address: string,
  message: string
): Promise<DataSignature> {
  const processedMessage = processMessageForSigning(message);

  try {
    // First attempt: lowercase message directly
    return await wallet.signData(address, processedMessage);
  } catch (error) {
    // Second attempt: hex-encoded message
    const messageHex = Buffer.from(processedMessage).toString("hex");
    try {
      return await wallet.signData(address, messageHex);
    } catch (hexError) {
      throw new WalletSignError(
        "Failed to sign data with both plain text and hex formats",
        { plainTextError: error, hexError }
      );
    }
  }
}

/**
 * Resets wallet state to default disconnected state
 */
function resetWalletState(
  set: (atom: typeof walletInstanceAtom, value: BrowserWallet | null) => void,
  setState: (atom: typeof walletStateAtom, value: WalletState) => void
): void {
  set(walletInstanceAtom, null);
  setState(walletStateAtom, DEFAULT_WALLET_STATE);
}

/**
 * Connects to a browser wallet and updates the state
 */
async function connectWallet(
  walletId: string,
  set: (atom: typeof walletInstanceAtom, value: BrowserWallet | null) => void,
  setState: (atom: typeof walletStateAtom, value: WalletState) => void
): Promise<WalletConnectionResult> {
  try {
    // Only run wallet enable on the client
    if (typeof window === "undefined") {
      throw new WalletConnectionError("Wallet connection must be performed in the browser");
    }

    // Dynamically import to avoid bundling WASM/server-side imports
    const { BrowserWallet } = await import("@meshsdk/core");

    // Enable the browser wallet
    const browserWallet = await BrowserWallet.enable(walletId);

    // Validate wallet methods
    validateWalletMethods(browserWallet);

    // Get wallet addresses
    const addresses = await browserWallet.getUsedAddresses();

    if (!addresses || addresses.length === 0) {
      throw new WalletConnectionError("No addresses found in wallet");
    }

    const primaryAddress = addresses[0];

    // Update wallet instance (non-persisted)
    set(walletInstanceAtom, browserWallet);

    // Update persisted state
    setState(walletStateAtom, {
      connected: true,
      address: primaryAddress,
      walletName: walletId,
    });

    return {
      success: true,
      address: primaryAddress,
    };
  } catch (error) {
    // Reset state on error
    resetWalletState(set, setState);

    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletConnectionError(
      `Failed to connect wallet: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error
    );
  }
}

/**
 * Disconnects the wallet and resets state
 */
function disconnectWallet(
  set: (atom: typeof walletInstanceAtom, value: BrowserWallet | null) => void,
  setState: (atom: typeof walletStateAtom, value: WalletState) => void
): WalletConnectionResult {
  resetWalletState(set, setState);
  return { success: true };
}

/**
 * Persisted wallet state atom (does not include wallet instance)
 */
export const walletStateAtom = atomWithStorage<WalletState>(
  WALLET_STORAGE_KEY,
  DEFAULT_WALLET_STATE,
  walletStateStorage
);

/**
 * Non-persisted wallet instance atom
 */
export const walletInstanceAtom = atom<BrowserWallet | null>(null);

/**
 * Combined wallet atom providing complete wallet state
 */
export const walletAtom = atom(
  (get): CompleteWalletState => {
    const state = get(walletStateAtom);
    const wallet = get(walletInstanceAtom);
    return {
      ...state,
      wallet,
    };
  },
  (
    get,
    set,
    newState: {
      connected: boolean;
      address: string;
      wallet: BrowserWallet | null;
      walletName: string;
    }
  ) => {
    set(walletStateAtom, {
      connected: newState.connected,
      address: newState.address,
      walletName: newState.walletName,
    });
    set(walletInstanceAtom, newState.wallet);
  }
);

/**
 * Wallet operations atom for connecting/disconnecting wallets
 */
export const walletOperationsAtom = atom(
  (get) => get(walletAtom),
  async (get, set, action: WalletAction): Promise<WalletConnectionResult> => {
    if (action.type === "connect") {
      return connectWallet(action.walletId, set, set);
    } else {
      return disconnectWallet(set, set);
    }
  }
);

/**
 * Sign data atom for signing messages with the connected wallet
 */
export const signDataAtom = atom(
  null,
  async (get, set, payload: SignDataPayload): Promise<DataSignature> => {
    const { wallet } = get(walletAtom);

    if (!wallet) {
      throw new WalletSignError("Wallet not connected");
    }

    try {
      return await signDataWithWallet(wallet, payload.address, payload.message);
    } catch (error) {
      if (error instanceof WalletSignError) {
        throw error;
      }
      throw new WalletSignError(
        `Failed to sign data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error
      );
    }
  }
);
