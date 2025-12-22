import axios from 'axios';
// Import từ shared types
import type { Table, CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto, PaginatedTables } from '@shared/types/table';

// Lấy URL từ biến môi trường (Vercel) hoặc mặc định là localhost
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${BASE_URL}/api/tables`; 

export const tableApi = {
    getAll: async (query: TableQueryDto): Promise<PaginatedTables> => {
        const response = await axios.get(API_BASE_URL, { params: query });
        return response.data; // Trả về { data, total, page, limit }
    },

    getById: async (id: string): Promise<Table> => {
        const response = await axios.get(`${BASE_URL}/api/tables/${id}`);
        return response.data;
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
        const response = await axios.post(`${BASE_URL}/api/qr/generate/${id}`); 
        return response.data; 
    },

    // Verify QR token (dùng cho ScanPage)
    verifyQrToken: async (token: string): Promise<{ valid: boolean; tableId: string; tableNumber: string; message?: string }> => {
        const response = await axios.get(`${BASE_URL}/api/qr/verify`, { params: { token } });
        return response.data;
    },

    // Regenerate all QR codes (requirement 4.3)
    regenerateAllQrTokens: async (): Promise<{ message: string; total: number; results: any[] }> => {
        const response = await axios.post(`${BASE_URL}/api/qr/regenerate-all`);
        return response.data;
    }
};