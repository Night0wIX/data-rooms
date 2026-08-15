import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Prisma } from "@/generated/prisma/client.js";
import { ERROR_MESSAGES, PRISMA_ERROR_CODES } from "./filter.constants.js";
import type { AppErrorResponse } from "./filter.types.js";
import { hasProperty, isObject, isString } from "@/shared/types/index.js";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const response = host.switchToHttp().getResponse();
    const body = this.buildResponseBody(exception);

    httpAdapter.reply(response, body, body.statusCode);
  }

  private buildResponseBody(exception: unknown): AppErrorResponse {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: ERROR_MESSAGES.UNEXPECTED };
  }

  private fromHttpException(exception: HttpException): AppErrorResponse {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (isString(response)) {
      return { statusCode, message: response };
    }

    if (isObject(response)) {
      return { statusCode, ...this.extractValidationInfo(response) };
    }

    return { statusCode, message: ERROR_MESSAGES.UNEXPECTED };
  }

  // Maps DB constraint violations to HTTP semantics so services can just let
  // Prisma throw instead of pre-checking uniqueness/existence themselves.
  private fromPrismaError(exception: Prisma.PrismaClientKnownRequestError): AppErrorResponse {
    switch (exception.code) {
      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT:
        return { statusCode: HttpStatus.CONFLICT, message: ERROR_MESSAGES.UNIQUE_CONSTRAINT };
      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
        return { statusCode: HttpStatus.NOT_FOUND, message: ERROR_MESSAGES.RECORD_NOT_FOUND };
      case PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
        return { statusCode: HttpStatus.CONFLICT, message: ERROR_MESSAGES.FOREIGN_KEY_CONSTRAINT };
      default:
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: ERROR_MESSAGES.UNEXPECTED };
    }
  }

  private extractValidationInfo(
    response: Record<string, unknown>,
  ): Omit<AppErrorResponse, "statusCode"> {
    const errors = hasProperty(response, "errors")
      ? (response.errors as AppErrorResponse["errors"])
      : undefined;

    return { message: this.extractMessage(response), ...(errors && { errors }) };
  }

  private extractMessage(response: Record<string, unknown>): string {
    if (!hasProperty(response, "message")) {
      return ERROR_MESSAGES.UNEXPECTED;
    }

    const { message } = response;

    if (Array.isArray(message) && message.every(isString)) {
      return message.join(", ");
    }

    return isString(message) ? message : ERROR_MESSAGES.UNEXPECTED;
  }
}
