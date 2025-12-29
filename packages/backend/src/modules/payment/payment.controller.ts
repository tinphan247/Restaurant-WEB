// Payment controller
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

export class PaymentController {
	constructor(private readonly service = new PaymentService()) {}

	// POST /payment
	async create(body: CreatePaymentDto) {
		return this.service.create(body);
	}

	// GET /payment
	async findAll() {
		return this.service.findAll();
	}

	// GET /payment/:id
	async findOne(id: string) {
		return this.service.findOne(id);
	}

	// PATCH /payment/:id
	async update(id: string, body: UpdatePaymentDto) {
		return this.service.update(id, body);
	}

	// DELETE /payment/:id
	async remove(id: string) {
		return this.service.remove(id);
	}
}
