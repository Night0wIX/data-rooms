import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/index.js";
import { DataRoomController } from "./data-room.controller.js";
import { DataRoomService } from "./data-room.service.js";
import { DataRoomRepository } from "./data-room.repository.js";

@Module({
  imports: [DatabaseModule],
  controllers: [DataRoomController],
  providers: [DataRoomService, DataRoomRepository],
  exports: [DataRoomService],
})
export class DataRoomModule {}
