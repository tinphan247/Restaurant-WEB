import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // 1. Tính tổng tiền
    const totalAmount = createOrderDto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Tạo Order
    const order = this.orderRepo.create({
      table_id: createOrderDto.table_id,
      total_amount: totalAmount,
      status: 'pending'
    });
    const savedOrder = await this.orderRepo.save(order);

    // 3. Tạo Order Items
    const items = createOrderDto.items.map(item => this.orderItemRepo.create({
      ...item,
      order_id: savedOrder.id
    }));
    await this.orderItemRepo.save(items);

    return this.findOne(savedOrder.id);
  }

  findAll() {
    return this.orderRepo.find({ relations: ['items'] });
  }

  findOne(id: string) {
    return this.orderRepo.findOne({ where: { id }, relations: ['items'] });
  }
  
  async updateStatus(id: string, status: string) {
      await this.orderRepo.update(id, { status });
      return this.findOne(id);
  }
}