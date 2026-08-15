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
import { FolderService } from "./folder.service.js";
import { FolderResponseDto } from "./dto/folder-response.dto.js";
import { CreateFolderDto } from "./dto/create-folder.dto.js";
import { ListFoldersQueryDto } from "./dto/list-folders-query.dto.js";
import { BreadcrumbItemDto } from "./dto/breadcrumb-item.dto.js";
import { UpdateFolderDto } from "./dto/update-folder.dto.js";
import { FileService } from "../file/file.service.js";

@Controller(ROUTES.folders.root)
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  createFolder(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    return this.folderService.createFolder(authenticatedUser.id, createFolderDto);
  }

  @Get()
  listFolders(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() listFoldersQueryDto: ListFoldersQueryDto,
  ): Promise<FolderResponseDto[]> {
    return this.folderService.listFolders(authenticatedUser.id, listFoldersQueryDto);
  }

  @Get(ROUTES.folders.byId)
  getFolder(
    @Param("folderId") folderId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<FolderResponseDto> {
    return this.folderService.getFolderById(folderId, authenticatedUser.id);
  }

  @Get(ROUTES.folders.breadcrumb)
  getFolderBreadcrumb(
    @Param("folderId") folderId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<BreadcrumbItemDto[]> {
    return this.folderService.getFolderBreadcrumb(folderId, authenticatedUser.id);
  }

  @Patch(ROUTES.folders.byId)
  renameFolder(
    @Param("folderId") folderId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<FolderResponseDto> {
    return this.folderService.renameFolder(folderId, authenticatedUser.id, updateFolderDto);
  }

  @Delete(ROUTES.folders.byId)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(
    @Param("folderId") folderId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<void> {
    const { deletedFolderIds } = await this.folderService.deleteFolder(
      folderId,
      authenticatedUser.id,
    );

    await this.fileService.deleteFilesInFolders(deletedFolderIds);
    await this.folderService.deleteFolderRecords(deletedFolderIds);
  }
}
