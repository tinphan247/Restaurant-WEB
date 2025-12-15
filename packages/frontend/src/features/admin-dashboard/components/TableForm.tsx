import React, { useState, useEffect } from 'react';
// Sửa lỗi Import: Dùng Alias chuẩn và import type
import { type Table, type CreateTableDto, type UpdateTableDto } from '@shared/types/table.d.ts'; 
import { tableApi } from '../../../services/tableApi';

// Sửa lỗi: Thêm các handler vào TableFormProps
interface TableFormProps {
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
  // Handlers được truyền từ AdminPage
  onStatusChange: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;
  onRegenerateQr: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TableForm: React.FC<TableFormProps> = ({ table, onClose, onSuccess, onStatusChange, onRegenerateQr, onDelete }) => {
  const isEdit = !!table;
  const [formData, setFormData] = useState<CreateTableDto | UpdateTableDto>({
    tableNumber: table?.tableNumber || '',
    capacity: table?.capacity || 4,
    location: table?.location || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Cập nhật formData khi prop 'table' thay đổi
  useEffect(() => {
    if (table) {
        setFormData({
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
        });
    } else {
        setFormData({ tableNumber: '', capacity: 4, location: '' });
    }
  }, [table]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'capacity' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && table) {
        await tableApi.update(table.id, formData);
      } else {
        await tableApi.create(formData as CreateTableDto);
      }
      alert(`${isEdit ? 'Cập nhật' : 'Thêm'} bàn thành công!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi lưu bàn.';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // HÀM XỬ LÝ HÀNH ĐỘNG TRÊN MODAL
  const handleAction = async (actionType: 'status' | 'qr' | 'delete') => {
        if (!table || isLoading) return;

        let success = false;
        try {
            setIsLoading(true);
            
            if (actionType === 'status') {
                await onStatusChange(table.id, table.status);
                success = true;
            } else if (actionType === 'qr') {
                await onRegenerateQr(table.id);
                success = true;
            } else if (actionType === 'delete') {
                 await onDelete(table.id);
                 success = true;
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            if (success) {
                onSuccess(); // Refresh danh sách
                if (actionType === 'delete') onClose(); // Đóng modal nếu xóa
            }
        }
    };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}</h3>
        
        {/* Các Input giữ nguyên */}
        <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Số Bàn (Tên):</label>
            <input name="tableNumber" value={formData.tableNumber} onChange={handleChange} required className="mt-1 p-2 border rounded w-full" disabled={isLoading} />
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
        
        {/* NÚT HÀNH ĐỘNG NÂNG CAO (CHỈ HIỂN THỊ KHI CHỈNH SỬA) */}
        {isEdit && table && (
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
                            table.status === 'active' 
                                ? 'bg-yellow-100 text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                                : 'bg-green-100 text-green-600 border border-green-300 hover:bg-green-50'
                        }`} 
                        disabled={isLoading}
                    >
                        {table.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
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
    </div>
  );
};