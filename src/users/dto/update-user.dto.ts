import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsString,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+2547\d{8}$/, {
    message: 'Please provide a valid phone number in the format +2547XXXXXXXX',
  })
  phoneNumber?: string;
}
