import React from 'react';
import { type Table } from '@shared/types/table.d.ts'; 

interface TableGridProps {
  tables: Table[];
  // CHỈ CẦN onEdit, các hành động khác (Status Change, QR, Delete) sẽ được xử lý TRONG Modal Form
  onEdit: (table: Table) => void; 
  // onStatusChange: (id: string, status: 'active' | 'inactive') => void; // Bỏ
  // onRegenerateQr: (id: string) => void; // Bỏ
  // onDelete: (id: string) => void; // Bỏ
}

// Hàm tiện ích để định dạng ngày tháng (giữ nguyên)
const formatDate = (dateString: Date | string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'Invalid Date';
    }
}

export const TableGrid: React.FC<TableGridProps> = (props) => {
  // Chỉ nhận onEdit, các props khác không cần thiết ở đây nữa
  const { tables, onEdit } = props; 

  if (tables.length === 0) {
      return <p className="text-center py-12 text-gray-500 text-lg border rounded-lg">Không tìm thấy bàn nào.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Bàn</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức Chứa</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị Trí</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập Nhật Cuối</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    {/* ĐÃ BỎ CỘT "HÀNH ĐỘNG" */}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {tables.map(table => (
                    <tr 
                        key={table.id} 
                        className="hover:bg-indigo-50 transition duration-100 cursor-pointer"
                        // THAY THẾ HOVER/BUTTON BẰNG HÀNH ĐỘNG CLICK
                        onClick={() => onEdit(table)}
                    >
                        {/* Các cột hiển thị thông tin giữ nguyên */}
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-800">{table.tableNumber}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{table.capacity}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{table.location}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(table.createdAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(table.updatedAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                            <span 
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded ${
                                    table.qrToken ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {table.qrToken ? 'Đã Tạo' : 'Chưa Có'}
                            </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                            <span 
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    table.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {table.status.toUpperCase()}
                            </span>
                        </td>
                        {/* KHÔNG CÒN CỘT HÀNH ĐỘNG NỮA */}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};