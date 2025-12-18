import axios from 'axios';
// Import từ shared types
import type { Table, CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto, PaginatedTables } from '@shared/types/table';

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
    
    // ** API QR Code (Người 2) **
    // Tạo/Làm mới QR token cho bàn
    regenerateQrToken: async (id: string): Promise<{ token: string; tableNumber: string }> => {
        const response = await axios.post(`/api/qr/generate/${id}`); 
        return response.data; 
    },

    // Verify QR token (dùng cho ScanPage)
    verifyQrToken: async (token: string): Promise<{ valid: boolean; tableId: string; tableNumber: string; message?: string }> => {
        const response = await axios.get(`/api/qr/verify`, { params: { token } });
        return response.data;
    }
};