import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NodemailerService, OrderConfirmationEmailData, PaymentConfirmationEmailData } from './nodemailer.service';
import { CreateNodemailerDto } from './dto/create-nodemailer.dto';
import { UpdateNodemailerDto } from './dto/update-nodemailer.dto';
import { PaymentConfirmationDto } from './dto/payment-confirmation.dto';
import { AtGuard } from '../auth/token/token.guard';
import { RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../users/entities/user.entity';

@Controller('email')
@UseGuards(AtGuard, RolesGuard)
export class NodemailerController {
  constructor(private readonly nodemailerService: NodemailerService) {}

  @Post('order-confirmation')
  @Roles(Role.ADMIN, Role.USER)
  async sendOrderConfirmation(@Body() emailData: CreateNodemailerDto) {
    return this.nodemailerService.sendOrderConfirmationEmail(emailData);
  }

  @Post('payment-confirmation')
  @Roles(Role.ADMIN, Role.USER)
  async sendPaymentConfirmation(@Body() emailData: PaymentConfirmationDto) {
    return this.nodemailerService.sendPaymentConfirmationEmail(emailData);
  }

  // Legacy endpoints (keeping for backward compatibility)
  @Post()
  create(@Body() createNodemailerDto: CreateNodemailerDto) {
    return this.nodemailerService.create(createNodemailerDto);
  }

  @Get()
  findAll() {
    return this.nodemailerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodemailerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNodemailerDto: UpdateNodemailerDto,
  ) {
    return this.nodemailerService.update(+id, updateNodemailerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodemailerService.remove(+id);
  }
}
