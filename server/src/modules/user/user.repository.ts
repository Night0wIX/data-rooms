import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/core/database/index.js";
import { AuthenticatedUser } from "@/modules/auth/auth.types.js";

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  upsertFromAuthenticatedUser(authenticatedUser: AuthenticatedUser) {
    return this.databaseService.user.upsert({
      where: { id: authenticatedUser.id },
      create: { id: authenticatedUser.id, email: authenticatedUser.email },
      update: { email: authenticatedUser.email },
    });
  }

  findUserById(userId: string) {
    return this.databaseService.user.findUniqueOrThrow({ where: { id: userId } });
  }
}
