import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error occurred';
    let error: string = 'Internal Server Error';

    if (exception instanceof HttpException) {
      // Handle known HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        // If validation errors are present, include them in the response
        const responseObj = exceptionResponse as Record<string, any>;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message;
        } else {
          message = responseObj.message || exceptionResponse;
        }
        error = responseObj.error || exception.name;
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;

      if (
        exception.message.includes(
          'duplicate key value violates unique constraint',
        )
      ) {
        if (exception.message.includes('email')) {
          message = {
            message: 'Email address is already registered',
            suggestion:
              'Please use a different email address or try logging in',
          };
          error = 'Conflict';
          status = HttpStatus.CONFLICT;
        } else if (exception.message.includes('phone')) {
          message = {
            message: 'Phone number is already registered',
            suggestion: 'Please use a different phone number',
          };
          error = 'Conflict';
          status = HttpStatus.CONFLICT;
        } else {
          message = {
            message: 'Duplicate entry detected',
            suggestion: 'Please check your input and try again',
          };
          error = 'Conflict';
          status = HttpStatus.CONFLICT;
        }
      } else if (exception.message.includes('not-null constraint')) {
        message = {
          message: 'Required fields are missing',
          suggestion: 'Please ensure all required fields are provided',
        };
        error = 'Bad Request';
      } else if (exception.message.includes('foreign key constraint')) {
        message = {
          message: 'Cannot perform operation due to related data',
          suggestion:
            'Please ensure all related data is valid or remove dependencies first',
        };
        error = 'Conflict';
        status = HttpStatus.CONFLICT;
      } else {
        message = {
          message: 'Database operation failed',
          suggestion: 'Please check your input and try again',
        };
        error = 'Database Error';
      }
    } else {
      // Handle unknown errors - already initialized above
      message = {
        message: 'Internal server error occurred',
        suggestion:
          'Please try again later or contact support if the problem persists',
      };
      error = 'Internal Server Error';
    }

    // Log the error for debugging
    this.logger.error(`${request.method} ${request.url} - Status: ${status}`, {
      exception:
        exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        params: request.params,
        query: request.query,
        headers: {
          'user-agent': request.get('user-agent'),
          'content-type': request.get('content-type'),
        },
      },
    });

    // Send error response
    response.status(status).json({
      success: false,
      statusCode: status,
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
