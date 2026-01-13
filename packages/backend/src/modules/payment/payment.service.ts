import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto';
import { IPayment } from './interfaces/payment.interface';
import { MomoService } from './momo.service';
import { OrderService } from '../order/order.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';

@Injectable()
export class PaymentService {
	private readonly logger = new Logger(PaymentService.name);

	constructor(
		private readonly repo: PaymentRepository,
		private readonly momoService?: MomoService,
		private readonly orderService?: OrderService,
		private readonly configService?: ConfigService,
	) {}

	/**
	 * 1️⃣ CREATE: Khởi tạo giao dịch thanh toán
	 * Trạng thái ban đầu: pending
	 * Bắt buộc lưu vào DB
	 */
	async create(dto: CreatePaymentDto): Promise<IPayment> {
		const now = new Date();
		const payment: Partial<IPayment> = {
			orderId: dto.orderId,
			amount: dto.amount,
			method: dto.method,
			status: PaymentStatus.PENDING,
			createdAt: now,
			updatedAt: now,
		};

		try {
			const created = await this.repo.create(payment as IPayment);
			if (!created) {
				throw new BadRequestException('Failed to create payment');
			}
			this.logger.log(
				`[PAYMENT_CREATE] paymentId=${created.id}, orderId=${created.orderId}, amount=${created.amount}, method=${created.method}, status=${created.status}, timestamp=${now.toISOString()}`,
			);
			return created;
		} catch (error) {
			this.logger.error(`[PAYMENT_CREATE_ERROR] Failed to create payment - ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	/**
	 * 2️⃣ CREATE MOMO: Khởi tạo giao dịch MoMo
	 */
	async createMomo(dto: CreateMomoPaymentDto) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[createMomo] START - orderId=${dto.orderId}, amount=${dto.amount}`);

		try {
			// ✅ VERIFY: Order phải tồn tại trước khi tạo payment
			if (this.orderService) {
				try {
					await this.orderService.findOne(dto.orderId);
				} catch (error) {
					this.logger.error(`[createMomo] ORDER_NOT_FOUND - orderId=${dto.orderId}`);
					throw new NotFoundException(`Order ${dto.orderId} not found`);
				}
			}

			// Tạo payment record
			const payment = await this.create({
				orderId: dto.orderId,
				amount: dto.amount,
				method: PaymentMethod.MOMO,
			});

			const requestId = dto.orderId;
			const momo = await this.momoService.createPayment({
				orderId: dto.orderId,
				amount: dto.amount,
				requestId,
			});

			this.logger.log(`[createMomo] SUCCESS - payUrl generated for orderId=${dto.orderId}`);
			return {
				paymentId: payment.id,
				orderId: dto.orderId,
				requestId,
				momo,
			};
		} catch (error) {
			this.logger.error(`[createMomo] ERROR - orderId=${dto.orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Failed to create MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * 3️⃣ HANDLE MOMO IPN: Xử lý callback từ MoMo
	 * Chỉ tin kết quả từ MoMo IPN / Query
	 * pending / expired → success (nếu resultCode = 0)
	 * pending / expired → failed (nếu resultCode ≠ 0)
	 */
	async handleMomoIpn(payload: any) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[PAYMENT_IPN_RECEIVED] orderId=${payload.orderId}, paymentId=${undefined}, momoPayload=${JSON.stringify(payload)}, timestamp=${new Date().toISOString()}`);

		// Verify signature
		try {
			this.momoService.verifyIpnSignature(payload);
			this.logger.log(`[PAYMENT_IPN_VERIFIED] orderId=${payload.orderId}`);
		} catch (error) {
			this.logger.error(`[PAYMENT_IPN_SIGNATURE_ERROR] orderId=${payload.orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Invalid MoMo signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		const { orderId, resultCode, transId, message } = payload;

		try {
			const payment = await this.repo.findByOrderId(orderId);
			if (!payment) {
				this.logger.error(`[PAYMENT_IPN_NOT_FOUND] Payment not found for orderId=${orderId}`);
				throw new NotFoundException('Payment not found');
			}

			// ⚔️ CHECK RACE CONDITION: Nếu đã success, skip
			if (payment.status === PaymentStatus.SUCCESS) {
				this.logger.log(
					`[PAYMENT_RACE_CONDITION] paymentId=${payment.id}, orderId=${payment.orderId}, currentStatus=${payment.status}, source=IPN, action=SKIPPED, reason=already_success, timestamp=${new Date().toISOString()}`,
				);
				return { ok: true, status: payment.status };
			}

			// ⚔️ CHECK RACE CONDITION: Nếu trạng thái không phải pending/expired, skip
			if (![PaymentStatus.PENDING, PaymentStatus.EXPIRED].includes(payment.status)) {
				this.logger.log(
					`[PAYMENT_RACE_CONDITION] paymentId=${payment.id}, orderId=${payment.orderId}, currentStatus=${payment.status}, source=IPN, action=SKIPPED, reason=invalid_state_for_ipn, timestamp=${new Date().toISOString()}`,
				);
				return { ok: true, status: payment.status };
			}

			// Update payment status based on MoMo result
			const previousStatus = payment.status;
			let newStatus: PaymentStatus;

			if (resultCode === 0) {
				newStatus = PaymentStatus.SUCCESS;
				this.logger.log(
					`[PAYMENT_SUCCESS] paymentId=${payment.id}, orderId=${payment.orderId}, previousStatus=${previousStatus}, momoTransId=${transId}, amount=${payment.amount}, timestamp=${new Date().toISOString()}`,
				);
			} else {
				newStatus = PaymentStatus.FAILED;
				this.logger.log(
					`[PAYMENT_FAILED] paymentId=${payment.id}, orderId=${payment.orderId}, previousStatus=${previousStatus}, momoErrorCode=${resultCode}, momoMessage=${message}, timestamp=${new Date().toISOString()}`,
				);
			}

			// Update database
			const updated = await this.repo.updateStatus(payment.id, newStatus, {
				momoTransId: transId,
				momoErrorCode: resultCode !== 0 ? String(resultCode) : undefined,
				momoMessage: message,
			});

			// Sync order status
			if (this.orderService && newStatus === PaymentStatus.SUCCESS) {
				try {
					// Update order status to ACCEPTED upon successful payment
					await this.orderService.updateStatus(orderId, 'ACCEPTED');
					
                    if (this.orderService.notifyPaymentStatus) {
                         this.orderService.notifyPaymentStatus(orderId, newStatus);
                    }
					this.logger.log(`[PAYMENT_ORDER_SYNC] Order updated to ACCEPTED and socket notified - orderId=${orderId}, paymentStatus=${newStatus}`);
				} catch (error) {
					this.logger.error(`[PAYMENT_ORDER_SYNC_ERROR] Failed to sync order status - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			return { ok: true, status: newStatus };
		} catch (error) {
			this.logger.error(`[PAYMENT_IPN_ERROR] orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	/**
	 * QUERY MOMO: Kiểm tra trạng thái thanh toán MoMo
	 */
	async queryMomo(orderId: string, requestId: string) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[queryMomo] START - orderId=${orderId}, requestId=${requestId}`);

		try {
			const data = await this.momoService.queryPayment(orderId, requestId);
			this.logger.log(`[queryMomo] SUCCESS - orderId=${orderId}, resultCode=${data.resultCode}`);
			return data;
		} catch (error) {
			this.logger.error(`[queryMomo] ERROR - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Failed to query MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * CRON TIMEOUT: Update payment pending ≥5 phút thành expired
	 * Chỉ update khi status = pending
	 */
	async handlePaymentTimeout(minuteThreshold: number = 5): Promise<{ processedCount: number; updatedPaymentIds: string[] }> {
		const startTime = new Date();
		this.logger.log(`[PAYMENT_CRON_START] timestamp=${startTime.toISOString()}`);

		const updatedPaymentIds: string[] = [];

		try {
			const pendingPayments = await this.repo.findPendingOlderThan(minuteThreshold);
			this.logger.debug(`[PAYMENT_CRON_FOUND] Found ${pendingPayments.length} pending payments older than ${minuteThreshold} minutes`);

			for (const payment of pendingPayments) {
				try {
					// Double check status in database to avoid race condition
					const current = await this.repo.findOne(payment.id);
					if (!current) {
						this.logger.warn(`[PAYMENT_CRON_NOT_FOUND] Payment not found - paymentId=${payment.id}`);
						continue;
					}

					// Skip if not pending
					if (current.status !== PaymentStatus.PENDING) {
						this.logger.log(
							`[PAYMENT_RACE_CONDITION] paymentId=${current.id}, orderId=${current.orderId}, currentStatus=${current.status}, source=CRON, action=SKIPPED, reason=not_pending, timestamp=${new Date().toISOString()}`,
						);
						continue;
					}

					// Update to expired with timestamp
					await this.repo.update(payment.id, { status: PaymentStatus.EXPIRED, expiredAt: new Date() });
					updatedPaymentIds.push(payment.id);

					this.logger.log(
						`[PAYMENT_CRON_UPDATE] paymentId=${payment.id}, orderId=${payment.orderId}, from=${PaymentStatus.PENDING}, to=${PaymentStatus.EXPIRED}`,
					);
					this.logger.log(
						`[PAYMENT_EXPIRED] paymentId=${payment.id}, orderId=${payment.orderId}, expiredAt=${new Date().toISOString()}, pendingDuration=${Math.round((Date.now() - payment.createdAt.getTime()) / 1000)} seconds`,
					);
				} catch (error) {
					this.logger.error(`[PAYMENT_CRON_ERROR] Failed to update payment - paymentId=${payment.id}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			const endTime = new Date();
			this.logger.log(`[PAYMENT_CRON_END] processedCount=${updatedPaymentIds.length}, timestamp=${endTime.toISOString()}`);

			return {
				processedCount: updatedPaymentIds.length,
				updatedPaymentIds,
			};
		} catch (error) {
			this.logger.error(`[PAYMENT_CRON_FATAL_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	/**
	 * DELAYED CANCEL: Hủy order sau khi payment đã expired ≥ minuteThreshold (mặc định 2 phút)
	 * Flow: CRON1 set payment = expired → CRON2 (hàm này) hủy order pending sau delay
	 */
	async cancelOrdersWithExpiredPayments(minuteThreshold: number = 2): Promise<{ processedCount: number; cancelledOrderIds: string[] }> {
		const startTime = new Date();
		this.logger.log(`[ORDER_CANCEL_DELAYED_START] minuteThreshold=${minuteThreshold}, timestamp=${startTime.toISOString()}`);

		const cancelledOrderIds: string[] = [];

		try {
			// Find payments expired >= minuteThreshold minutes ago
			const expiredPayments = await this.repo.findExpiredOlderThan(minuteThreshold);

			this.logger.debug(
				`[ORDER_CANCEL_DELAYED_FOUND] Found ${expiredPayments.length} payments expired >= ${minuteThreshold} minutes`,
			);

			for (const payment of expiredPayments) {
				try {
					if (!this.orderService) {
						this.logger.warn(`[ORDER_CANCEL_DELAYED] OrderService not available`);
						continue;
					}

					// Double check payment status (might have been updated to SUCCESS by late IPN)
					const currentPayment = await this.repo.findOne(payment.id);
					if (currentPayment && currentPayment.status === PaymentStatus.SUCCESS) {
						this.logger.log(
							`[ORDER_CANCEL_DELAYED_SKIP] Payment became successful - paymentId=${payment.id}, orderId=${payment.orderId}`,
						);
						continue;
					}

					const order = await this.orderService.findOne(payment.orderId);
					if (!order) {
						this.logger.warn(`[ORDER_CANCEL_DELAYED_NOT_FOUND] Order not found - orderId=${payment.orderId}`);
						continue;
					}

					// Only cancel if order is still pending
					if (order.status === 'pending') {
						await this.orderService.updateStatus(order.id, 'cancelled');
						cancelledOrderIds.push(order.id);
						this.logger.log(
							`[ORDER_CANCELLED_AFTER_EXPIRED_DELAY] orderId=${order.id}, paymentId=${payment.id}, expiredAt=${payment.expiredAt}, delayMinutes=${minuteThreshold}`,
						);
					} else {
						this.logger.log(
							`[ORDER_CANCEL_DELAYED_SKIP] Order not pending - orderId=${order.id}, currentStatus=${order.status}`,
						);
					}
				} catch (error) {
					this.logger.error(
						`[ORDER_CANCEL_DELAYED_ERROR] Failed to cancel order - paymentId=${payment.id}, orderId=${payment.orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
					);
				}
			}

			const endTime = new Date();
			this.logger.log(
				`[ORDER_CANCEL_DELAYED_END] processedCount=${cancelledOrderIds.length}, cancelledOrderIds=${JSON.stringify(cancelledOrderIds)}, timestamp=${endTime.toISOString()}`,
			);

			return {
				processedCount: cancelledOrderIds.length,
				cancelledOrderIds,
			};
		} catch (error) {
			this.logger.error(`[ORDER_CANCEL_DELAYED_FATAL_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findAll(): Promise<IPayment[]> {
		return this.repo.findAll();
	}

	async findOne(id: string): Promise<IPayment | null> {
		return this.repo.findOne(id);
	}

	async update(id: string, dto: UpdatePaymentDto): Promise<IPayment | null> {
		return this.repo.update(id, { ...dto, updatedAt: new Date() });
	}

	async remove(id: string): Promise<boolean> {
		return this.repo.remove(id);
	}

	handleMomoRedirect(query: Record<string, any>, res: Response): void {
		const { orderId, resultCode, transId, amount } = query;
		this.logger.log(`[handleMomoRedirect] MoMo redirect received - orderId=${orderId}, resultCode=${resultCode}`);

		const isSuccess = resultCode === '0';
		const message = isSuccess
			? 'Thanh toán thành công. Bạn có thể đóng cửa sổ này.'
			: 'Thanh toán không thành công hoặc đã hủy. Bạn có thể đóng cửa sổ này.';

		res.status(200).send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kết quả thanh toán</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f7f7f7; }
    .card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; max-width: 360px; }
    .title { font-size: 18px; margin-bottom: 12px; color: ${isSuccess ? '#16a34a' : '#dc2626'}; }
    .detail { font-size: 14px; color: #444; margin: 4px 0; }
    .small { font-size: 12px; color: #666; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">${isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</div>
    <div class="detail">${message}</div>
    ${orderId ? `<div class="detail">Mã đơn: ${orderId}</div>` : ''}
    ${transId ? `<div class="detail">Mã giao dịch: ${transId}</div>` : ''}
    ${amount ? `<div class="detail">Số tiền: ${amount}</div>` : ''}
    <div class="small">Bạn có thể đóng tab này.</div>
  </div>
</body>
</html>`);
	}
}
