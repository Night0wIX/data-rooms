import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { AuthModule } from "@/modules/auth/index.js";
import { UserModule } from "@/modules/user/index.js";
import { DataRoomModule } from "./modules/data-room/data-room.module.js";

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, DataRoomModule],
})
export class AppModule {}
