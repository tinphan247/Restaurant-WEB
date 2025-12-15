import React from 'react';
import { type Table } from '../../../../../../shared/types/table';

// Giả định components của Người 3 được truyền vào qua props
// import { QRCodeDisplay } from '../../print-tools/components/QRCodeDisplay'; 
// import { DownloadActions } from '../../print-tools/components/DownloadActions';

interface TableGridProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onStatusChange: (id: string, status: 'active' | 'inactive') => void;
  onRegenerateQr: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TableGrid: React.FC<TableGridProps> = (props) => {
  const { tables, onEdit, onStatusChange, onRegenerateQr, onDelete } = props;

  if (tables.length === 0) {
      return <p className="text-center py-8 text-gray-500">Không tìm thấy bàn nào.</p>;
  }

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="py-2 px-4 border-b">Số Bàn</th>
                    <th className="py-2 px-4 border-b">Sức Chứa</th>
                    <th className="py-2 px-4 border-b">Vị Trí</th>
                    <th className="py-2 px-4 border-b">Trạng thái</th>
                    <th className="py-2 px-4 border-b">QR Token</th>
                    <th className="py-2 px-4 border-b">Hành động</th>
                </tr>
            </thead>
            <tbody>
                {tables.map(table => (
                    <tr key={table.id} className="hover:bg-gray-50 text-center">
                        <td className="py-2 px-4 border-b font-medium">{table.tableNumber}</td>
                        <td className="py-2 px-4 border-b">{table.capacity}</td>
                        <td className="py-2 px-4 border-b">{table.location}</td>
                        <td className={`py-2 px-4 border-b font-semibold ${table.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {table.status.toUpperCase()}
                        </td>
                        <td className="py-2 px-4 border-b text-sm">
                            {table.qrToken ? 'Đã tạo' : 'Chưa có'}
                            {/* {table.qrToken && <QRCodeDisplay token={table.qrToken} />} */}
                        </td>
                        <td className="py-2 px-4 border-b space-x-2">
                            <button className="text-blue-600 hover:underline" onClick={() => onEdit(table)}>Sửa</button>
                            <button 
                                className={`text-sm p-1 rounded ${table.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`} 
                                onClick={() => onStatusChange(table.id, table.status)}
                            >
                                {table.status === 'active' ? 'Tắt' : 'Bật'}
                            </button>
                            {/* Nút gọi API của Người 2 */}
                            <button className="text-purple-600 hover:underline" onClick={() => onRegenerateQr(table.id)}>
                                Tái tạo QR
                            </button>
                            {/* {table.qrToken && <DownloadActions table={table} />} */}
                            <button className="text-red-600 hover:underline" onClick={() => onDelete(table.id)}>Xóa</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};