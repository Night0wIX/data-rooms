import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/core/config/env/index.js";
import { BEARER_PREFIX, IS_PUBLIC_KEY, SUPABASE_JWKS_PATH } from "../auth.constants.js";
import type { AuthenticatedRequest, SupabaseJwtPayload } from "../auth.types.js";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly jwks = createRemoteJWKSet(new URL(SUPABASE_JWKS_PATH, env.SUPABASE_URL));

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const payload = await this.verifyToken(this.extractToken(request));

    request.user = { id: payload.sub, email: payload.email };

    return true;
  }

  private extractToken(request: AuthenticatedRequest): string {
    const header = request.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException("Missing bearer token");
    }

    return header.slice(BEARER_PREFIX.length);
  }

  private async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks);
      return payload as SupabaseJwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
