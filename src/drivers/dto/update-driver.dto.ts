import { PartialType } from '@nestjs/swagger';
import { CreateDriverDto } from './create-driver.dto';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  verified_at = new Date();
  last_active_at = new Date();
}
