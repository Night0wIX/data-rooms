import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FolderRepository } from "./folder.repository.js";
import { CreateFolderDto } from "./dto/create-folder.dto.js";
import { FolderResponseDto } from "./dto/folder-response.dto.js";
import { ListFoldersQueryDto } from "./dto/list-folders-query.dto.js";
import { BreadcrumbItemDto } from "./dto/breadcrumb-item.dto.js";
import { UpdateFolderDto } from "./dto/update-folder.dto.js";
import { ShareResourceType } from "@/generated/prisma/enums.js";
import { AccessService } from "@/modules/sharing/index.js";

@Injectable()
export class FolderService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly accessService: AccessService,
  ) {}

  async createFolder(
    requestingUserId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    await this.accessService.assertCanEdit({
      userId: requestingUserId,
      resourceType: ShareResourceType.DATA_ROOM,
      resourceId: createFolderDto.dataRoomId,
    });

    const parentId = createFolderDto.parentFolderId ?? null;

    if (parentId) {
      await this.findFolderInDataRoomOrThrow(parentId, createFolderDto.dataRoomId);
    }

    const folder = await this.folderRepository.createFolder({
      dataRoomId: createFolderDto.dataRoomId,
      parentId,
      name: createFolderDto.name,
    });

    return this.toResponseDto({ ...folder, role: "EDITOR" as const });
  }

  async listFolders(
    requestingUserId: string,
    listFoldersQueryDto: ListFoldersQueryDto,
  ): Promise<FolderResponseDto[]> {
    const parentId = listFoldersQueryDto.parentFolderId ?? null;

    if (parentId) {
      // Listing children of a specific folder — access is checked
      // against that folder, so a folder-level share (or a share on an
      // ancestor/descendant folder) is enough. Also validates the
      // parent belongs to the given data room.
      await this.findFolderInDataRoomOrThrow(parentId, listFoldersQueryDto.dataRoomId);
      await this.accessService.assertCanView({
        userId: requestingUserId,
        resourceType: ShareResourceType.FOLDER,
        resourceId: parentId,
      });
    } else {
      // Listing the data room's root — requires a direct DATA_ROOM-level
      // share (or ownership). A folder-level share does NOT unlock this.
      await this.accessService.assertCanView({
        userId: requestingUserId,
        resourceType: ShareResourceType.DATA_ROOM,
        resourceId: listFoldersQueryDto.dataRoomId,
      });
    }

    const folders =
      parentId === null
        ? await this.folderRepository.findRootFoldersByDataRoomId(listFoldersQueryDto.dataRoomId)
        : await this.folderRepository.findChildFolders(parentId);

    const foldersWithRoles = await Promise.all(
      folders.map(async (folder) => {
        const role = await this.accessService.getUserRole(
          ShareResourceType.FOLDER,
          folder.id,
          requestingUserId,
        );
        return { ...folder, role: role ?? "VIEWER" };
      }),
    );

    return foldersWithRoles.map((folder) => this.toResponseDto(folder));
  }

  async getFolderById(folderId: string, requestingUserId: string): Promise<FolderResponseDto> {
    const folder = await this.findViewableFolderOrThrow(folderId, requestingUserId);

    const role = await this.accessService.getUserRole(
      ShareResourceType.FOLDER,
      folderId,
      requestingUserId,
    );

    return this.toResponseDto({ ...folder, role: role ?? "VIEWER" });
  }

  async getFolderBreadcrumb(
    folderId: string,
    requestingUserId: string,
  ): Promise<BreadcrumbItemDto[]> {
    await this.findViewableFolderOrThrow(folderId, requestingUserId);

    const chain = await this.folderRepository.findBreadcrumbChain(folderId);

    return chain.map((item) =>
      plainToInstance(BreadcrumbItemDto, item, { excludeExtraneousValues: true }),
    );
  }

  async renameFolder(
    folderId: string,
    requestingUserId: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<FolderResponseDto> {
    const folder = await this.findEditableFolderOrThrow(folderId, requestingUserId);

    await this.assertNameIsAvailable({
      dataRoomId: folder.dataRoomId,
      parentId: folder.parentId,
      name: updateFolderDto.name,
      excludeFolderId: folder.id,
    });

    const updatedFolder = await this.folderRepository.updateFolderName(
      folderId,
      updateFolderDto.name,
    );

    return this.toResponseDto({ ...updatedFolder, role: "EDITOR" as const });
  }

  /**
   * Returns the number of nested folders and files that would be deleted,
   * so the caller can surface a confirmation warning before deletion.
   */
  async previewFolderDeletion(
    folderId: string,
    requestingUserId: string,
  ): Promise<{ folderCount: number; fileCount: number; totalSizeBytes: string }> {
    await this.findEditableFolderOrThrow(folderId, requestingUserId);

    const subtreeFolderIds = await this.folderRepository.findSubtreeFolderIds(folderId);
    const statistics = await this.folderRepository.computeFolderSubtreeStatistics(folderId);

    return {
      folderCount: subtreeFolderIds.length - 1,
      fileCount: statistics.fileCount,
      totalSizeBytes: statistics.totalSizeBytes.toString(),
    };
  }

  async prepareFolderDeletion(folderId: string, requestingUserId: string): Promise<string[]> {
    await this.findEditableFolderOrThrow(folderId, requestingUserId);

    return this.folderRepository.findSubtreeFolderIds(folderId);
  }

  async deleteFolderRecords(folderIds: string[]): Promise<void> {
    // Deepest folders first to satisfy the Restrict FK from child to parent.
    for (const folderId of [...folderIds].reverse()) {
      await this.folderRepository.deleteFolderById(folderId);
    }
  }

  private async findFolderInDataRoomOrThrow(folderId: string, dataRoomId: string) {
    const folder = await this.folderRepository.findFolderById(folderId);

    if (!folder || folder.dataRoomId !== dataRoomId) {
      throw new NotFoundException("Folder not found");
    }

    return folder;
  }

  private async findViewableFolderOrThrow(folderId: string, requestingUserId: string) {
    const folder = await this.folderRepository.findFolderById(folderId);

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    await this.accessService.assertCanView({
      userId: requestingUserId,
      resourceType: ShareResourceType.FOLDER,
      resourceId: folderId,
    });

    return folder;
  }

  private async findEditableFolderOrThrow(folderId: string, requestingUserId: string) {
    const folder = await this.folderRepository.findFolderById(folderId);

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    await this.accessService.assertCanEdit({
      userId: requestingUserId,
      resourceType: ShareResourceType.FOLDER,
      resourceId: folderId,
    });

    return folder;
  }

  private async assertNameIsAvailable(input: {
    dataRoomId: string;
    parentId: string | null;
    name: string;
    excludeFolderId?: string;
  }): Promise<void> {
    const existingFolder = await this.folderRepository.findFolderByParentAndName({
      dataRoomId: input.dataRoomId,
      parentId: input.parentId,
      name: input.name,
    });

    if (existingFolder && existingFolder.id !== input.excludeFolderId) {
      throw new ConflictException("A folder with this name already exists in this location");
    }
  }

  private toResponseDto(folder: unknown): FolderResponseDto {
    return plainToInstance(FolderResponseDto, folder, { excludeExtraneousValues: true });
  }
}
