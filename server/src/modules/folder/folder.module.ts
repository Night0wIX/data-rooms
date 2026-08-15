import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { DataRoomModule } from "@/modules/data-room/index.js";
import { FolderController } from "./folder.controller.js";
import { FolderService } from "./folder.service.js";
import { FolderRepository } from "./folder.repository.js";

@Module({
  imports: [DatabaseModule, DataRoomModule],
  controllers: [FolderController],
  providers: [FolderService, FolderRepository],
  exports: [FolderService, FolderRepository],
})
export class FolderModule {}
