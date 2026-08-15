import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/core/database/index.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";

@Injectable()
export class DataRoomRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  createDataRoom(ownerId: string, createDataRoomDto: CreateDataRoomDto) {
    return this.databaseService.dataRoom.create({
      data: { ...createDataRoomDto, ownerId },
    });
  }

  findDataRoomsByOwnerId(ownerId: string) {
    return this.databaseService.dataRoom.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  findDataRoomById(dataRoomId: string) {
    return this.databaseService.dataRoom.findUnique({
      where: { id: dataRoomId },
    });
  }

  updateDataRoom(dataRoomId: string, updateDataRoomDto: UpdateDataRoomDto) {
    return this.databaseService.dataRoom.update({
      where: { id: dataRoomId },
      data: updateDataRoomDto,
    });
  }

  deleteDataRoom(dataRoomId: string) {
    return this.databaseService.dataRoom.delete({
      where: { id: dataRoomId },
    });
  }
}
