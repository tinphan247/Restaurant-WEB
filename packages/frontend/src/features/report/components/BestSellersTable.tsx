// packages/frontend/src/features/report/components/BestSellersTable.tsx

interface BestSellerItem {
  id: string;
  item_name: string;
  total_times_ordered: number;
  total_quantity_sold: number;
  total_revenue: number;
  avg_order_value: number;
}

interface BestSellersTableProps {
  data?: BestSellerItem[];
  isLoading?: boolean;
}

export function BestSellersTable({ data = [], isLoading }: BestSellersTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Top Selling Items</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Item Name</th>
            <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Times Ordered</th>
            <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Qty Sold</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Revenue (VND)</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Avg Order Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{item.item_name}</td>
              <td className="px-6 py-4 text-sm text-center text-gray-700">{item.total_times_ordered}</td>
              <td className="px-6 py-4 text-sm text-center text-gray-700">{item.total_quantity_sold}</td>
              <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                {Number(item.total_revenue || 0).toLocaleString('vi-VN')}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-700">
                {Number(item.avg_order_value || 0).toLocaleString('vi-VN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
