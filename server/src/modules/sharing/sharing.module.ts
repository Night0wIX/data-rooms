import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { SharingController } from "./sharing.controller.js";
import { SharingService } from "./sharing.service.js";
import { SharingRepository } from "./sharing.repository.js";
import { AccessService } from "./access/access.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [SharingController],
  providers: [SharingService, SharingRepository, AccessService],
  exports: [AccessService],
})
export class SharingModule {}
