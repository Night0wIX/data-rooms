import { BaseApiService } from "@/shared/services/base-api.service";
import type { FileItem, ListFilesParams } from "./file.types";

interface InitFileUploadPayload {
  folderId: string;
  displayName: string;
  mimeType: "application/pdf";
  sizeBytes: number;
}

interface InitFileUploadResponse {
  fileId: string;
  uploadUrl: string;
}

class FileService extends BaseApiService {
  constructor() {
    super("/files");
  }

  async list(params: ListFilesParams): Promise<FileItem[]> {
    const { data } = await this.get<FileItem[]>(
      this.url("/", undefined, params),
    );
    return data;
  }

  async initUpload(
    payload: InitFileUploadPayload,
  ): Promise<InitFileUploadResponse> {
    const { data } = await this.post<InitFileUploadResponse>(
      this.url("/upload/init"),
      payload,
    );
    return data;
  }

  async completeUpload(fileId: string): Promise<FileItem> {
    const { data } = await this.post<FileItem>(
      this.url("/:fileId/upload/complete", { fileId }),
      {},
    );
    return data;
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    const { data } = await this.get<{ downloadUrl: string }>(
      this.url("/:fileId/download-url", { fileId }),
    );
    return data.downloadUrl;
  }

  async rename(fileId: string, displayName: string): Promise<FileItem> {
    const { data } = await this.patch<FileItem>(
      this.url("/:fileId", { fileId }),
      { displayName },
    );
    return data;
  }

  async move(fileId: string, destinationFolderId: string): Promise<FileItem> {
    const { data } = await this.patch<FileItem>(
      this.url("/:fileId/move", { fileId }),
      { destinationFolderId },
    );
    return data;
  }

  async remove(fileId: string): Promise<void> {
    await this.delete<void>(this.url("/:fileId", { fileId }));
  }
}

export const fileService = new FileService();
