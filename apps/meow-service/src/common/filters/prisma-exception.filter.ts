import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Only handle Prisma errors, let everything else pass through
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception, response, request);
    }

    // Re-throw non-Prisma exceptions to be handled by other filters
    throw exception;
  }

  private isPrismaError(exception: any): boolean {
    return (
      exception.code &&
      typeof exception.code === 'string' &&
      exception.code.startsWith('P') &&
      exception.constructor.name === 'PrismaClientKnownRequestError'
    );
  }

  private handlePrismaError(exception: any, response: Response, request: any) {
    this.logger.error(
      `Prisma error: ${exception.code} - ${exception.message}`,
      exception.stack,
    );

    switch (exception.code) {
      case 'P2025': // Record not found
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;

      case 'P2002': // Unique constraint violation
        const field = exception.meta?.target || 'field';
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
          error: 'Conflict',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;

      case 'P2003': // Foreign key constraint violation
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related resource',
          error: 'Bad Request',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;

      case 'P2014': // Invalid ID (relation violation)
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid ID provided',
          error: 'Bad Request',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;

      default:
        // Log unknown Prisma errors but don't expose details to client
        this.logger.error(`Unhandled Prisma error code: ${exception.code}`);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
    }
  }
}
