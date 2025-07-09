import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { AtGuard } from 'src/auth/token/token.guard';
import { Public, Roles } from 'src/auth/decorators';
import { Role } from '../users/entities/user.entity';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('feedbacks')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  // create feedback
  @Post()
  @Roles(Role.USER, Role.ADMIN, Role.DRIVER) // Users and admins can create feedback
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<ApiResponse<Feedback>> {
    return this.feedbacksService.createFeedback(createFeedbackDto);
  }

  // get all feedbacks (admin only)
  @Get()
  @Roles(Role.ADMIN)
  async findAllFeedbacks(): Promise<ApiResponse<Feedback[]>> {
    return this.feedbacksService.findAll();
  }

  // get feedback by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER) // Admin can see all, users can see their own (to be enforced in service if needed)
  async getFeedbackById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Feedback>> {
    return this.feedbacksService.getFeedbackById(id);
  }

  // get feedbacks by user id
  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER) // Admin can see all, users can see their own
  async getFeedbacksByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<Feedback[]>> {
    return this.feedbacksService.getFeedbacksByUserId(userId);
  }

  // get feedbacks by status (admin only)
  @Get('status/:status')
  @Roles(Role.ADMIN)
  async getFeedbacksByStatus(
    @Param('status') status: string,
  ): Promise<ApiResponse<Feedback[]>> {
    return this.feedbacksService.getFeedbacksByStatus(status);
  }

  // update feedback by id (admin only for status updates, users for their own content)
  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async updateFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<ApiResponse<Feedback>> {
    return this.feedbacksService.updateFeedback(id, updateFeedbackDto);
  }

  // delete feedback by id (admin only)
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteFeedback(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.feedbacksService.deleteFeedback(id);
  }
}
