import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { FileStorageModule } from "@/core/storage/index.js";
import { SharingService } from "./sharing.service.js";
import { SharingRepository } from "./sharing.repository.js";
import { AccessService } from "./access/access.service.js";
import { SharingController } from "./sharing.controller.js";

@Module({
  imports: [DatabaseModule, FileStorageModule],
  controllers: [SharingController],
  providers: [SharingService, SharingRepository, AccessService],
  exports: [AccessService],
})
export class SharingModule {}
