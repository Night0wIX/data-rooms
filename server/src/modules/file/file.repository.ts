import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma, FileStatus } from "@/generated/prisma/client.js";
import { DatabaseService } from "@/core/database/index.js";

@Injectable()
export class FileRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  findFolderById(folderId: string) {
    return this.databaseService.folder.findUnique({ where: { id: folderId } });
  }

  async createPendingFile(input: {
    folderId: string;
    dataRoomId: string;
    displayName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    uploadedById: string;
  }) {
    try {
      return await this.databaseService.file.create({
        data: { ...input, status: FileStatus.PENDING },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A file with this name already exists in this folder");
      }
      throw error;
    }
  }

  findFileById(fileId: string) {
    return this.databaseService.file.findUnique({ where: { id: fileId } });
  }

  findFileByFolderAndName(input: { folderId: string; displayName: string }) {
    return this.databaseService.file.findFirst({
      where: { folderId: input.folderId, displayName: input.displayName },
    });
  }

  listFiles(input: { dataRoomId: string; folderId?: string; searchByName?: string }) {
    return this.databaseService.file.findMany({
      where: {
        dataRoomId: input.dataRoomId,
        status: FileStatus.READY,
        ...(input.folderId ? { folderId: input.folderId } : {}),
        ...(input.searchByName
          ? { displayName: { contains: input.searchByName, mode: "insensitive" } }
          : {}),
      },
      orderBy: { displayName: "asc" },
    });
  }

  markFileAsReady(fileId: string) {
    return this.databaseService.file.update({
      where: { id: fileId },
      data: { status: FileStatus.READY },
    });
  }

  markFileAsFailed(fileId: string) {
    return this.databaseService.file.update({
      where: { id: fileId },
      data: { status: FileStatus.FAILED },
    });
  }

  async renameFile(fileId: string, displayName: string) {
    try {
      return await this.databaseService.file.update({
        where: { id: fileId },
        data: { displayName },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A file with this name already exists in this folder");
      }
      throw error;
    }
  }

  async moveFile(fileId: string, destinationFolderId: string) {
    try {
      return await this.databaseService.file.update({
        where: { id: fileId },
        data: { folderId: destinationFolderId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException(
          "A file with this name already exists in the destination folder",
        );
      }
      throw error;
    }
  }

  deleteFileById(fileId: string) {
    return this.databaseService.file.delete({ where: { id: fileId } });
  }

  deleteFilesByFolderIds(folderIds: string[]) {
    return this.databaseService.file.findMany({ where: { folderId: { in: folderIds } } });
  }

  deleteManyByFolderIds(folderIds: string[]) {
    return this.databaseService.file.deleteMany({ where: { folderId: { in: folderIds } } });
  }
}
