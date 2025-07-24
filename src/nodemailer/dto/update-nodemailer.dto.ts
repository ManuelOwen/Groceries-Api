import { PartialType } from '@nestjs/swagger';
import { CreateNodemailerDto } from './create-nodemailer.dto';

export class UpdateNodemailerDto extends PartialType(CreateNodemailerDto) {}
