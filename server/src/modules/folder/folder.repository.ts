import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@/generated/prisma/client.js";
import { DatabaseService } from "@/core/database/index.js";

@Injectable()
export class FolderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createFolder(input: { dataRoomId: string; parentId: string | null; name: string }) {
    try {
      return await this.databaseService.folder.create({
        data: {
          dataRoomId: input.dataRoomId,
          parentId: input.parentId,
          name: input.name,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A folder with this name already exists in this location");
      }

      throw error;
    }
  }

  findFolderById(folderId: string) {
    return this.databaseService.folder.findUnique({
      where: { id: folderId },
    });
  }

  findFolderByParentAndName(input: { dataRoomId: string; parentId: string | null; name: string }) {
    return this.databaseService.folder.findFirst({
      where: {
        dataRoomId: input.dataRoomId,
        parentId: input.parentId,
        name: input.name,
      },
    });
  }

  findRootFoldersByDataRoomId(dataRoomId: string) {
    return this.databaseService.folder.findMany({
      where: {
        dataRoomId,
        parentId: null,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  findChildFolders(folderId: string) {
    return this.databaseService.folder.findMany({
      where: {
        parentId: folderId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  updateFolderName(folderId: string, name: string) {
    return this.databaseService.folder.update({
      where: { id: folderId },
      data: { name },
    });
  }

  deleteFolderById(folderId: string) {
    return this.databaseService.folder.delete({
      where: { id: folderId },
    });
  }

  /**
   * Walks up the parent chain from the given folder to the data room root.
   * Returns folders ordered from root to the given folder (inclusive).
   */
  async findBreadcrumbChain(folderId: string): Promise<Array<{ id: string; name: string }>> {
    const rows = await this.databaseService.$queryRaw<
      Array<{
        id: string;
        name: string;
        depth: number;
      }>
    >`
      WITH RECURSIVE folder_ancestor AS (
        SELECT
          id,
          name,
          "parentId",
          0 AS depth
        FROM folders
        WHERE id = ${folderId}

        UNION ALL

        SELECT
          folder.id,
          folder.name,
          folder."parentId",
          folder_ancestor.depth + 1
        FROM folders folder
        INNER JOIN folder_ancestor
          ON folder.id = folder_ancestor."parentId"
      )
      SELECT
        id,
        name,
        depth
      FROM folder_ancestor
      ORDER BY depth DESC;
    `;

    return rows.map(({ id, name }) => ({
      id,
      name,
    }));
  }

  async computeFolderSubtreeStatistics(folderId: string): Promise<{
    fileCount: number;
    totalSizeBytes: bigint;
  }> {
    const rows = await this.databaseService.$queryRaw<
      Array<{
        file_count: bigint;
        total_size_bytes: bigint | null;
      }>
    >`
      WITH RECURSIVE folder_subtree AS (
        SELECT id
        FROM folders
        WHERE id = ${folderId}

        UNION ALL

        SELECT folder.id
        FROM folders folder
        INNER JOIN folder_subtree
          ON folder."parentId" = folder_subtree.id
      )
      SELECT
        COUNT(file.id) AS file_count,
        COALESCE(SUM(file."sizeBytes"), 0) AS total_size_bytes
      FROM files file
      WHERE file."folderId" IN (
        SELECT id
        FROM folder_subtree
      );
    `;

    return {
      fileCount: Number(rows[0]?.file_count ?? 0n),
      totalSizeBytes: rows[0]?.total_size_bytes ?? 0n,
    };
  }

  async findSubtreeFolderIds(folderId: string): Promise<string[]> {
    const rows = await this.databaseService.$queryRaw<Array<{ id: string }>>`
      WITH RECURSIVE folder_subtree AS (
        SELECT id
        FROM folders
        WHERE id = ${folderId}

        UNION ALL

        SELECT folder.id
        FROM folders folder
        INNER JOIN folder_subtree
          ON folder."parentId" = folder_subtree.id
      )
      SELECT id
      FROM folder_subtree;
    `;

    return rows.map((row) => row.id);
  }
}
