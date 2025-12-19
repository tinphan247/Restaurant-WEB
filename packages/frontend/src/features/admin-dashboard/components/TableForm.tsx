import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
// Sửa lỗi Import: Dùng Alias chuẩn và import type
import type { Table, CreateTableDto, UpdateTableDto } from '@shared/types/table';
import { tableApi } from '../../../services/tableApi';

interface TableFormProps {
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
  // Handlers được truyền từ AdminPage
  onStatusChange: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;
  onRegenerateQr: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TableForm: React.FC<TableFormProps> = ({ table: initialTable, onClose, onSuccess, onStatusChange, onDelete }) => {
  const isEdit = !!initialTable;
  const [currentTable, setCurrentTable] = useState<Table | null>(initialTable);
  const [formData, setFormData] = useState<CreateTableDto | UpdateTableDto>({
    tableNumber: initialTable?.tableNumber ?? 1,
    capacity: initialTable?.capacity || 4,
    location: initialTable?.location || '',
    description: initialTable?.description || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);

  // Cập nhật formData khi prop 'table' thay đổi
  useEffect(() => {
    setCurrentTable(initialTable);
    if (initialTable) {
      setFormData({
        tableNumber: initialTable.tableNumber,
        capacity: initialTable.capacity,
        location: initialTable.location,
        description: initialTable.description || ''
      });
      setQrToken(initialTable.qrToken || null);
    } else {
      setFormData({ tableNumber: 1, capacity: 4, location: '', description: '' });
      setQrToken(null);
    }
  }, [initialTable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'capacity' || name === 'tableNumber') ? (parseInt(value) || 0) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && initialTable) {
        await tableApi.update(initialTable.id, formData);
        alert('Cập nhật bàn thành công!');
        onSuccess();
        onClose();
        return;
      }

      const createdTable = await tableApi.create(formData as CreateTableDto);
      alert('Thêm bàn thành công!');
      setCurrentTable(createdTable);
      const qrCreated = await handleAction('qr', createdTable);
      if (qrCreated) {
        onSuccess();
        onClose();
      }
      return;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi lưu bàn.';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // HÀM XỬ LÝ HÀNH ĐỘNG TRÊN MODAL
  const handleAction = async (
    actionType: 'status' | 'qr' | 'delete',
    targetTable?: Table,
  ) => {
        const tableForAction = targetTable ?? currentTable;
        if (!tableForAction || isLoading) return false;

      if (actionType === 'qr' && tableForAction.status !== 'active') {
        alert('Bàn đang ở trạng thái INACTIVE nên không thể tạo/đổi QR.');
        return false;
      }

        let success = false;
        try {
            setIsLoading(true);
            
            if (actionType === 'status') {
                await onStatusChange(tableForAction.id, tableForAction.status);
                success = true;
            } else if (actionType === 'qr') {
                const result = await tableApi.regenerateQrToken(tableForAction.id);
                setQrToken(result.token);
                setCurrentTable(prev => prev && prev.id === tableForAction.id ? { ...prev, qrToken: result.token } : prev);
                alert(`Đã tạo lại mã QR cho bàn ${result.tableNumber} thành công!`);
                success = true;
            } else if (actionType === 'delete') {
                 await onDelete(tableForAction.id);
                 success = true;
            }

          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Không thể thực hiện thao tác.';
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            if (success && actionType !== 'qr') {
                onSuccess(); // Refresh danh sách
                if (actionType === 'delete') onClose(); // Đóng modal nếu xóa
            }
        }
        return success;
    };

  // Tạo URL đầy đủ cho QR Code
  const getQrUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu?token=${token}`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}</h3>
        
        {/* Các Input giữ nguyên */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">Số Bàn:</label>
          <input type="number" min={1} name="tableNumber" value={formData.tableNumber as number} onChange={handleChange} required className="mt-1 p-2 border rounded w-full" disabled={isLoading} />
        </div>
        <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Sức Chứa (1-20):</label>
            <input 
                type="number" 
                name="capacity" 
                value={formData.capacity} 
                onChange={handleChange} 
                min="1" 
                max="20" 
                required 
                className="mt-1 p-2 border rounded w-full"
                disabled={isLoading}
            />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Vị trí:</label>
          <input name="location" value={formData.location} onChange={handleChange} required className="mt-1 p-2 border rounded w-full" disabled={isLoading} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Mô tả (tuỳ chọn):</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className="mt-1 p-2 border rounded w-full" disabled={isLoading} rows={3} />
        </div>
        
        {/* NÚT HÀNH ĐỘNG NÂNG CAO (CHỈ HIỂN THỊ KHI CHỈNH SỬA) */}
        {isEdit && currentTable && (
            <div className="flex justify-between items-center mb-6 pt-4 border-t mt-4">
                <h4 className="text-md font-semibold text-gray-700">Hành động:</h4>
                <div className="flex space-x-2">
                    {/* NÚT XÓA */}
                     <button 
                        type="button" 
                        onClick={() => handleAction('delete')}
                        className="px-3 py-1 bg-red-100 text-red-600 border border-red-300 text-sm font-medium rounded-lg hover:bg-red-50 transition duration-150" 
                        disabled={isLoading}
                    >
                        Xóa
                    </button>
                    
                    {/* NÚT TẠO LẠI QR */}
                    <button 
                        type="button" 
                        onClick={() => handleAction('qr')}
                        className="px-3 py-1 bg-purple-100 text-purple-600 border border-purple-300 text-sm font-medium rounded-lg hover:bg-purple-50 transition duration-150" 
                        disabled={isLoading}
                    >
                        QR mới
                    </button>
                    
                    {/* NÚT THAY ĐỔI TRẠNG THÁI */}
                    <button 
                      type="button" 
                      onClick={() => handleAction('status')}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition duration-150 ${
                        currentTable.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                          : 'bg-green-100 text-green-600 border border-green-300 hover:bg-green-50'
                      }`} 
                      disabled={isLoading}
                    >
                      {currentTable.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                </div>
            </div>
        )}
        
        {/* NÚT LƯU VÀ HỦY */}
        <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 p-2 rounded" disabled={isLoading}>Hủy</button>
            <button type="submit" className="bg-green-500 text-white p-2 rounded" disabled={isLoading}>
                {isLoading ? 'Đang Xử Lý...' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Mới'}
            </button>
        </div>
      </form>

      {/* MODAL HIỂN THỊ MÃ QR */}
      {showQrModal && qrToken && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Mã QR - Bàn {currentTable.tableNumber}</h3>
            <p className="text-sm text-gray-500 mb-4">Quét mã này để truy cập menu</p>
            
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-100 mb-4">
              <QRCodeSVG 
                value={getQrUrl(qrToken)} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* URL hiển thị */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Link truy cập:</p>
              <p className="text-xs text-blue-600 break-all font-mono">{getQrUrl(qrToken)}</p>
            </div>

            {/* Nút hành động */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getQrUrl(qrToken));
                  alert('Đã copy link vào clipboard!');
                }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                📋 Copy Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  onSuccess();
                }}
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