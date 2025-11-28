"use client"

import { DollarSign, ArrowDown, ArrowUp, TrendingUp } from "lucide-react"

export default function Wallet() {
  const transactions = [
    { date: "2025-01-15", description: "Project Funding", amount: "-500 Ada", type: "debit" },
    { date: "2025-01-12", description: "Refund", amount: "+100 Ada", type: "credit" },
    { date: "2025-01-10", description: "Withdrawal", amount: "-200 Ada", type: "debit" },
    { date: "2025-01-05", description: "Project Funding", amount: "-300 Ada", type: "debit" },
    { date: "2025-01-01", description: "Deposit", amount: "+1000 Ada", type: "credit" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-gray-600">Manage your funds and view transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 rounded-lg shadow-sm">
          <p className="text-blue-100 mb-2">Available Balance</p>
          <p className="text-4xl font-bold">2,450 Ada</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">3,200 Ada</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold">5,890 Ada</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button className="bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2">
          <ArrowDown size={20} /> Deposit Funds
        </button>
        <button className="bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition-colors font-medium flex items-center justify-center gap-2">
          <ArrowUp size={20} /> Withdraw
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.map((txn, index) => (
            <div key={index} className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {txn.type === "credit" ? (
                    <ArrowDown className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{txn.description}</p>
                  <p className="text-gray-500 text-sm">{txn.date}</p>
                </div>
              </div>
              <p className={`font-bold ${txn.type === "credit" ? "text-green-600" : "text-gray-900"}`}>{txn.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
