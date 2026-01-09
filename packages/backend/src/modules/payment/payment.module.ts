import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { MomoService } from './momo.service';
import { OrderModule } from '../order/order.module';
import { Payment } from './entities/payment.entity';
import { PaymentTimeoutTask } from './tasks/payment-timeout.task';
import { PaymentCancelExpiredTask } from './tasks/payment-cancel-expired.task';

@Module({
	imports: [ConfigModule, OrderModule, TypeOrmModule.forFeature([Payment])],
	controllers: [PaymentController],
	providers: [PaymentService, PaymentRepository, MomoService, PaymentTimeoutTask, PaymentCancelExpiredTask],
	exports: [PaymentService, MomoService],
})
export class PaymentModule {}
