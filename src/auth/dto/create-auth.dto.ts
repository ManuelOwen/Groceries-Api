import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Role } from '../../users/entities/user.entity';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]?[1-9][\d]{0,15}$/, {
    message: 'Please provide a valid phone number',
  })
  phoneNumber: string;

  @IsEnum(Role, { message: 'Role must be a valid role (admin, user, driver)' })
  @IsOptional() // Make role optional since it defaults to user for registration
  role?: Role;
}
