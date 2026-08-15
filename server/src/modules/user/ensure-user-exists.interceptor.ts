import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import type { AuthenticatedRequest } from "@/modules/auth/auth.types.js";
import { UserService } from "./user.service.js";

@Injectable()
export class EnsureUserExistsInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user) {
      await this.userService.upsertFromAuthenticatedUser(request.user);
    }

    return next.handle();
  }
}
