import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { AuthModule } from "@/modules/auth/index.js";
import { UserModule } from "@/modules/user/index.js";
import { DataRoomModule } from "@/modules/data-room/index.js";
import { FileModule } from "@/modules/file/index.js";
import { FolderModule } from "@/modules/folder/index.js";

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, DataRoomModule, FileModule, FolderModule],
})
export class AppModule {}
