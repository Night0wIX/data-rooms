import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { FileController } from "./file.controller.js";
import { FileService } from "./file.service.js";
import { FileRepository } from "./file.repository.js";
import { SharingModule } from "@/modules/sharing/sharing.module.js";
import { FileStorageModule } from "@/core/storage/strage.module.js";

@Module({
  imports: [DatabaseModule, SharingModule, FileStorageModule],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})
export class FileModule {}
