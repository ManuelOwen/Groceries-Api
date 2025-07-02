import { PartialType } from '@nestjs/swagger';
import { CreateCustomersSupportDto } from './create-customers-support.dto';

export class UpdateCustomersSupportDto extends PartialType(CreateCustomersSupportDto) {}
