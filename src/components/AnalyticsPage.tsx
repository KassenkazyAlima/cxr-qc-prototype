import React from "react";
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const qcStatusData = [
    { name: 'PASS', value: 217, color: '#22c55e' },
    { name: 'FIX', value: 20, color: '#eab308' },
    { name: 'FLAG', value: 11, color: '#ef4444' },
  ];

  const deviceData = [
    { device: 'GE Discovery', pass: 95, fix: 8, flag: 3 },
    { device: 'Siemens Multix', pass: 72, fix: 7, flag: 5 },
    { device: 'Philips Digital', pass: 50, fix: 5, flag: 3 },
  ];

  const trendData = [
    { month: 'Jul', passRate: 85 },
    { month: 'Aug', passRate: 86 },
    { month: 'Sep', passRate: 84 },
    { month: 'Oct', passRate: 88 },
    { month: 'Nov', passRate: 87.5 },
  ];

  const stats = [
    {
      label: 'Pass Rate',
      value: '87.5%',
      change: '+2.1%',
      trend: 'up',
    },
    {
      label: 'Flag Rate',
      value: '4.4%',
      change: '-0.8%',
      trend: 'down',
    },
    {
      label: 'Avg. Processing Time',
      value: '2.3 min',
      change: '-0.4 min',
      trend: 'down',
    },
    {
      label: 'Total Scans',
      value: '248',
      change: '+12',
      trend: 'up',
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">QC Analytics Dashboard</h1>
          <p className="text-gray-600">Performance metrics and quality trends</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl text-gray-900">{stat.value}</p>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* QC Status Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-gray-900 mb-4">QC Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qcStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qcStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              {qcStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Performance */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-gray-900 mb-4">Performance by Device</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pass" fill="#22c55e" name="Pass" />
                <Bar dataKey="fix" fill="#eab308" name="Fix" />
                <Bar dataKey="flag" fill="#ef4444" name="Flag" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass Rate Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-gray-900 mb-4">Pass Rate Trend (Last 5 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="passRate" fill="#3b82f6" name="Pass Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Issues */}
        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-gray-900 mb-4">Top Quality Issues</h2>
          <div className="space-y-3">
            {[
              { issue: 'Rotation > 5°', count: 15, percentage: 60 },
              { issue: 'Poor Coverage', count: 8, percentage: 32 },
              { issue: 'Motion Blur', count: 5, percentage: 20 },
              { issue: 'Overexposure', count: 3, percentage: 12 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.issue}</span>
                  <span className="text-sm text-gray-900">{item.count} cases</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
