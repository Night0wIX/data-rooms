import { useCallback } from "react";
import { fileService } from "@/features/file/api/file.service";

interface UploadCtx {
  onProgress: (pct: number) => void;
  signal: AbortSignal;
}

const MAX_RENAME_ATTEMPTS = 50;

export function useUploadFile(folderId: string) {
  return useCallback(
    async (
      file: File,
      finalName: string,
      { onProgress, signal }: UploadCtx,
    ) => {
      let candidateName = finalName;
      let attempt = 0;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const { fileId, uploadUrl } = await fileService.initUpload({
            folderId,
            displayName: candidateName,
            mimeType: "application/pdf",
            sizeBytes: file.size,
          });

          await putWithProgress(uploadUrl, file, onProgress, signal);
          await fileService.completeUpload(fileId);
          return;
        } catch (error) {
          if (isNameConflict(error) && attempt < MAX_RENAME_ATTEMPTS) {
            attempt += 1;
            candidateName = buildSuffixedName(finalName, attempt);
            continue;
          }
          throw error;
        }
      }
    },
    [folderId],
  );
}

function isNameConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 409
  );
}

function buildSuffixedName(originalName: string, attempt: number): string {
  const dotIndex = originalName.lastIndexOf(".");
  const base = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const ext = dotIndex > 0 ? originalName.slice(dotIndex) : "";
  return `${base} (${attempt})${ext}`;
}

function putWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/pdf");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}). Try again.`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    signal.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}
