import axios from 'axios';
// Import từ shared types
import { type Table,type CreateTableDto,type UpdateTableDto,type UpdateTableStatusDto,type TableQueryDto,type PaginatedTables } from '@shared/types/table.d.ts';

// Giả định bạn đã cấu hình proxy trong vite.config.ts để chuyển tiếp /api sang NestJS
const API_BASE_URL = '/api/tables'; 

export const tableApi = {
    getAll: async (query: TableQueryDto): Promise<PaginatedTables> => {
        const response = await axios.get(API_BASE_URL, { params: query });
        return response.data; // Trả về { data, total, page, limit }
    },

    create: async (data: CreateTableDto): Promise<Table> => {
        const response = await axios.post(API_BASE_URL, data);
        return response.data;
    },

    update: async (id: string, data: UpdateTableDto): Promise<Table> => {
        const response = await axios.put(`${API_BASE_URL}/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, statusData: UpdateTableStatusDto): Promise<Table> => {
        const response = await axios.patch(`${API_BASE_URL}/${id}/status`, statusData);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/${id}`);
    },
    
    // ** Tương tác với Người 2 (Giả lập) **
    regenerateQrToken: async (id: string): Promise<Table> => {
        // Thực tế: POST /api/qr/regenerate/:id (endpoint của Người 2)
        // Hiện tại: Giả lập gọi API để đảm bảo luồng code của Người 1 hoạt động
        const response = await axios.post(`/api/qr/regenerate/${id}`); 
        return response.data; 
    }
};