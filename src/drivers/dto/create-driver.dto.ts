import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DriverStatus,
  VehicleType,
  DriverVerificationStatus,
} from '../entities/driver.entity';

export class CreateDriverDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  user_id: number;
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  driver_name: string;

  @IsString()
  @IsNotEmpty()
  license_number: string;

  @IsEnum(VehicleType)
  @IsOptional()
  vehicle_type?: VehicleType;

  @IsString()
  @IsOptional()
  vehicle_registration?: string;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @IsEnum(DriverVerificationStatus)
  @IsOptional()
  verification_status?: DriverVerificationStatus;

  @IsString()
  @IsOptional()
  driver_number?: string;

  //   @IsNumber()
  //   @IsOptional()
  //   @Type(() => Number)
  //   rating?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  total_deliveries?: number;
  @IsNumber()
  @Type(() => Number)
  order_id: number;
}
