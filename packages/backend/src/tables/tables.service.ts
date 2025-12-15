import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, Like } from 'typeorm';
import { TableEntity } from './table.entity';
// Import từ shared types
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto, Table, PaginatedTables } from '../../../../shared/types/table'; 

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(TableEntity)
    private tablesRepository: Repository<TableEntity>,
  ) {}

  // Hàm tìm kiếm có lọc/sắp xếp/phân trang
  async findAll(query: TableQueryDto): Promise<PaginatedTables> {
    const { search, location, status, sort = 'tableNumber', order = 'ASC', page = 1, limit = 10 } = query;
    
    // Điều kiện Soft Delete và lọc cơ bản
    const where: any = { deletedAt: IsNull() }; 
    if (location) where.location = location;
    if (status) where.status = status;

    // Điều kiện tìm kiếm (OR tableNumber, OR location)
    const searchConditions = search ? [
        { ...where, tableNumber: Like(`%${search}%`) },
        { ...where, location: Like(`%${search}%`) },
    ] : [where];

    const [data, total] = await this.tablesRepository.findAndCount({
        where: searchConditions,
        order: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
    });
    
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
    // 1. Validate tên bàn duy nhất (không soft deleted)
    const existingTable = await this.tablesRepository.findOne({ 
        where: { 
            tableNumber: createTableDto.tableNumber, 
            deletedAt: IsNull() 
        } 
    });

    if (existingTable) {
      throw new ConflictException(`Table number "${createTableDto.tableNumber}" already exists.`);
    }

    const newTable = this.tablesRepository.create(createTableDto);
    return this.tablesRepository.save(newTable);
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
    return this.tablesRepository.save(table);
  }
  
  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    table.deletedAt = new Date();
    await this.tablesRepository.save(table);
  }
}