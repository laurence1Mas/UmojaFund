"use client"

import Link from "next/link"
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react"

export default function Dashboard() {
  const stats = [
    { label: "Total Funded", value: "2,450 Ada", icon: DollarSign, color: "text-blue-600" },
    { label: "Active Projects", value: "5", icon: Target, color: "text-green-600" },
    { label: "Your Returns", value: "+340 Ada", icon: TrendingUp, color: "text-purple-600" },
    { label: "Portfolio Value", value: "5,890 Ada", icon: Activity, color: "text-orange-600" },
  ]

  const recentActivity = [
    { date: "2025-01-15", action: "Funded", project: "Clean Water Initiative", amount: "500 Ada" },
    { date: "2025-01-10", action: "Withdrawal", description: "Account withdrawal", amount: "-200 Ada" },
    { date: "2025-01-05", action: "Funded", project: "Tech Education Program", amount: "300 Ada" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your portfolio overview.</p>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-gray-600 text-sm">{activity.project || activity.description}</p>
                <p className="text-gray-500 text-xs mt-1">{activity.date}</p>
              </div>
              <p className="font-bold text-primary">{activity.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Link
          href="/dashboard/wallet"
          className="bg-primary text-white p-6 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <h3 className="text-lg font-bold mb-2">Wallet</h3>
          <p>Manage your funds and transactions</p>
        </Link>
        <Link
          href="/projects"
          className="bg-secondary text-white p-6 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <h3 className="text-lg font-bold mb-2">Explore Projects</h3>
          <p>Discover new projects to support</p>
        </Link>
      </div>
    </div>
  )
}
