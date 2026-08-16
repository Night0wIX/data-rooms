import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { FileController } from "./file.controller.js";
import { FileService } from "./file.service.js";
import { FileRepository } from "./file.repository.js";
import { FileStorageService } from "@/core/storage/storage.service.js";
import { SharingModule } from "@/modules/sharing/sharing.module.js";

@Module({
  imports: [DatabaseModule, SharingModule],
  controllers: [FileController],
  providers: [FileService, FileRepository, FileStorageService],
  exports: [FileService, FileRepository],
})
export class FileModule {}
