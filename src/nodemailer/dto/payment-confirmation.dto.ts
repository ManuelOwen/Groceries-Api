import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class PaymentConfirmationDto {
  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsString()
  @IsNotEmpty()
  paymentReference: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  estimatedDeliveryTime: string;
} 