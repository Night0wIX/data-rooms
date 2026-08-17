import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DataRoomRepository } from "./data-room.repository.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { DataRoomResponseDto } from "./dto/data-room-response.dto.js";
import { DataRoomListResponseDto } from "./dto/data-room-list-response.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";
import { ShareResourceType } from "@/generated/prisma/enums.js";
import { AccessService } from "@/modules/sharing/index.js";
import { SharedDataRoomResponseDto } from "./dto/shared-data-room-response.dto.js";
import { DatabaseService } from "@/core/database/database.service.js";

const DATA_ROOMS_PAGE_SIZE = 20;

@Injectable()
export class DataRoomService {
  constructor(
    private readonly dataRoomRepository: DataRoomRepository,
    private readonly accessService: AccessService,
    private readonly databaseService: DatabaseService,
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

    // Strict role for root-level actions (New folder, Share Data Room).
    // Falls back to "VIEWER" (read-only) when the user has no direct
    // DATA_ROOM-level share — e.g. someone who only has a nested folder
    // share can see this data room's name (breadcrumb) but cannot act
    // on its root, so the UI should treat them as read-only here.
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

    await this.dataRoomRepository.deleteDataRoom(dataRoomId);
  }

  async findAccessibleDataRoomOrThrow(dataRoomId: string, requestingUserId: string) {
    const dataRoom = await this.dataRoomRepository.findDataRoomById(dataRoomId);

    if (!dataRoom) {
      throw new NotFoundException("Data room not found");
    }

    // Metadata-level visibility (name/description for breadcrumbs etc.)
    // is granted to anyone with ANY active share into this data room,
    // not just a DATA_ROOM-level share. This does NOT grant access to
    // root folders/files — that's enforced separately in FolderService /
    // FileService via assertCanView({ resourceType: DATA_ROOM }).
    await this.accessService.assertDataRoomVisible(dataRoomId, requestingUserId);

    return dataRoom;
  }

  async listSharedDataRooms(requestingUserId: string): Promise<SharedDataRoomResponseDto[]> {
    const entries = await this.accessService.listAccessibleEntryPointsForUser(requestingUserId);

    // A data room can have several shares pointing into it (e.g. two
    // different folders shared separately). Keep one entry point per data
    // room — prefer a DATA_ROOM-level share when present, since it grants
    // the broadest access and makes the most useful landing page.
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
