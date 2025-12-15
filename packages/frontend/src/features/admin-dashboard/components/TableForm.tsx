import React, { useState, useEffect } from 'react';
import { type Table,type CreateTableDto,type UpdateTableDto } from '../../../../../../shared/types/table';
import { tableApi } from '../../../services/tableApi';

interface TableFormProps {
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TableForm: React.FC<TableFormProps> = ({ table, onClose, onSuccess }) => {
  const isEdit = !!table;
  const [formData, setFormData] = useState<CreateTableDto | UpdateTableDto>({
    tableNumber: table?.tableNumber || '',
    capacity: table?.capacity || 4,
    location: table?.location || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Cập nhật formData khi prop 'table' thay đổi (khi modal mở lần đầu)
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}</h3>
        
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