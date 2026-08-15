import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { AuthModule } from "@/modules/auth/index.js";
import { UserModule } from "@/modules/user/index.js";

@Module({
  imports: [DatabaseModule, AuthModule, UserModule],
})
export class AppModule {}
