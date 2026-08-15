import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DataRoomRepository } from "./data-room.repository.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { DataRoomResponseDto } from "./dto/data-room-response.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";

@Injectable()
export class DataRoomService {
  constructor(private readonly dataRoomRepository: DataRoomRepository) {}

  async createDataRoom(
    ownerId: string,
    createDataRoomDto: CreateDataRoomDto,
  ): Promise<DataRoomResponseDto> {
    const dataRoom = await this.dataRoomRepository.createDataRoom(ownerId, createDataRoomDto);

    return this.toResponseDto(dataRoom);
  }

  async listDataRoomsForOwner(ownerId: string): Promise<DataRoomResponseDto[]> {
    const dataRooms = await this.dataRoomRepository.findDataRoomsByOwnerId(ownerId);

    return dataRooms.map((dataRoom) => this.toResponseDto(dataRoom));
  }

  async getDataRoomById(
    dataRoomId: string,
    requestingUserId: string,
  ): Promise<DataRoomResponseDto> {
    const dataRoom = await this.findOwnedDataRoomOrThrow(dataRoomId, requestingUserId);

    return this.toResponseDto(dataRoom);
  }

  async updateDataRoom(
    dataRoomId: string,
    requestingUserId: string,
    updateDataRoomDto: UpdateDataRoomDto,
  ): Promise<DataRoomResponseDto> {
    await this.findOwnedDataRoomOrThrow(dataRoomId, requestingUserId);

    const updatedDataRoom = await this.dataRoomRepository.updateDataRoom(
      dataRoomId,
      updateDataRoomDto,
    );

    return this.toResponseDto(updatedDataRoom);
  }

  private async findOwnedDataRoomOrThrow(dataRoomId: string, requestingUserId: string) {
    const dataRoom = await this.dataRoomRepository.findDataRoomById(dataRoomId);

    if (!dataRoom || dataRoom.ownerId !== requestingUserId) {
      throw new NotFoundException("Data room not found");
    }

    return dataRoom;
  }

  private toResponseDto(dataRoom: unknown): DataRoomResponseDto {
    return plainToInstance(DataRoomResponseDto, dataRoom, { excludeExtraneousValues: true });
  }
}
