import { Body, Controller, Get, Param, Patch, Post, Delete, Query, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto';
import { MomoIpnDto } from './dto/momo-ipn.dto';
import { MomoQueryDto } from './dto/momo-query.dto';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
	constructor(private readonly service: PaymentService) {}

	// POST /payment
	@Post()
	create(@Body() body: CreatePaymentDto) {
		return this.service.create(body);
	}

	// GET /payment
	@Get()
	findAll() {
		return this.service.findAll();
	}

	// GET /payment/:id
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.service.findOne(id);
	}

	// PATCH /payment/:id
	@Patch(':id')
	update(@Param('id') id: string, @Body() body: UpdatePaymentDto) {
		return this.service.update(id, body);
	}

	// DELETE /payment/:id
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.service.remove(id);
	}

	// POST /payment/momo/create
	@Post('momo/create')
	createMomo(@Body() body: CreateMomoPaymentDto) {
		// PaymentService sẽ gọi MomoService để tạo giao dịch MoMo
		return this.service.createMomo(body);
	}

	// POST /payment/momo/ipn (callback từ MoMo)
	@Post('momo/ipn')
	handleMomoIpn(@Body() payload: MomoIpnDto) {
		console.log('[PaymentController] MoMo IPN received:', JSON.stringify(payload));
		// PaymentService sẽ verify signature và cập nhật trạng thái
		return this.service.handleMomoIpn(payload);
	}

	// GET /payment/momo/ipn/test (test endpoint để verify ngrok hoạt động)
	@Get('momo/ipn/test')
	testIpnEndpoint() {
		const timestamp = new Date().toISOString();
		console.log(`[PaymentController] IPN test endpoint called at ${timestamp}`);
		return { 
			ok: true, 
			message: 'IPN endpoint is reachable',
			timestamp 
		};
	}

	// GET /payment/momo/redirect (MoMo redirect after payment)
	@Get('momo/redirect')
	handleMomoRedirect(@Query() query: Record<string, any>, @Res() res: Response) {
		return this.service.handleMomoRedirect(query, res);
	}

	// POST /payment/momo/query (optional)
	@Post('momo/query')
	queryMomo(@Body() payload: MomoQueryDto) {
		return this.service.queryMomo(payload.orderId, payload.requestId);
	}
}
