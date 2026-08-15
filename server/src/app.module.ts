import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { AuthModule } from "@/modules/auth/index.js";

@Module({
  imports: [DatabaseModule, AuthModule],
})
export class AppModule {}
