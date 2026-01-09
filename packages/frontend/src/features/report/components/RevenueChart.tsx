// packages/frontend/src/features/report/components/RevenueChart.tsx

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueData {
  period: string;
  revenue: number;
  total_orders: number;
  completed_orders: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  isLoading?: boolean;
}

// Guarded tooltip to avoid payload access errors when Recharts fires events without data
const SafeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const formatValue = (value: any) => {
    if (typeof value === 'number' && value > 10000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-2 shadow-sm text-sm text-gray-800">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold">{formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function RevenueChart({ data = [], isLoading }: RevenueChartProps) {
  if (isLoading) {
    return <div className="h-80 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>;
  }

  if (!Array.isArray(data)) {
    return <div className="h-80 flex items-center justify-center text-red-600 bg-white border border-red-200">Invalid data</div>;
  }

  return (
    <div className="w-full h-80 bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<SafeTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            dot={{ fill: '#8884d8' }}
            name="Revenue (VND)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="completed_orders"
            stroke="#82ca9d"
            dot={{ fill: '#82ca9d' }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
