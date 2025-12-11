"use client"

import { useState, useEffect } from "react"
import { DollarSign, ArrowDown, ArrowUp, Copy, Check, Loader2, Plus } from "lucide-react"
import { useAuth, User } from "@/lib/contexts/AuthContext"
import axios from "axios"

interface Transaction {
  _id: string
  date: string
  description: string
  amount: number
  type: 'deposit' | 'withdrawal' | 'investment' | 'refund'
  status: 'completed' | 'pending' | 'failed'
  project?: { title: string }
}

interface WalletAccount {
  _id: string
  type: 'cardano' | 'mobilemoney'
  label: string
  address?: string
  number?: string
  balance: number
  transactions: Transaction[]
}

export default function WalletPage() {
  const { user } = useAuth() as { user: User & { _id: string } }
  const [wallets, setWallets] = useState<WalletAccount[]>([])
  const [copied, setCopied] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [formData, setFormData] = useState({ type: 'cardano', address: '', number: '', label: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null)

  const activeWallet = wallets.find(w => w._id === activeWalletId)

  // Récupération des wallets
  const fetchWallets = async () => {
    setIsLoadingData(true)
    try {
      const res = await axios.get(`/api/wallets?userId=${user?.id}`)
      setWallets(res.data.wallets || [])
      if (!activeWalletId && res.data.wallets.length > 0) setActiveWalletId(res.data.wallets[0]._id)
    } catch (err) {
      console.error("Failed to fetch wallets", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) fetchWallets()
  }, [user])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        userId: user?.id,
        type: formData.type, // cardano | mobilemoney
        label: formData.label,
        address: formData.type === 'cardano' ? formData.address : undefined,
        number: formData.type === 'mobilemoney' ? formData.number : undefined
      }

      await axios.post('/api/wallets', payload)
      setShowLinkModal(false)
      setFormData({ type: 'cardano', address: '', number: '', label: '' })
      fetchWallets()
    } catch (err) {
      console.error("Failed to link wallet", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading wallet data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your funds and view transaction history</p>
        </div>
        <div className="text-sm text-gray-500">
          Wallet ID: {activeWallet?._id?.slice(-8)}
        </div>
      </div>

      {/* Wallet Selector */}
      <div className="flex flex-wrap gap-4 items-center">
        {wallets.map(w => (
          <button
            key={w._id}
            onClick={() => setActiveWalletId(w._id)}
            className={`px-4 py-2 rounded-lg border transition-colors font-medium
              ${w._id === activeWalletId ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          >
            {w.label}
          </button>
        ))}
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-4 py-2 rounded-lg border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Plus size={16} /> Link Account
        </button>
      </div>

      {/* Balance Card */}
      {activeWallet && (
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 rounded-xl shadow-lg">
          <p className="text-blue-100 mb-2 text-sm font-medium">Available Balance</p>
          <p className="text-4xl font-bold mb-4">{activeWallet.balance.toLocaleString()} Ada</p>
        </div>
      )}

      {/* Wallet Address / Number */}
      {activeWallet && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{activeWallet.type === 'cardano' ? 'Wallet Address' : 'Mobile Number'}</h3>
              <p className="text-sm text-gray-600">
                {activeWallet.type === 'cardano'
                  ? 'Use this address to receive funds'
                  : 'Use this number for Mobile Money transactions'}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(activeWallet.address || activeWallet.number || '')}
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
                  <span className="text-sm font-medium text-gray-600">Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <code className="text-sm text-gray-800 font-mono break-all">
              {activeWallet.address || activeWallet.number}
            </code>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {activeWallet && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-600 text-sm mt-1">All transactions for this account</p>
          </div>
          {activeWallet.transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {activeWallet.transactions.map(txn => (
                <div key={txn._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txn.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
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
                      {txn.project && <p className="text-gray-600 text-sm">{txn.project.title}</p>}
                      <p className="text-gray-500 text-xs mt-1">{formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${txn.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
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
      )}

      {/* Modal pour lier un compte */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Link a new account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="cardano">Cardano Wallet</option>
                  <option value="mobilemoney">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  required
                  placeholder="My Cardano Wallet / Mobile Number"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              {formData.type === 'cardano' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Wallet Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="Enter your Cardano address"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              )}
              {formData.type === 'mobilemoney' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    required
                    placeholder="Enter your Mobile Money number"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {isSubmitting ? 'Linking...' : 'Link Account'}
              </button>
            </form>
            <button
              className="mt-4 w-full py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              onClick={() => setShowLinkModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
