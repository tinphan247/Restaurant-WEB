// packages/frontend/src/features/report/ReportPage.tsx

import { useState } from 'react';
import { useRevenue, useBestSellers } from './hooks/useReport';
import { RevenueChart } from './components/RevenueChart';
import { BestSellersTable } from './components/BestSellersTable';

export function ReportPage() {
  const formatLocalDate = (d: Date) => {
    const offsetMs = d.getTimezoneOffset() * 60 * 1000;
    return new Date(d.getTime() - offsetMs).toISOString().split('T')[0];
  };

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [fromDate, setFromDate] = useState(formatLocalDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatLocalDate(today));
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [bestSellersLimit, setBestSellersLimit] = useState(10);

  // Queries
  const { data: revenueDataRaw, isLoading: revenueLoading, error: revenueError } = useRevenue(fromDate, toDate, period);
  const { data: bestSellersDataRaw, isLoading: bestSellersLoading, error: bestSellersError } = useBestSellers(bestSellersLimit, fromDate, toDate);

  const revenueData = Array.isArray(revenueDataRaw) ? revenueDataRaw : [];
  const bestSellersData = Array.isArray(bestSellersDataRaw) ? bestSellersDataRaw : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View your restaurant's performance metrics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Best Sellers Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Items</label>
              <select
                value={bestSellersLimit}
                onChange={(e) => setBestSellersLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="space-y-8">
          {/* Revenue Chart */}
          <div>
            {revenueError ? (
              <div className="h-80 flex items-center justify-center text-red-600 bg-white rounded-lg border border-red-200">
                {(revenueError as any)?.message || 'Failed to load revenue data'}
              </div>
            ) : (
              <RevenueChart data={revenueData} isLoading={revenueLoading} />
            )}
          </div>

          {/* Best Sellers Table */}
          <div>
            {bestSellersError ? (
              <div className="text-center py-8 text-red-600 bg-white rounded-lg border border-red-200">
                {(bestSellersError as any)?.message || 'Failed to load best sellers data'}
              </div>
            ) : (
              <BestSellersTable data={bestSellersData} isLoading={bestSellersLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
