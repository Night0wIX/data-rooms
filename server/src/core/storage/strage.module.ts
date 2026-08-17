import { Module } from "@nestjs/common";
import { FileStorageService } from "./storage.service.js";

@Module({
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
