import React, { useState, useEffect, useCallback } from 'react';
import { type Table,type TableQueryDto } from '../../../../../shared/types/table'
import { tableApi } from '../../services/tableApi';

import { FilterBar } from '../admin-dashboard/components/FilterBar';
import { TableGrid } from '../admin-dashboard/components/TableGrid';
import { TableForm } from '../admin-dashboard/components/TableForm';

export const AdminPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Trạng thái query cho Filter/Pagination
  const [query, setQuery] = useState<TableQueryDto>({ 
      status: 'active', 
      location: undefined, 
      search: undefined, 
      page: 1, 
      limit: 10 
  });

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total, page, limit } = await tableApi.getAll(query);
      setTables(data);
      setTotalItems(total);
      setQuery(prev => ({ ...prev, page, limit }));
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleOpenModal = (table: Table | null) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
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
    } catch (error) {
        alert('Xóa bàn thất bại.');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quản Lý Bàn Ăn ({totalItems} bàn)</h2>
      
      <div className="flex justify-between mb-4">
        <button 
          className="bg-blue-500 text-white p-2 rounded" 
          onClick={() => handleOpenModal(null)}
        >
          + Thêm Bàn Mới
        </button>
      </div>

      <FilterBar currentQuery={query} onQueryChange={setQuery} />

      {isLoading ? (
        <p className="text-center py-8">Đang tải dữ liệu...</p>
      ) : (
        <TableGrid 
          tables={tables} 
          onEdit={(table) => handleOpenModal(table)} 
          onStatusChange={handleStatusChange}
          onRegenerateQr={handleRegenerateQr}
          onDelete={handleDelete}
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
          onSuccess={fetchTables}
        />
      )}
    </div>
  );
};