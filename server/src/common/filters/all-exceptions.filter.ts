import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const isUploadException = exception instanceof Error && exception.name === 'MulterError'
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isUploadException
          ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR
    const isHttpException = exception instanceof HttpException
    const body = isHttpException ? exception.getResponse() : null
    const message = isHttpException
      ? typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message: unknown }).message
        : exception.message
      : isUploadException
        ? 'Invalid upload'
      : 'Unexpected server error'

    if (!isHttpException && !isUploadException) {
      const detail = exception instanceof Error ? exception.stack : String(exception)
      this.logger.error(`Unhandled ${request.method} ${request.url}`, detail)
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
