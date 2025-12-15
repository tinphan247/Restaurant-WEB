import { Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity } from 'typeorm';
import { type Table,type TableStatus } from '../../../../shared/types/table' // Import từ shared

@Entity('tables')
@Unique(['tableNumber']) 
export class TableEntity extends BaseEntity implements Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_number', length: 50 })
  tableNumber: string;

  @Column('int')
  capacity: number;

  @Column({ length: 100 })
  location: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: TableStatus;

  // Cột này được Người 2 sử dụng và cập nhật
  @Column({ name: 'qr_token', type: 'text', nullable: true, default: null })
  qrToken: string | null;
  
  // Dành cho Soft Delete và sắp xếp
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}