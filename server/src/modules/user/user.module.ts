import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { DatabaseModule } from "@/core/database/index.js";
import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";
import { UserRepository } from "./user.repository.js";
import { EnsureUserExistsInterceptor } from "./ensure-user-exists.interceptor.js";

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: EnsureUserExistsInterceptor,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
