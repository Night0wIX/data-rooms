import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { formatValidationErrors } from './format-validation-errors.js';
import { VALIDATION_FAILED_MESSAGE } from './validation.constants.js';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        message: VALIDATION_FAILED_MESSAGE,
        errors: formatValidationErrors(errors),
      }),
  });
}