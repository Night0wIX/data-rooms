import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DataRoomService } from "@/modules/data-room/index.js";
import { FolderRepository } from "./folder.repository.js";
import { CreateFolderDto } from "./dto/create-folder.dto.js";
import { FolderResponseDto } from "./dto/folder-response.dto.js";
import { ListFoldersQueryDto } from "./dto/list-folders-query.dto.js";
import { BreadcrumbItemDto } from "./dto/breadcrumb-item.dto.js";
import { UpdateFolderDto } from "./dto/update-folder.dto.js";

@Injectable()
export class FolderService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly dataRoomService: DataRoomService,
  ) {}

  async createFolder(
    requestingUserId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    await this.dataRoomService.getDataRoomById(createFolderDto.dataRoomId, requestingUserId);

    const parentId = createFolderDto.parentFolderId ?? null;

    if (parentId) {
      await this.findFolderInDataRoomOrThrow(parentId, createFolderDto.dataRoomId);
    }

    await this.assertNameIsAvailable({
      dataRoomId: createFolderDto.dataRoomId,
      parentId,
      name: createFolderDto.name,
    });

    const folder = await this.folderRepository.createFolder({
      dataRoomId: createFolderDto.dataRoomId,
      parentId,
      name: createFolderDto.name,
    });

    return this.toResponseDto(folder);
  }

  async listFolders(
    requestingUserId: string,
    listFoldersQueryDto: ListFoldersQueryDto,
  ): Promise<FolderResponseDto[]> {
    await this.dataRoomService.getDataRoomById(listFoldersQueryDto.dataRoomId, requestingUserId);

    const parentId = listFoldersQueryDto.parentFolderId ?? null;

    if (parentId) {
      await this.findFolderInDataRoomOrThrow(parentId, listFoldersQueryDto.dataRoomId);
    }

    const folders =
      parentId === null
        ? await this.folderRepository.findRootFoldersByDataRoomId(listFoldersQueryDto.dataRoomId)
        : await this.folderRepository.findChildFolders(parentId);

    return folders.map((folder) => this.toResponseDto(folder));
  }

  async getFolderById(folderId: string, requestingUserId: string): Promise<FolderResponseDto> {
    const folder = await this.findAccessibleFolderOrThrow(folderId, requestingUserId);

    return this.toResponseDto(folder);
  }

  async getFolderBreadcrumb(
    folderId: string,
    requestingUserId: string,
  ): Promise<BreadcrumbItemDto[]> {
    await this.findAccessibleFolderOrThrow(folderId, requestingUserId);

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
    const folder = await this.findAccessibleFolderOrThrow(folderId, requestingUserId);

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

    return this.toResponseDto(updatedFolder);
  }

  async previewFolderDeletion(
    folderId: string,
    requestingUserId: string,
  ): Promise<{ folderCount: number; fileCount: number; totalSizeBytes: string }> {
    await this.findAccessibleFolderOrThrow(folderId, requestingUserId);

    const subtreeFolderIds = await this.folderRepository.findSubtreeFolderIds(folderId);
    const statistics = await this.folderRepository.computeFolderSubtreeStatistics(folderId);

    return {
      folderCount: subtreeFolderIds.length - 1,
      fileCount: statistics.fileCount,
      totalSizeBytes: statistics.totalSizeBytes.toString(),
    };
  }

  private async findFolderInDataRoomOrThrow(folderId: string, dataRoomId: string) {
    const folder = await this.folderRepository.findFolderById(folderId);

    if (!folder || folder.dataRoomId !== dataRoomId) {
      throw new NotFoundException("Folder not found");
    }

    return folder;
  }

  private async findAccessibleFolderOrThrow(folderId: string, requestingUserId: string) {
    const folder = await this.folderRepository.findFolderById(folderId);

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    // TODO: replace with AccessService.assertCanView('FOLDER', folderId) once the sharing module exists.
    await this.dataRoomService.getDataRoomById(folder.dataRoomId, requestingUserId);

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
