import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { Request, Response } from "express";

import { ApiErrorResponse } from "../dto/api-response.dto";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttpException
      ? exception.getResponse()
      : "Internal server error";

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: this.resolveErrorCode(status),
        message: this.resolveErrorMessage(errorResponse),
        details: {
          path: request.url,
          timestamp: new Date().toISOString()
        }
      }
    };

    response.status(status).json(payload);
  }

  private resolveErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }

  private resolveErrorMessage(errorResponse: unknown): string {
    if (typeof errorResponse === "string") {
      return errorResponse;
    }

    if (
      typeof errorResponse === "object" &&
      errorResponse !== null &&
      "message" in errorResponse
    ) {
      const message = (errorResponse as { message?: string | string[] }).message;
      if (Array.isArray(message)) {
        return message.join(", ");
      }
      if (typeof message === "string") {
        return message;
      }
    }

    return "Unexpected error";
  }
}
