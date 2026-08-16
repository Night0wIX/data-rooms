import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DataRoomRepository } from "./data-room.repository.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { DataRoomResponseDto } from "./dto/data-room-response.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";
import { ShareResourceType } from "@/generated/prisma/enums.js";
import { AccessService } from "@/modules/sharing/index.js";

@Injectable()
export class DataRoomService {
  constructor(
    private readonly dataRoomRepository: DataRoomRepository,
    private readonly accessService: AccessService,
  ) {}
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
    const dataRoom = await this.findAccessibleDataRoomOrThrow(dataRoomId, requestingUserId);

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

  async deleteDataRoom(dataRoomId: string, requestingUserId: string): Promise<void> {
    await this.findOwnedDataRoomOrThrow(dataRoomId, requestingUserId);

    await this.dataRoomRepository.deleteDataRoom(dataRoomId);
  }

  /**
   * View-level access check: passes for the owner and for any user with an
   * active share (direct or inherited) on this data room.
   */
  async findAccessibleDataRoomOrThrow(dataRoomId: string, requestingUserId: string) {
    const dataRoom = await this.dataRoomRepository.findDataRoomById(dataRoomId);

    if (!dataRoom) {
      throw new NotFoundException("Data room not found");
    }

    await this.accessService.assertCanView({
      userId: requestingUserId,
      resourceType: ShareResourceType.DATA_ROOM,
      resourceId: dataRoomId,
    });

    return dataRoom;
  }

  /**
   * Ownership-level check: used for operations that must stay restricted to
   * the owner regardless of shared access (rename, delete).
   */
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
