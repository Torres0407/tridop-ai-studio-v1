import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalErrorHandler implements ExceptionFilter {
  private readonly logger = new Logger('GlobalErrorHandler');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      code = res.error || 'HTTP_ERROR';
    } else if (typeof exception === 'object' && exception !== null && 'message' in exception) {
      // Handle RPC exceptions that have been passed through
      const rpcError = exception as any;
      message = rpcError.message;
      if (rpcError.status) status = rpcError.status;
      if (rpcError.code) code = rpcError.code;
    }

    this.logger.error(`[${code}] ${message}`, exception instanceof Error ? exception.stack : String(exception));

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
