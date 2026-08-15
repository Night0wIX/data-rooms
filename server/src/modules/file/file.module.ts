import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { DataRoomModule } from "@/modules/data-room/index.js";
import { FileController } from "./file.controller.js";
import { FileService } from "./file.service.js";
import { FileRepository } from "./file.repository.js";
import { FileStorageService } from "@/core/storage/storage.service.js";

@Module({
  imports: [DatabaseModule, DataRoomModule],
  controllers: [FileController],
  providers: [FileService, FileRepository, FileStorageService],
  exports: [FileService, FileRepository],
})
export class FileModule {}
