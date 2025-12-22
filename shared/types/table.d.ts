// shared/types/table.d.ts (Dùng chung cho cả BE và FE)

export type TableStatus = 'active' | 'inactive';

export interface Table {
  id: string; // UUID
  tableNumber: number;
  capacity: number;
  location: string;
  description?: string; // optional description
  status: TableStatus;
  qrToken: string | null; // JWT String (do Người 2 quản lý)
  qrTokenCreatedAt?: Date | string | null; // Timestamp khi QR token được tạo
  createdAt: string | Date; // TypeOrm thường trả về Date, JSON trả về string
  updatedAt: string | Date;
}

// Data Transfer Objects (DTOs)
export interface CreateTableDto {
  tableNumber: number;
  capacity: number;
  location: string;
  description?: string;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {
  // Có thể chứa các trường khác
}

export interface UpdateTableStatusDto {
  status: TableStatus;
}

export interface TableQueryDto {
    search?: string; 
    location?: string; 
    status?: TableStatus; 
    sort?: 'capacity' | 'tableNumber' | 'createdAt'; 
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

// Interface cho phản hồi API
export interface PaginatedTables {
    data: Table[];
    total: number;
    page: number;
    limit: number;
}