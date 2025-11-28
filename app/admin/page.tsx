"use client"

import { BarChart3, Users, FolderOpen, CreditCard, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { label: "Active Projects", value: "567", icon: FolderOpen, color: "text-green-600" },
    { label: "Total Raised", value: "5.2M Ada", icon: CreditCard, color: "text-purple-600" },
    { label: "Growth", value: "+23%", icon: TrendingUp, color: "text-orange-600" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-6">Revenue Trend</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-16 h-16 text-gray-300" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-medium">Transaction #{1000 + index}</p>
                <p className="text-gray-600 text-sm">User ID: {5000 + index}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{(Math.random() * 1000) | 0} Ada</p>
                <p className="text-gray-500 text-xs">Today</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
