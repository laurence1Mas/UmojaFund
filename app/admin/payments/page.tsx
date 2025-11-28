"use client"

import { Search } from "lucide-react"

export default function Payments() {
  const payments = [
    { id: 1, transaction: "TXN001", user: "John Doe", amount: "500 Ada", date: "2025-01-15", status: "Success" },
    { id: 2, transaction: "TXN002", user: "Jane Smith", amount: "300 Ada", date: "2025-01-14", status: "Success" },
    { id: 3, transaction: "TXN003", user: "Bob Johnson", amount: "1000 Ada", date: "2025-01-13", status: "Pending" },
    { id: 4, transaction: "TXN004", user: "Alice Brown", amount: "250 Ada", date: "2025-01-12", status: "Success" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-gray-600">Track all platform transactions</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search payments..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left font-bold">Transaction ID</th>
              <th className="px-6 py-4 text-left font-bold">User</th>
              <th className="px-6 py-4 text-left font-bold">Amount</th>
              <th className="px-6 py-4 text-left font-bold">Date</th>
              <th className="px-6 py-4 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{payment.transaction}</td>
                <td className="px-6 py-4">{payment.user}</td>
                <td className="px-6 py-4 font-bold text-primary">{payment.amount}</td>
                <td className="px-6 py-4 text-gray-600">{payment.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === "Success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
