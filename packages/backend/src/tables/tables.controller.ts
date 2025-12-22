import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TableService } from './tables.service';
// Import DTOs và Types
import {
  CreateTableDtoValidator,
  UpdateTableDtoValidator,
  UpdateTableStatusDtoValidator,
  TableQueryDtoValidator,
} from './table.dto';
import { Table, PaginatedTables } from '../../../../shared/types/table';

@Controller('tables') // /api/tables
export class TableController {
  constructor(private readonly tableService: TableService) {}

  // GET /api/tables
  @Get()
  async findAll(@Query() query: TableQueryDtoValidator): Promise<PaginatedTables> {
    return this.tableService.findAll(query);
  }

  // GET /api/tables/:id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Table> {
    return this.tableService.findOne(id);
  }

  // POST /api/tables
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTableDto: CreateTableDtoValidator): Promise<Table> {
    return this.tableService.create(createTableDto);
  }

  // PUT /api/tables/:id
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDtoValidator): Promise<Table> {
    return this.tableService.update(id, updateTableDto);
  }
  
  // PATCH /api/tables/:id/status
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateTableStatusDtoValidator): Promise<Table> {
    return this.tableService.updateStatus(id, updateStatusDto);
  }

  // DELETE /api/tables/:id (Soft Delete)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async remove(@Param('id') id: string): Promise<void> {
    return this.tableService.remove(id);
  }
}