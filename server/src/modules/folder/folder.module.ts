import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { FolderController } from "./folder.controller.js";
import { FolderService } from "./folder.service.js";
import { FolderRepository } from "./folder.repository.js";
import { FileModule } from "@/modules/file/file.module.js";
import { SharingModule } from "@/modules/sharing/sharing.module.js";

@Module({
  imports: [DatabaseModule, SharingModule, FileModule],
  controllers: [FolderController],
  providers: [FolderService, FolderRepository],
  exports: [FolderService, FolderRepository],
})
export class FolderModule {}
