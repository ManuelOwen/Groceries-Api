import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  // create feedback
  async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<ApiResponse<Feedback>> {
    try {
      const newFeedback = this.feedbackRepository.create(createFeedbackDto);
      const savedFeedback = await this.feedbackRepository.save(newFeedback);

      return {
        success: true,
        message: 'Feedback created successfully',
        data: savedFeedback,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create feedback',
        error: error.message,
      };
    }
  }

  // find all feedbacks
  async findAll(): Promise<ApiResponse<Feedback[]>> {
    try {
      const feedbacks = await this.feedbackRepository.find({
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${feedbacks.length} feedbacks`,
        data: feedbacks,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch feedbacks',
        error: error.message,
      };
    }
  }

  // find one feedback by id
  async getFeedbackById(id: number): Promise<ApiResponse<Feedback>> {
    try {
      const feedback = await this.feedbackRepository.findOne({
        where: { id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      if (!feedback) {
        throw new NotFoundException(`Feedback with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Feedback found successfully',
        data: feedback,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find feedback with id ${id}`,
        error: error.message,
      };
    }
  }

  // find feedbacks by user id
  async getFeedbacksByUserId(userId: number): Promise<ApiResponse<Feedback[]>> {
    try {
      const feedbacks = await this.feedbackRepository.find({
        where: { user_id: userId },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${feedbacks.length} feedbacks for user ${userId}`,
        data: feedbacks,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch feedbacks for user ${userId}`,
        error: error.message,
      };
    }
  }

  // find feedbacks by status
  async getFeedbacksByStatus(status: string): Promise<ApiResponse<Feedback[]>> {
    try {
      const feedbacks = await this.feedbackRepository.find({
        where: { status: status as any },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${feedbacks.length} feedbacks with status ${status}`,
        data: feedbacks,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch feedbacks with status ${status}`,
        error: error.message,
      };
    }
  }

  // update feedback by id
  async updateFeedback(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<ApiResponse<Feedback>> {
    try {
      // Check if feedback exists
      const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });
      if (!existingFeedback) {
        throw new NotFoundException(`Feedback with id ${id} not found`);
      }

      const feedbackToUpdate = await this.feedbackRepository.preload({
        id: id,
        ...updateFeedbackDto,
      });

      if (!feedbackToUpdate) {
        throw new NotFoundException(`Feedback with id ${id} not found`);
      }

      const updatedFeedback = await this.feedbackRepository.save(feedbackToUpdate);

      return {
        success: true,
        message: 'Feedback updated successfully',
        data: updatedFeedback,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update feedback with id ${id}`,
        error: error.message,
      };
    }
  }

  // delete feedback by id
  async deleteFeedback(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if feedback exists first
      const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });
      if (!existingFeedback) {
        throw new NotFoundException(`Feedback with id ${id} not found`);
      }

      const result = await this.feedbackRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete feedback with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Feedback with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete feedback with id ${id}`,
        error: error.message,
      };
    }
  }
}
