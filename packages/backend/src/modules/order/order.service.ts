import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderGateway } from './order.gateway';
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    private orderGateway: OrderGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // 1. Tính tổng tiền
    const totalAmount = createOrderDto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Tạo Order (use custom ID if provided, otherwise generate UUID)
    const order = this.orderRepo.create({
      id: createOrderDto.id || uuidv4(),
      table_id: createOrderDto.table_id,
      total_amount: totalAmount,
      status: 'pending'
    });
    const savedOrder = await this.orderRepo.save(order);
    this.logger.log(`[ORDER_CREATED] orderId=${savedOrder.id}, totalAmount=${totalAmount}`);

    // 3. Tạo Order Items
    const items = createOrderDto.items.map(item => this.orderItemRepo.create({
      ...item,
      order_id: savedOrder.id
    }));
    const savedItems = await this.orderItemRepo.save(items);
    this.logger.log(`[ORDER_ITEMS_CREATED] orderId=${savedOrder.id}, itemCount=${savedItems.length}`);
    savedItems.forEach((item, idx) => {
      this.logger.log(`  [ITEM_${idx + 1}] menu_item_id=${item.menu_item_id}, quantity=${item.quantity}, price=${item.price}`);
    });

    const fullOrder = await this.findOne(savedOrder.id);
    this.orderGateway.notifyNewOrder(fullOrder);
    return fullOrder;
  }

  findAll() {
    return this.orderRepo.find({ relations: ['items'] });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) 
      throw new NotFoundException(`Order ${id} not found`);
    return order;
  }
  
  async updateStatus(id: string, status: string) {
      await this.orderRepo.update(id, { status });
      this.orderGateway.notifyOrderStatusUpdate(id, status);
      return this.findOne(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
      await this.orderRepo.update(id, updateOrderDto);
      if (updateOrderDto.status) {
        this.orderGateway.notifyOrderStatusUpdate(id, updateOrderDto.status);
      }
      return this.findOne(id);
  }
}