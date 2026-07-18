// ─── libs/common/src/filters/exception.filter.ts ────────────────────────────
// Shared exception filter — maps any exception to the consistent external
// error contract. Applied globally in api-gateway.

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { currentTraceId } from '../tracing/traceContext';

@Catch()
export class SharedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SharedExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message, error } = this.classify(exception);

    this.logger.error({ status, message, error, traceId: currentTraceId() }, String(exception));

    response.status(status).json({
      statusCode: status,
      message,
      error,
      traceId: currentTraceId(),
      timestamp: new Date().toISOString(),
    });
  }

  private classify(exception: unknown): {
    status: number;
    message: string;
    error?: string;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && 'message' in (res)
          ? String((res).message)
          : exception.message;
      return { status: exception.getStatus(), message };
    }

    // Internal microservice errors bubble up as plain objects (or wrapped RpcExceptions)
    if (typeof exception === 'object' && exception !== null) {
      const e = exception as Record<string, unknown>;
      
      // Check if it is an RpcException payload wrapping an HttpException
      const rpcResponse = e.response || e.error;
      if (typeof rpcResponse === 'object' && rpcResponse !== null) {
        const nested = rpcResponse as Record<string, unknown>;
        if (typeof nested.statusCode === 'number') {
          return {
            status: nested.statusCode,
            message: String(nested.message ?? 'Internal error'),
            error: String(nested.error ?? ''),
          };
        }
      }

      if (typeof e.status === 'number' && e.status >= 400) {
          return {
            status: e.status,
            message: String(e.message ?? 'Internal error'),
            error: String(e.error ?? ''),
          };
      }

      if (typeof e.statusCode === 'number') {
        return {
          status: e.statusCode,
          message: String(e.message ?? 'Internal error'),
          error: String(e.error ?? ''),
        };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
