"use client"

import { useState } from "react"
import { Wallet, ChevronDown } from "lucide-react"

export function WalletConnector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleConnectWallet = async (walletName: string) => {
    console.log("[v0] Attempting to connect wallet:", walletName)
    setIsConnected(true)
    setWalletAddress(`${walletName.substring(0, 8)}...${Math.random().toString(36).substring(2, 8)}`)
    setIsOpen(false)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress(null)
  }

  if (isConnected && walletAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
        >
          <Wallet size={18} />
          <span>{walletAddress}</span>
          <ChevronDown size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
      >
        <Wallet size={18} />
        <span>Connect Wallet</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">wallet</h3>
            <div className="space-y-2">
              {["Nami", "Eternl", "Flint"].map((wallet) => (
                <button
                  key={wallet}
                  onClick={() => handleConnectWallet(wallet)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors text-sm text-gray-700 font-medium"
                >
                  {wallet}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Popular Cardano wallets
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
