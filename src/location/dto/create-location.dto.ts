import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  location_name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;
}
