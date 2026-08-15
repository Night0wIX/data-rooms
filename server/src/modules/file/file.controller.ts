import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "@/modules/auth/auth.types.js";
import { ROUTES } from "@/shared/constants/routes.js";
import { FileService } from "./file.service.js";
import { InitFileUploadResponseDto } from "./dto/init-file-upload-response.dto.js";
import { InitFileUploadDto } from "./dto/init-file-upload.dto.js";
import { FileResponseDto } from "./dto/file-response.dto.js";
import { ListFilesQueryDto } from "./dto/list-files-query.dto.js";
import { DownloadUrlResponseDto } from "./dto/download-url-response.dto.js";
import { UpdateFileDto } from "./dto/update-file.dto.js";
import { MoveFileDto } from "./dto/move-file.dto.js";

@Controller(ROUTES.files.root)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post(ROUTES.files.initUpload)
  initFileUpload(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() initFileUploadDto: InitFileUploadDto,
  ): Promise<InitFileUploadResponseDto> {
    return this.fileService.initFileUpload(authenticatedUser.id, initFileUploadDto);
  }

  @Post(ROUTES.files.completeUpload)
  completeFileUpload(
    @Param("fileId") fileId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<FileResponseDto> {
    return this.fileService.completeFileUpload(fileId, authenticatedUser.id);
  }

  @Get()
  listFiles(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() listFilesQueryDto: ListFilesQueryDto,
  ): Promise<FileResponseDto[]> {
    return this.fileService.listFiles(authenticatedUser.id, listFilesQueryDto);
  }

  @Get(ROUTES.files.downloadUrl)
  getFileDownloadUrl(
    @Param("fileId") fileId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<DownloadUrlResponseDto> {
    return this.fileService.getFileDownloadUrl(fileId, authenticatedUser.id);
  }

  @Patch(ROUTES.files.byId)
  renameFile(
    @Param("fileId") fileId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<FileResponseDto> {
    return this.fileService.renameFile(fileId, authenticatedUser.id, updateFileDto);
  }

  @Patch(ROUTES.files.move)
  moveFile(
    @Param("fileId") fileId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() moveFileDto: MoveFileDto,
  ): Promise<FileResponseDto> {
    return this.fileService.moveFile(fileId, authenticatedUser.id, moveFileDto);
  }

  @Delete(ROUTES.files.byId)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFile(
    @Param("fileId") fileId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<void> {
    return this.fileService.deleteFile(fileId, authenticatedUser.id);
  }
}
