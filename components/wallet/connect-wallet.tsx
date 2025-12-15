"use client";

import { useWalletList } from "@meshsdk/react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletAtom } from "@/hooks/use-wallet-atom";
import { WalletConnectionError, WalletError } from "@/lib/wallet";
import { Loader2, Wallet } from "lucide-react";

interface ConnectWalletProps {
  onConnect?: (address: string) => void;
  buttonText?: string;
}

export function ConnectWallet({
  onConnect,
  buttonText = "Connect Wallet",
}: ConnectWalletProps) {
  const { connect, disconnect, connected, address, walletName } =
    useWalletAtom();
  const wallets = useWalletList();

  const [connecting, setConnecting] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatWalletName = (name: string): string => {
    const walletNameMap: Record<string, string> = {
      eternl: "Eternl",
      nami: "Nami",
      flint: "Flint",
      typhoncip30: "Typhon",
      gerowallet: "Gero",
      nufi: "NuFi",
      yoroi: "Yoroi",
      cardwallet: "CardWallet",
      lace: "Lace",
      begin: "Begin",
      vespr: "Vespr",
    };

    if (name.toLowerCase() in walletNameMap) {
      return walletNameMap[name.toLowerCase()];
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    // Notify parent component when wallet is connected
    if (connected && address) {
      onConnect?.(address);
      // Close modal and clear errors on successful connection
      setShowWalletModal(false);
      setConnectionError(null);
      setConnectingWallet(null);
    }
  }, [connected, address, onConnect]);

  const handleWalletSelect = useCallback(
    async (walletId: string) => {
      try {
        setConnectingWallet(walletId);
        setConnecting(true);
        setConnectionError(null);

        const result = await connect(walletId);

        // Check if we got a valid result with an address
        if (!result || !result.address) {
          throw new WalletConnectionError(
            "Failed to connect to wallet: No address returned"
          );
        }

        // Success - modal will close via useEffect when connected state updates
      } catch (err) {
        console.error("Error connecting to wallet:", err);

        let errorMessage = "Failed to connect wallet";

        if (err instanceof WalletConnectionError) {
          errorMessage = err.message;
        } else if (err instanceof WalletError) {
          errorMessage = err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setConnectionError(errorMessage);
        // Keep modal open to show error
      } finally {
        setConnectingWallet(null);
        setConnecting(false);
      }
    },
    [connect]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setShowDisconnect(false);
      setConnectionError(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, [disconnect]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!connecting) {
        setShowWalletModal(open);
        if (!open) {
          setConnectionError(null);
          setConnectingWallet(null);
        }
      }
    },
    [connecting]
  );

  const handleCopyAddress = useCallback(async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  }, [address]);

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return "";
    // Afficher les 10 premiers caractères et les 8 derniers pour une meilleure lisibilité
    if (addr.length > 18) {
      return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
    }
    return addr;
  }, []);

  return (
    <div className="w-full">
      {!connected ? (
        <div className="relative">
          <Dialog open={showWalletModal} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="default"
                className="w-full bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md shadow-primary/20"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    {buttonText}
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent
              className="p-0 bg-linear-to-br from-primary via-primary/90 to-primary text-white border-white/20 overflow-hidden sm:max-w-md"
              showCloseButton={!connecting}
            >
              <DialogHeader className="px-6 py-4 border-b border-white/20">
                <DialogTitle className="text-2xl font-bold text-white text-center">
                  Select Wallet
                </DialogTitle>
                <DialogDescription className="text-white/70 text-center pt-2">
                  Choose a Cardano wallet to connect to your account
                </DialogDescription>
              </DialogHeader>

              {/* Error Message */}
              {connectionError && (
                <div className="mx-6 mt-4 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium mb-1">
                        Connection Error
                      </p>
                      <p className="text-sm text-white/90">{connectionError}</p>
                      <p className="text-xs text-white/70 mt-2">
                        Please make sure your wallet extension is installed and
                        enabled, then try again.
                      </p>
                    </div>
                    <button
                      onClick={() => setConnectionError(null)}
                      className="text-white/70 hover:text-white transition-colors shrink-0"
                      aria-label="Dismiss error"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-white/30">
                {wallets.length === 0 ? (
                  <div className="py-10 text-center">
                    <svg
                      className="mx-auto h-20 w-20 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="mt-5 text-white/60 text-xl font-medium">
                      No wallets found
                    </p>
                    <p className="mt-2 text-white/40 text-sm">
                      Please install a Cardano wallet extension to continue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wallets.map((walletItem) => {
                      const isConnecting =
                        connecting && connectingWallet === walletItem.name;
                      return (
                        <motion.button
                          key={walletItem.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleWalletSelect(walletItem.name)}
                          disabled={connecting}
                          className="w-full flex items-center p-5 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
                        >
                          <img
                            src={walletItem.icon}
                            alt={`${walletItem.name} icon`}
                            className="w-12 h-12 mr-5 shrink-0 rounded-lg"
                          />
                          <span className="font-medium text-xl flex-1 text-left">
                            {formatWalletName(walletItem.name)}
                          </span>
                          {isConnecting && (
                            <svg
                              className="animate-spin h-5 w-5 text-white ml-2 shrink-0"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {connectionError && !showWalletModal && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-500/20 rounded-lg border border-red-500/30"
              >
                <p className="text-sm text-white">
                  <span className="font-medium">Error:</span> {connectionError}
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Please make sure your wallet extension is installed and
                  enabled.
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      ) : (
        <div className="relative">
          <Button
            variant="default"
            size="default"
            className="w-full bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md shadow-primary/20"
            onClick={() => setShowDisconnect(!showDisconnect)}
          >
            <Wallet className="h-4 w-4" />
            <span className="truncate max-w-[200px] font-mono text-sm">
              {address
                ? formatAddress(address)
                : walletName
                ? formatWalletName(walletName)
                : "Wallet Connected"}
            </span>
          </Button>

          <AnimatePresence>
            {showDisconnect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute w-full mt-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden z-10"
              >
                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 px-4 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="mr-2 h-5 w-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Disconnect Wallet
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
