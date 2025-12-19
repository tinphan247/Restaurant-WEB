import React, { useState } from 'react';
import type { Table } from '@shared/types/table';
import { QRCodeDisplay } from '../../print-tools/components/QRCodeDisplay';
import { DownloadActions } from '../../print-tools/components/DownloadActions';
import { tableApi } from '../../../services/tableApi';

interface TableGridProps {
  tables: Table[];
  onEdit: (table: Table) => void;
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
  const [qrModal, setQrModal] = useState<{ show: boolean; table: Table | null }>({ show: false, table: null });

  // Tạo URL đầy đủ cho QR Code
  const getQrUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu?token=${token}`;
  };

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
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
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
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${table.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {table.status.toUpperCase()}
                </span>
              </td>
              {/* CỘT HÀNH ĐỘNG */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const latest = await tableApi.getById(table.id);
                        setQrModal({ show: true, table: latest });
                      } catch (err) {
                        console.warn('Failed to fetch latest table, using current row.', err);
                        setQrModal({ show: true, table });
                      }
                    }}
                    className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded hover:bg-blue-200 transition"
                  >
                    📱 Xem
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(table);
                    }}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition"
                  >
                    ✏️ Sửa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL HIỂN THỊ MÃ QR */}
      {qrModal.show && qrModal.table?.qrToken && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Mã QR - Bàn {qrModal.table.tableNumber}</h3>
            <p className="text-sm text-gray-500 mb-4">Quét mã này để truy cập menu</p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-100 mb-4">
              <QRCodeDisplay
                value={getQrUrl(qrModal.table.qrToken)}
                size={200}
              />
            </div>

            {/* URL hiển thị */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Link truy cập:</p>
              <p className="text-xs text-blue-600 break-all font-mono">{getQrUrl(qrModal.table.qrToken)}</p>
            </div>

            {/* Nút hành động */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getQrUrl(qrModal.table!.qrToken!));
                  alert('Đã copy link vào clipboard!');
                }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                📋 Copy Link
              </button>
              {qrModal.table.id && (
                <DownloadActions tableId={qrModal.table.id} />
              )}
              <button
                type="button"
                onClick={() => setQrModal({ show: false, table: null })}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};