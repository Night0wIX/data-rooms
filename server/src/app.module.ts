import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { AuthModule } from "@/modules/auth/index.js";
import { UserModule } from "@/modules/user/index.js";
import { DataRoomModule } from "@/modules/data-room/index.js";
import { FileModule } from "@/modules/file/index.js";
import { FolderModule } from "@/modules/folder/index.js";
import { SharingModule } from "@/modules/sharing/sharing.module.js";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    SharingModule,
    DataRoomModule,
    FileModule,
    FolderModule,
  ],
})
export class AppModule {}
