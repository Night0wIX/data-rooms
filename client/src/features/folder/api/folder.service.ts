import { BaseApiService } from "@/shared/services/base-api.service";
import type { BreadcrumbItem, Folder, ListFoldersParams } from "./folder.types";

interface CreateFolderPayload {
  dataRoomId: string;
  parentFolderId: string | null;
  name: string;
}

export interface FolderDeletionPreview {
  folderCount: number;
  fileCount: number;
  totalSizeBytes: string;
}

class FolderService extends BaseApiService {
  constructor() {
    super("/folders");
  }

  async list(params: ListFoldersParams): Promise<Folder[]> {
    const { data } = await this.get<Folder[]>(this.url("/", undefined, params));
    return data;
  }

  async create(payload: CreateFolderPayload): Promise<Folder> {
    const { data } = await this.post<Folder>(this.url("/"), payload);
    return data;
  }

  async getById(folderId: string): Promise<Folder> {
    const { data } = await this.get<Folder>(
      this.url("/:folderId", { folderId }),
    );
    return data;
  }

  async getBreadcrumb(folderId: string): Promise<BreadcrumbItem[]> {
    const { data } = await this.get<BreadcrumbItem[]>(
      this.url("/:folderId/breadcrumb", { folderId }),
    );
    return data;
  }

  async rename(folderId: string, name: string): Promise<Folder> {
    const { data } = await this.patch<Folder>(
      this.url("/:folderId", { folderId }),
      { name },
    );
    return data;
  }

  async getDeletionPreview(folderId: string): Promise<FolderDeletionPreview> {
    const { data } = await this.get<FolderDeletionPreview>(
      this.url("/:folderId/deletion-preview", { folderId }),
    );
    return data;
  }

  async remove(folderId: string): Promise<void> {
    await this.delete<void>(this.url("/:folderId", { folderId }));
  }
}

export const folderService = new FolderService();
