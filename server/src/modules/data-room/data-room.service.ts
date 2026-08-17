import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DataRoomRepository } from "./data-room.repository.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { DataRoomResponseDto } from "./dto/data-room-response.dto.js";
import { DataRoomListResponseDto } from "./dto/data-room-list-response.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";
import { ShareResourceType } from "@/generated/prisma/enums.js";
import { AccessService } from "@/modules/sharing/index.js";
import { SharingRepository } from "@/modules/sharing/sharing.repository.js";
import { SharedDataRoomResponseDto } from "./dto/shared-data-room-response.dto.js";
import { DatabaseService } from "@/core/database/database.service.js";
import { FolderService } from "@/modules/folder/folder.service.js";
import { FileService } from "@/modules/file/file.service.js";

const DATA_ROOMS_PAGE_SIZE = 20;

@Injectable()
export class DataRoomService {
  constructor(
    private readonly dataRoomRepository: DataRoomRepository,
    private readonly accessService: AccessService,
    private readonly databaseService: DatabaseService,
    private readonly folderService: FolderService,
    private readonly fileService: FileService,
    private readonly sharingRepository: SharingRepository,
  ) {}

  async createDataRoom(
    ownerId: string,
    createDataRoomDto: CreateDataRoomDto,
  ): Promise<DataRoomResponseDto> {
    const dataRoom = await this.dataRoomRepository.createDataRoom(ownerId, createDataRoomDto);

    return this.toResponseDto({ ...dataRoom, role: "OWNER" as const });
  }

  async listDataRoomsForOwner(ownerId: string, cursor?: string): Promise<DataRoomListResponseDto> {
    const dataRooms = await this.dataRoomRepository.findDataRoomsByOwnerId(ownerId, cursor);

    const hasNextPage = dataRooms.length > DATA_ROOMS_PAGE_SIZE;

    const items = hasNextPage ? dataRooms.slice(0, DATA_ROOMS_PAGE_SIZE) : dataRooms;

    const nextCursor = hasNextPage ? (items.at(-1)?.id ?? null) : null;

    return {
      items: items.map((dataRoom) => this.toResponseDto({ ...dataRoom, role: "OWNER" as const })),
      nextCursor,
    };
  }

  async getDataRoomById(
    dataRoomId: string,
    requestingUserId: string,
  ): Promise<DataRoomResponseDto> {
    const dataRoom = await this.findAccessibleDataRoomOrThrow(dataRoomId, requestingUserId);

    const role = await this.accessService.getUserRole(
      ShareResourceType.DATA_ROOM,
      dataRoomId,
      requestingUserId,
    );

    return this.toResponseDto({ ...dataRoom, role: role ?? "VIEWER" });
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

    return this.toResponseDto({ ...updatedDataRoom, role: "OWNER" as const });
  }

  async deleteDataRoom(dataRoomId: string, requestingUserId: string): Promise<void> {
    await this.findOwnedDataRoomOrThrow(dataRoomId, requestingUserId);

    const folderIds = await this.folderService.findFolderIdsInDataRoom(dataRoomId);
    const fileIds = await this.fileService.deleteFilesInDataRoom(dataRoomId);

    await this.sharingRepository.deleteManyByResource(ShareResourceType.FILE, fileIds);
    await this.sharingRepository.deleteManyByResource(ShareResourceType.FOLDER, folderIds);
    await this.sharingRepository.deleteManyByResource(ShareResourceType.DATA_ROOM, [dataRoomId]);

    await this.folderService.deleteFoldersInDataRoom(dataRoomId);
    await this.dataRoomRepository.deleteDataRoom(dataRoomId);
  }

  async findAccessibleDataRoomOrThrow(dataRoomId: string, requestingUserId: string) {
    const dataRoom = await this.dataRoomRepository.findDataRoomById(dataRoomId);

    if (!dataRoom) {
      throw new NotFoundException("Data room not found");
    }

    await this.accessService.assertDataRoomVisible(dataRoomId, requestingUserId);

    return dataRoom;
  }

  async listSharedDataRooms(requestingUserId: string): Promise<SharedDataRoomResponseDto[]> {
    const entries = await this.accessService.listAccessibleEntryPointsForUser(requestingUserId);

    const entryByDataRoomId = new Map<string, (typeof entries)[number]>();
    for (const entry of entries) {
      const existing = entryByDataRoomId.get(entry.dataRoomId);
      if (!existing || entry.resourceType === ShareResourceType.DATA_ROOM) {
        entryByDataRoomId.set(entry.dataRoomId, entry);
      }
    }

    const dataRooms = await this.dataRoomRepository.findDataRoomsByIds(
      Array.from(entryByDataRoomId.keys()),
    );
    const dataRoomsById = new Map(dataRooms.map((dataRoom) => [dataRoom.id, dataRoom]));

    const results: SharedDataRoomResponseDto[] = [];

    for (const [dataRoomId, entry] of entryByDataRoomId) {
      const dataRoom = dataRoomsById.get(dataRoomId);
      if (!dataRoom || dataRoom.ownerId === requestingUserId) continue;

      let entryResourceType: "DATA_ROOM" | "FOLDER" =
        entry.resourceType === ShareResourceType.DATA_ROOM ? "DATA_ROOM" : "FOLDER";
      let entryResourceId = entry.resourceId;

      // A FILE-level share has no "browse into" target of its own — land
      // on the folder that contains it instead.
      if (entry.resourceType === ShareResourceType.FILE) {
        const file = await this.databaseService.file.findUnique({
          where: { id: entry.resourceId },
          select: { folderId: true },
        });
        if (file) entryResourceId = file.folderId;
      }

      results.push(
        plainToInstance(
          SharedDataRoomResponseDto,
          { ...dataRoom, entryResourceType, entryResourceId },
          { excludeExtraneousValues: true },
        ),
      );
    }

    return results;
  }

  private async findOwnedDataRoomOrThrow(dataRoomId: string, requestingUserId: string) {
    const dataRoom = await this.dataRoomRepository.findDataRoomById(dataRoomId);

    if (!dataRoom || dataRoom.ownerId !== requestingUserId) {
      throw new NotFoundException("Data room not found");
    }

    return dataRoom;
  }

  private toResponseDto(dataRoom: unknown): DataRoomResponseDto {
    return plainToInstance(DataRoomResponseDto, dataRoom, {
      excludeExtraneousValues: true,
    });
  }
}
