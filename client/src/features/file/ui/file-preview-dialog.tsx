import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface PreviewableFile {
  id: string;
  displayName: string;
}

interface FilePreviewDialogProps {
  file: PreviewableFile | null;
  getUrl: (fileId: string) => Promise<string>;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({
  file,
  getUrl,
  onOpenChange,
}: FilePreviewDialogProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    setLoading(true);
    setUrl(null);
    getUrl(file.id)
      .then(setUrl)
      .finally(() => setLoading(false));
  }, [file, getUrl]);

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="truncate">{file?.displayName}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 px-4 pb-4">
          {isLoading || !url ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading preview…
            </div>
          ) : (
            <iframe
              src={url}
              title={file?.displayName ?? "PDF preview"}
              className="h-full w-full rounded-md border border-border"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
