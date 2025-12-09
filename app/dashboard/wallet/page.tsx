"use client"

import { useState, useEffect } from "react"
import { DollarSign, ArrowDown, ArrowUp, TrendingUp, Copy, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useApi } from "@/lib/hooks/useApi"

interface Transaction {
  _id: string
  date: string
  description: string
  amount: number
  type: 'deposit' | 'withdrawal' | 'investment' | 'refund'
  status: 'completed' | 'pending' | 'failed'
  project?: {
    title: string
  }
}

export default function Wallet() {
  const { user } = useAuth()
  const { fetchApi, isLoading } = useApi()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Mock data - remplacer par vos appels API
  const walletData = {
    availableBalance: 2450,
    totalInvested: 3200,
    portfolioValue: 5890,
    pendingWithdrawals: 150,
    walletAddress: user?.walletAddress || "addr_test1qpc6agfq4gy2j3gc7xsz7x0gq5r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq6r6gq"
  }

  const mockTransactions: Transaction[] = [
    { _id: "1", date: "2025-01-15", description: "Project Funding", amount: -500, type: 'investment', status: 'completed', project: { title: "Clean Water Initiative" } },
    { _id: "2", date: "2025-01-12", description: "Refund", amount: 100, type: 'refund', status: 'completed' },
    { _id: "3", date: "2025-01-10", description: "Withdrawal", amount: -200, type: 'withdrawal', status: 'completed' },
    { _id: "4", date: "2025-01-05", description: "Project Funding", amount: -300, type: 'investment', status: 'completed', project: { title: "Tech Education Program" } },
    { _id: "5", date: "2025-01-01", description: "Deposit", amount: 1000, type: 'deposit', status: 'completed' },
  ]

  useEffect(() => {
    // Simuler chargement données
    const timer = setTimeout(() => {
      setTransactions(mockTransactions)
      setIsLoadingData(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return <ArrowDown className="w-5 h-5 text-green-600" />
      case 'withdrawal': return <ArrowUp className="w-5 h-5 text-red-600" />
      case 'investment': return <DollarSign className="w-5 h-5 text-blue-600" />
      case 'refund': return <ArrowDown className="w-5 h-5 text-green-600" />
      default: return <DollarSign className="w-5 h-5 text-gray-600" />
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your funds and view transaction history</p>
        </div>
        <div className="text-sm text-gray-500">
          Wallet ID: {user?.id?.slice(-8)}
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 rounded-xl shadow-lg">
          <p className="text-blue-100 mb-2 text-sm font-medium">Available Balance</p>
          <p className="text-4xl font-bold mb-4">{walletData.availableBalance.toLocaleString()} Ada</p>
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <TrendingUp size={16} />
            <span>+12.5% from last month</span>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">{walletData.totalInvested.toLocaleString()} Ada</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Across 5 active projects
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{walletData.portfolioValue.toLocaleString()} Ada</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Current value of all investments
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Your Wallet Address</h3>
            <p className="text-sm text-gray-600">Use this address to receive funds</p>
          </div>
          <button
            onClick={() => copyToClipboard(walletData.walletAddress)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Copy Address</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-300">
          <code className="text-sm text-gray-800 font-mono break-all">
            {walletData.walletAddress}
          </code>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setShowDepositModal(true)}
          className="bg-primary text-white py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 font-medium"
        >
          <ArrowDown size={20} />
          <span>Deposit Funds</span>
        </button>
        
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="bg-secondary text-white py-4 rounded-xl hover:bg-secondary/90 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 font-medium"
        >
          <ArrowUp size={20} />
          <span>Withdraw</span>
        </button>
        
        <button className="bg-white border border-gray-300 text-gray-800 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 font-medium">
          <DollarSign size={20} />
          <span>Exchange</span>
        </button>
        
        <button className="bg-white border border-gray-300 text-gray-800 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 font-medium">
          <TrendingUp size={20} />
          <span>History</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600 text-sm mt-1">All your wallet transactions</p>
        </div>
        
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <div key={txn._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    txn.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                    {txn.project && (
                      <p className="text-gray-600 text-sm">{txn.project.title}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{formatDate(txn.date)}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${
                  txn.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {txn.amount > 0 ? '+' : '−'}{Math.abs(txn.amount).toLocaleString()} Ada
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}