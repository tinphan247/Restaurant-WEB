import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, Like } from 'typeorm';
import { TableEntity } from './table.entity';
// Import từ shared types
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto, Table, PaginatedTables } from '../../../../shared/types/table'; 
import { QrService } from '../qr-auth/qr.service';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(TableEntity)
    private tablesRepository: Repository<TableEntity>,
    private readonly qrService: QrService,
  ) {}

  // Hàm tìm kiếm có lọc/sắp xếp/phân trang
  // HÀM SỬA LỖI 500: Dùng createQueryBuilder
async findAll(query: TableQueryDto): Promise<PaginatedTables> {
    const { search, location, status, sort = 'tableNumber', order = 'ASC', page = 1, limit = 10 } = query;
    
    // Khởi tạo Query Builder
    const queryBuilder = this.tablesRepository.createQueryBuilder('table');

    // 1. Áp dụng Soft Delete (deletedAt IS NULL) - Luôn luôn là điều kiện AND
    queryBuilder.where('table.deletedAt IS NULL');

    // 2. Áp dụng các bộ lọc cơ bản (location, status) - Điều kiện AND
    if (location) {
        queryBuilder.andWhere('table.location = :location', { location });
    }
    if (status) {
        queryBuilder.andWhere('table.status = :status', { status });
    }

    // 3. Áp dụng tìm kiếm (search) - Điều kiện OR
    if (search) {
        // Sử dụng một OR Group để đảm bảo tìm kiếm OR không xung đột với các điều kiện AND bên trên
        queryBuilder.andWhere(
            `(table.tableNumber ILIKE :search OR table.location ILIKE :search)`,
            { search: `%${search}%` },
        );
    }

    // 4. Phân trang
    queryBuilder
        .orderBy(`table.${sort}`, order)
        .skip((page - 1) * limit)
        .take(limit);

    // 5. Thực thi truy vấn và đếm tổng số
    const [data, total] = await queryBuilder.getManyAndCount();
    
    return { data, total, page, limit }; 
}

  async findOne(id: string): Promise<TableEntity> {
    const table = await this.tablesRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found or deleted.`);
    }
    return table;
  }

 async create(createTableDto: CreateTableDto): Promise<Table> {
    // 1. Validate tên bàn duy nhất (giữ nguyên)
    const existingTable = await this.tablesRepository.findOne({ 
        where: { 
            tableNumber: createTableDto.tableNumber, 
            deletedAt: IsNull() 
        } 
    });

    if (existingTable) {
      throw new ConflictException(`Table number "${createTableDto.tableNumber}" already exists.`);
    }

    // --- KHẮC PHỤC LỖI 500: GÁN TẤT CẢ CÁC GIÁ TRỊ MẶC ĐỊNH BỊ THIẾU ---
    const now = new Date();
    const newTable = this.tablesRepository.create({
        ...createTableDto,
        status: 'active',   // Gán mặc định cho cột NOT NULL
        qrToken: null,      // Gán NULL tường minh cho cột nullable
        createdAt: now,     // Gán thời gian hiện tại
        updatedAt: now,     // Gán thời gian hiện tại
        deletedAt: null,    // BẮT BUỘC: Gán NULL tường minh cho cột Soft Delete
    });
    // -------------------------------------------------------------------

    const savedTable = await this.tablesRepository.save(newTable);

    // Tự động tạo QR token khi thêm bàn mới
    const { token } = await this.qrService.generateQrCode(savedTable.id);
    savedTable.qrToken = token;

    return savedTable;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);

    // 2. Validate tên bàn duy nhất khi cập nhật
    if (updateTableDto.tableNumber && updateTableDto.tableNumber !== table.tableNumber) {
        const existingTable = await this.tablesRepository.findOne({
            where: {
                tableNumber: updateTableDto.tableNumber,
                id: Not(id), 
                deletedAt: IsNull(),
            },
        });
        if (existingTable) {
            throw new ConflictException(`Table number "${updateTableDto.tableNumber}" already exists.`);
        }
    }

    Object.assign(table, updateTableDto);
    return this.tablesRepository.save(table);
  }

  async updateStatus(id: string, updateStatusDto: UpdateTableStatusDto): Promise<Table> {
    const table = await this.findOne(id);
    table.status = updateStatusDto.status;

    // Khi bàn bị inactive => QR không khả dụng (invalidate token hiện tại)
    if (updateStatusDto.status === 'inactive') {
      table.qrToken = null;
    }
    return this.tablesRepository.save(table);
  }
  
  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    table.deletedAt = new Date();
    await this.tablesRepository.save(table);
  }
}