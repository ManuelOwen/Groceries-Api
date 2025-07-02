import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { FeedbackRating, FeedbackStatus } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
  message: string;

  @IsEnum(FeedbackRating, { message: 'Rating must be between 1 and 5' })
  @Type(() => Number)
  rating: FeedbackRating;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Subject must not exceed 255 characters' })
  subject?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  user_id: number;

  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Admin response must not exceed 1000 characters' })
  admin_response?: string;
}
