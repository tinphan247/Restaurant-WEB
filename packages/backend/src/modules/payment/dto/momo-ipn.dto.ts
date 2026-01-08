// DTO for MoMo IPN payload
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class MomoIpnDto {
  @IsOptional()
  @IsString()
  partnerCode?: string;

  @IsString()
  orderId!: string;

  @IsString()
  requestId!: string;

  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  amount!: number;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  transId?: number;

  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  resultCode!: number;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  payType?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  responseTime?: number;

  @IsOptional()
  @IsString()
  extraData?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  // Allow extra fields from MoMo
  [key: string]: any;
}
