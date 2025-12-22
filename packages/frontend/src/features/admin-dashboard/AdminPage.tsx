import React, { useState, useEffect, useCallback } from 'react';
// Sửa lỗi Import: Dùng Alias chuẩn (đã cấu hình trong vite.config.ts)
import type { Table, TableQueryDto } from '@shared/types/table';
import { tableApi } from '../../services/tableApi';

import { FilterBar } from './components/FilterBar';
import { TableGrid } from './components/TableGrid';
import { TableForm } from './components/TableForm';
import { BulkDownloadActions } from '../print-tools/components/BulkDownloadActions';

export const AdminPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Sửa lỗi: Đặt status là undefined để tải tất cả bàn ban đầu (tránh lọc ẩn)
    const [query, setQuery] = useState<TableQueryDto>({ 
      status: undefined, 
      location: undefined, 
      search: undefined, 
      sort: 'tableNumber',
      order: 'ASC',
      page: 1, 
      limit: 10 
    });

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await tableApi.getAll(query);
      setTables(data);
      setTotalItems(total);
      // SỬA LỖI LOOP: Không cập nhật query trong fetchTables, vì nó là dependency
      // Dữ liệu page/limit đã được sử dụng từ query để lấy về.
      // Nếu cần Pagination, bạn sẽ cập nhật page/limit bên ngoài hàm này.
      // setQuery(prev => ({ ...prev, page, limit })); // Đã xóa dòng này
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query]); // Giữ lại [query] là dependency để chạy lại khi filter thay đổi

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleOpenModal = (table: Table | null) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  // --- HÀM HÀNH ĐỘNG GIỮ NGUYÊN (SẼ ĐƯỢC GỌI TỪ MODAL) ---
  const handleStatusChange = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // Xác nhận trước khi vô hiệu hóa bàn
    if (newStatus === 'inactive') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn vô hiệu hóa bàn này? Bàn sẽ không nhận đơn mới.');
      if (!confirmed) return;
    }
    try {
      await tableApi.updateStatus(id, { status: newStatus });
      fetchTables();
    } catch (error) {
      alert("Cập nhật trạng thái thất bại.");
    }
  };
  
  const handleRegenerateQr = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn tạo lại mã QR? Mã cũ sẽ không còn dùng được.')) return;
    try {
        await tableApi.regenerateQrToken(id); // Gọi API Người 2
        alert('Mã QR đã được tạo lại thành công!');
        fetchTables();
    } catch (error) {
        alert('Tạo lại mã QR thất bại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA bàn này (soft delete)?')) return;
    try {
        await tableApi.remove(id);
        alert('Xóa bàn thành công.');
        fetchTables();
        return Promise.resolve(); // Trả về Promise để TableForm có thể đợi
    } catch (error) {
        alert('Xóa bàn thất bại.');
        return Promise.reject(error);
    }
  }

  // Regenerate all QR codes (requirement 4.3)
  const handleRegenerateAllQr = async () => {
    const confirmed = window.confirm(
      `⚠️ BẠN CHẮC CHẮN MUỐN TẠO LẠI TẤT CẢ MÃ QR?\n\n` +
      `Tất cả mã QR cũ sẽ không còn hiệu lực.\n` +
      `Số bàn sẽ bị ảnh hưởng: ${tables.filter(t => t.status === 'active').length}\n\n` +
      `Nhấn OK để tiếp tục.`
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const result = await tableApi.regenerateAllQrTokens();
      alert(`✅ Đã tạo lại ${result.total} mã QR thành công!`);
      fetchTables();
    } catch (error) {
      alert('❌ Lỗi khi tạo lại mã QR. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  // --------------------------------------------------------

  // Hàm được gọi khi TableForm tạo/sửa thành công
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchTables(); // Tải lại danh sách bàn
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Quản Lý Bàn Ăn ({totalItems} bàn)</h2>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto" 
          onClick={() => handleOpenModal(null)}
        >
          + Thêm Bàn Mới
        </button>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <BulkDownloadActions />
          
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:bg-gray-400 w-full sm:w-auto"
            onClick={handleRegenerateAllQr}
            disabled={isLoading || tables.filter(t => t.status === 'active').length === 0}
            title="Tạo lại tất cả mã QR cho các bàn đang hoạt động"
          >
            🔄 Tạo Lại Tất Cả QR
          </button>
        </div>
      </div>

      <FilterBar currentQuery={query} onQueryChange={setQuery} />

      {isLoading ? (
        <p className="text-center py-8">Đang tải dữ liệu...</p>
      ) : (
        <TableGrid 
          tables={tables} 
          onEdit={(table) => handleOpenModal(table)} 
          // SỬA LỖI: CHỈ TRUYỀN onEdit. Bỏ 3 props kia theo UX mới
          // onStatusChange={handleStatusChange}
          // onRegenerateQr={handleRegenerateQr}
          // onDelete={handleDelete}
        />
      )}
      
      {/* Thêm Pagination controls ở đây */}
      <div className="mt-4 text-center">
        {/* Placeholder for Pagination */}
      </div>
      
      {isModalOpen && (
        <TableForm
          table={editingTable}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          // SỬA LỖI: TRUYỀN CÁC HÀM XỬ LÝ VÀO TABLEFORM
          onStatusChange={handleStatusChange} 
          onRegenerateQr={handleRegenerateQr}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};