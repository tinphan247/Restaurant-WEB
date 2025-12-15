// shared/types/table.d.ts (Dùng chung cho cả BE và FE)

export type TableStatus = 'active' | 'inactive';

export interface Table {
  id: string; // UUID
  tableNumber: string;
  capacity: number;
  location: string;
  status: TableStatus;
  qrToken: string | null; // JWT String (do Người 2 quản lý)
  createdAt: string | Date; // TypeOrm thường trả về Date, JSON trả về string
  updatedAt: string | Date;
}

// Data Transfer Objects (DTOs)
export interface CreateTableDto {
  tableNumber: string;
  capacity: number;
  location: string;
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