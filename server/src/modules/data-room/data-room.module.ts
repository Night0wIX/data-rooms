import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { DataRoomController } from "./data-room.controller.js";
import { DataRoomService } from "./data-room.service.js";
import { DataRoomRepository } from "./data-room.repository.js";
import { SharingModule } from "@/modules/sharing/sharing.module.js";
import { FolderModule } from "@/modules/folder/folder.module.js";
import { FileModule } from "@/modules/file/file.module.js";

@Module({
  imports: [DatabaseModule, SharingModule, FolderModule, FileModule],
  controllers: [DataRoomController],
  providers: [DataRoomService, DataRoomRepository],
  exports: [DataRoomService],
})
export class DataRoomModule {}
