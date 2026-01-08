import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { buildMomoConfig, MomoConfig } from './config/momo.config';

interface MomoCreatePayload {
  amount: number;
  orderId: string;
  requestId?: string;
  extraData?: string;
}

export interface MomoCreateResponse {
  payUrl: string;
  deeplink?: string;
  qrCodeUrl?: string;
  resultCode: number;
  message: string;
  orderId: string;
  requestId: string;
  signature: string;
}

export interface MomoIpnPayload {
  orderId: string;
  requestId: string;
  amount: number;
  resultCode: number;
  message: string;
  orderType?: string;
  transId?: string;
  signature: string;
  [key: string]: any; // allow passthrough for fields momo may add
}

export interface MomoQueryResponse {
  resultCode: number;
  message: string;
  orderId: string;
  requestId: string;
  transId?: string;
  amount?: number;
  signature: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);
  private readonly cfg: MomoConfig;

  constructor(private readonly configService: ConfigService) {
    this.cfg = buildMomoConfig(this.configService);
    this.logger.log(`[MomoService] Initialized with IPN URL: ${this.cfg.ipnUrl}`);
    this.logger.log(`[MomoService] Initialized with Redirect URL: ${this.cfg.redirectUrl}`);
  }

  private sign(raw: string): string {
    return crypto
      .createHmac('sha256', this.cfg.secretKey)
      .update(raw)
      .digest('hex');
  }

  private buildCreateSignature(body: Record<string, any>): string {
    const raw = `accessKey=${this.cfg.accessKey}&amount=${body.amount}&extraData=${body.extraData}&ipnUrl=${body.ipnUrl}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&partnerCode=${body.partnerCode}&redirectUrl=${body.redirectUrl}&requestId=${body.requestId}&requestType=${body.requestType}`;
    return this.sign(raw);
  }

  private buildQuerySignature(orderId: string, requestId: string): string {
    const raw = `accessKey=${this.cfg.accessKey}&orderId=${orderId}&partnerCode=${this.cfg.partnerCode}&requestId=${requestId}`;
    return this.sign(raw);
  }

  verifyIpnSignature(payload: MomoIpnPayload): void {
    const { signature, ...rest } = payload;
    const skipVerify = this.configService.get<boolean>('PAYMENT_SKIP_SIGNATURE_VERIFY', false);

    // Build raw string theo MoMo IPN spec (all fields alphabetically, including accessKey)
    const fields = {
      accessKey: this.cfg.accessKey,
      ...rest,
    };
    
    const raw = Object.keys(fields)
      .sort()
      .map((k) => `${k}=${fields[k]}`)
      .join('&');
    
    const expected = this.sign(raw);
    const isValid = expected === signature;

    // Logging cho debug
    if (!isValid) {
      this.logger.warn(`[verifyIpnSignature] Signature mismatch - orderId=${payload.orderId}`);
      this.logger.debug(`[DEBUG_RAW] ${raw}`);
      this.logger.debug(`[DEBUG_EXPECTED] ${expected}`);
      this.logger.debug(`[DEBUG_GOT] ${signature}`);
      this.logger.debug(`[MoMo_SPEC] https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/`);
    }

    // Control via env
    if (skipVerify) {
      this.logger.warn(`[verifyIpnSignature] VERIFY SKIPPED (dev mode) - orderId=${payload.orderId}`);
      return;
    }

    // Strict check for production
    if (!isValid) {
      this.logger.error(`[verifyIpnSignature] FAIL - Invalid signature - orderId=${payload.orderId}`);
      throw new UnauthorizedException('Invalid MoMo signature');
    }

    this.logger.log(`[verifyIpnSignature] SUCCESS - orderId=${payload.orderId}`);
  }

  async createPayment(payload: MomoCreatePayload): Promise<MomoCreateResponse> {
    const requestId = payload.requestId ?? payload.orderId;
    const body = {
      partnerCode: this.cfg.partnerCode,
      accessKey: this.cfg.accessKey,
      requestId,
      orderId: payload.orderId,
      orderInfo: this.cfg.orderInfo,
      amount: payload.amount,
      extraData: payload.extraData ?? this.cfg.extraData ?? '',
      ipnUrl: this.cfg.ipnUrl,
      redirectUrl: this.cfg.redirectUrl,
      requestType: this.cfg.requestType,
      lang: this.cfg.lang ?? 'vi',
      autoCapture: this.cfg.autoCapture ?? true,
    } as const;

    const signature = this.buildCreateSignature(body);
    const momoRequest = { ...body, signature };

    this.logger.log(`[createPayment] START - orderId=${payload.orderId}, amount=${payload.amount}, ipnUrl=${this.cfg.ipnUrl}`);
    this.logger.debug(`[createPayment] Request body:`, JSON.stringify(momoRequest, null, 2));

    try {
      const res = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(momoRequest),
      });

      const data = (await res.json()) as MomoCreateResponse;
      
      this.logger.log(`[createPayment] SUCCESS - orderId=${payload.orderId}, resultCode=${data.resultCode}, payUrl=${data.payUrl ? 'generated' : 'none'}`);
      this.logger.debug(`[createPayment] Response:`, JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      this.logger.error(`[createPayment] ERROR - orderId=${payload.orderId}, error=${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }

  async queryPayment(orderId: string, requestId: string): Promise<MomoQueryResponse> {
    const signature = this.buildQuerySignature(orderId, requestId);
    const body = {
      partnerCode: this.cfg.partnerCode,
      accessKey: this.cfg.accessKey,
      requestId,
      orderId,
      signature,
      lang: this.cfg.lang ?? 'vi',
    };

    this.logger.log(`[queryPayment] START - orderId=${orderId}, requestId=${requestId}`);

    try {
      const res = await fetch('https://test-payment.momo.vn/v2/gateway/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as MomoQueryResponse;
      
      this.logger.log(`[queryPayment] SUCCESS - orderId=${orderId}, resultCode=${data.resultCode}`);
      
      return data;
    } catch (error) {
      this.logger.error(`[queryPayment] ERROR - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }
}
