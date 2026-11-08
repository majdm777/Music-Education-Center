import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { isRequestId, REQUEST_ID_HEADER, resolveRequestId } from './request-id';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    // The middleware already set the ID for this response. Reuse it so the
    // error body, the response header and the log line always agree.
    const headerId = response.getHeader(REQUEST_ID_HEADER);
    const requestId = isRequestId(headerId) ? headerId : resolveRequestId(request);
    response.setHeader(REQUEST_ID_HEADER, requestId);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { statusCode: status, message: body }
          : { ...body, statusCode: status };

      response.status(status).json(payload);
      return;
    }

    const error = exception instanceof Error ? exception : new Error(String(exception));
    // encodeURI escapes CR/LF and other unsafe characters so a crafted URL
    // cannot forge extra log lines.
    const method = request.method.replace(/[^A-Z]/g, '');
    const path = encodeURI(request.originalUrl);
    this.logger.error(`${method} ${path} failed (request ${requestId})`, error.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      requestId,
    });
  }
}
