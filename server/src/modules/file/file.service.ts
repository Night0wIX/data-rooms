import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FileRepository } from "./file.repository.js";
import { FileStorageService } from "@/core/storage/index.js";
import { MAXIMUM_FILE_SIZE_BYTES } from "./file.constants.js";
import { InitFileUploadDto } from "./dto/init-file-upload.dto.js";
import { InitFileUploadResponseDto } from "./dto/init-file-upload-response.dto.js";
import { DownloadUrlResponseDto } from "./dto/download-url-response.dto.js";
import { FileResponseDto } from "./dto/file-response.dto.js";
import { ListFilesQueryDto } from "./dto/list-files-query.dto.js";
import { UpdateFileDto } from "./dto/update-file.dto.js";
import { MoveFileDto } from "./dto/move-file.dto.js";
import { ShareResourceType } from "@/generated/prisma/enums.js";
import { AccessService } from "@/modules/sharing/index.js";

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly accessService: AccessService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async initFileUpload(
    requestingUserId: string,
    initFileUploadDto: InitFileUploadDto,
  ): Promise<InitFileUploadResponseDto> {
    if (initFileUploadDto.sizeBytes > MAXIMUM_FILE_SIZE_BYTES) {
      throw new BadRequestException("File exceeds the maximum allowed size");
    }

    const folder = await this.fileRepository.findFolderById(initFileUploadDto.folderId);

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    await this.accessService.assertCanEdit({
      userId: requestingUserId,
      resourceType: ShareResourceType.FOLDER,
      resourceId: folder.id,
    });

    const storageKey = this.fileStorageService.buildStorageKey({
      dataRoomId: folder.dataRoomId,
      folderId: folder.id,
    });

    const file = await this.fileRepository.createPendingFile({
      folderId: folder.id,
      dataRoomId: folder.dataRoomId,
      displayName: initFileUploadDto.displayName,
      storageKey,
      mimeType: initFileUploadDto.mimeType,
      sizeBytes: initFileUploadDto.sizeBytes,
      uploadedById: requestingUserId,
    });

    const uploadUrl = await this.fileStorageService.createSignedUploadUrl(storageKey);

    return plainToInstance(
      InitFileUploadResponseDto,
      { fileId: file.id, uploadUrl, storageKey },
      { excludeExtraneousValues: true },
    );
  }

  async completeFileUpload(fileId: string, requestingUserId: string): Promise<FileResponseDto> {
    const file = await this.findEditableFileOrThrow(fileId, requestingUserId);

    const objectExists = await this.fileStorageService.confirmObjectExists(file.storageKey);

    if (!objectExists) {
      await this.fileRepository.markFileAsFailed(fileId);
      throw new BadRequestException("Uploaded object was not found in storage");
    }

    const readyFile = await this.fileRepository.markFileAsReady(fileId);

    return this.toResponseDto(readyFile);
  }

  async listFiles(
    requestingUserId: string,
    listFilesQueryDto: ListFilesQueryDto,
  ): Promise<FileResponseDto[]> {
    if (listFilesQueryDto.folderId) {
      await this.accessService.assertCanView({
        userId: requestingUserId,
        resourceType: ShareResourceType.FOLDER,
        resourceId: listFilesQueryDto.folderId,
      });
    } else {
      await this.accessService.assertCanView({
        userId: requestingUserId,
        resourceType: ShareResourceType.DATA_ROOM,
        resourceId: listFilesQueryDto.dataRoomId,
      });
    }

    const files = await this.fileRepository.listFiles(listFilesQueryDto);
    return files.map((file) => this.toResponseDto(file));
  }

  async getFileDownloadUrl(
    fileId: string,
    requestingUserId: string,
  ): Promise<DownloadUrlResponseDto> {
    const file = await this.findViewableFileOrThrow(fileId, requestingUserId);

    const downloadUrl = await this.fileStorageService.createSignedDownloadUrl(file.storageKey);

    return plainToInstance(
      DownloadUrlResponseDto,
      { downloadUrl },
      { excludeExtraneousValues: true },
    );
  }

  async renameFile(
    fileId: string,
    requestingUserId: string,
    updateFileDto: UpdateFileDto,
  ): Promise<FileResponseDto> {
    await this.findEditableFileOrThrow(fileId, requestingUserId);

    const renamedFile = await this.fileRepository.renameFile(fileId, updateFileDto.displayName);

    return this.toResponseDto(renamedFile);
  }

  async moveFile(
    fileId: string,
    requestingUserId: string,
    moveFileDto: MoveFileDto,
  ): Promise<FileResponseDto> {
    const file = await this.findEditableFileOrThrow(fileId, requestingUserId);

    const destinationFolder = await this.fileRepository.findFolderById(
      moveFileDto.destinationFolderId,
    );

    if (!destinationFolder || destinationFolder.dataRoomId !== file.dataRoomId) {
      throw new NotFoundException("Destination folder not found");
    }

    await this.accessService.assertCanEdit({
      userId: requestingUserId,
      resourceType: ShareResourceType.FOLDER,
      resourceId: destinationFolder.id,
    });

    const movedFile = await this.fileRepository.moveFile(fileId, moveFileDto.destinationFolderId);

    return this.toResponseDto(movedFile);
  }

  async deleteFile(fileId: string, requestingUserId: string): Promise<void> {
    const file = await this.findEditableFileOrThrow(fileId, requestingUserId);

    await this.fileStorageService.deleteObject(file.storageKey);
    await this.fileRepository.deleteFileById(fileId);
  }

  async deleteFilesInFolders(folderIds: string[]): Promise<string[]> {
    const files = await this.fileRepository.deleteFilesByFolderIds(folderIds);

    for (const file of files) {
      await this.fileStorageService.deleteObject(file.storageKey);
    }

    await this.fileRepository.deleteManyByFolderIds(folderIds);

    return files.map((file) => file.id);
  }

  async deleteFilesInDataRoom(dataRoomId: string): Promise<string[]> {
    const files = await this.fileRepository.findFilesByDataRoomId(dataRoomId);

    for (const file of files) {
      await this.fileStorageService.deleteObject(file.storageKey);
    }

    await this.fileRepository.deleteManyByDataRoomId(dataRoomId);

    return files.map((file) => file.id);
  }

  private async findViewableFileOrThrow(fileId: string, requestingUserId: string) {
    const file = await this.fileRepository.findFileById(fileId);

    if (!file) {
      throw new NotFoundException("File not found");
    }

    await this.accessService.assertCanView({
      userId: requestingUserId,
      resourceType: ShareResourceType.FILE,
      resourceId: fileId,
    });

    return file;
  }

  private async findEditableFileOrThrow(fileId: string, requestingUserId: string) {
    const file = await this.fileRepository.findFileById(fileId);

    if (!file) {
      throw new NotFoundException("File not found");
    }

    await this.accessService.assertCanEdit({
      userId: requestingUserId,
      resourceType: ShareResourceType.FILE,
      resourceId: fileId,
    });

    return file;
  }

  private toResponseDto(file: unknown): FileResponseDto {
    return plainToInstance(FileResponseDto, file, { excludeExtraneousValues: true });
  }
}
