import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadStatus = "queued" | "uploading" | "success" | "error" | "canceled";

interface QueuedFile {
  id: string;
  file: File;
  /** Final name used for upload — may differ from file.name if renamed for a conflict. */
  name: string;
  status: UploadStatus;
  progress: number; // 0-100
  error: string | undefined;
  wasRenamed: boolean;
  controller: AbortController;
}

export interface DataRoomUploadZoneProps {
  /**
   * Performs the actual upload (wire this to your init -> PUT -> complete flow).
   * Call onProgress(0-100) as bytes go up. Reject/throw to mark the file as failed.
   * Respect `signal` so cancel actually aborts the network request.
   */
  onUpload: (
    file: File,
    finalName: string,
    ctx: { onProgress: (pct: number) => void; signal: AbortSignal },
  ) => Promise<void>;
  /** Names already present in the destination folder, for conflict detection. */
  existingNames?: string[];
  /** Called once a file finishes uploading successfully. */
  onUploaded?: (finalName: string, file: File) => void;
  accept?: string;
  acceptLabel?: string;
  maxSizeMB?: number;
  maxConcurrent?: number;
  /** Read-only mode — hides the zone entirely and shows why. */
  disabled?: boolean;
  disabledReason?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** i;
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

function splitExt(name: string): [string, string] {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return [name, ""];
  return [name.slice(0, idx), name.slice(idx)];
}

/** invoice.pdf -> invoice (1).pdf -> invoice (2).pdf, checked against a live name set. */
function resolveConflict(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name;
  const [base, ext] = splitExt(name);
  let n = 1;
  let candidate = `${base} (${n})${ext}`;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${base} (${n})${ext}`;
  }
  return candidate;
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const DEFAULT_MAX_SIZE_MB = 50;
const DEFAULT_MAX_CONCURRENT = 3;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataRoomUploadZone({
  onUpload,
  existingNames = [],
  onUploaded,
  accept = "application/pdf",
  acceptLabel = "PDF",
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  maxConcurrent = DEFAULT_MAX_CONCURRENT,
  disabled = false,
  disabledReason = "You have read-only access to this folder.",
}: DataRoomUploadZoneProps) {
  const [items, setItems] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const runningCount = useRef(0);
  const inputId = useId();
  const listHeadingId = useId();

  const takenNames = useMemo(() => {
    const set = new Set(existingNames);
    for (const it of items) {
      if (it.status !== "canceled" && it.status !== "error") set.add(it.name);
    }
    return set;
  }, [existingNames, items]);

  const announce = useCallback((msg: string) => setAnnouncement(msg), []);

  const updateItem = useCallback((id: string, patch: Partial<QueuedFile>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }, []);

  const runUpload = useCallback(
    (item: QueuedFile) => {
      runningCount.current += 1;
      updateItem(item.id, { status: "uploading", progress: 0 });

      onUpload(item.file, item.name, {
        onProgress: (pct) =>
          updateItem(item.id, { progress: Math.max(0, Math.min(100, pct)) }),
        signal: item.controller.signal,
      })
        .then(() => {
          updateItem(item.id, { status: "success", progress: 100 });
          announce(`${item.name} uploaded.`);
          onUploaded?.(item.name, item.file);
        })
        .catch((err: unknown) => {
          if (item.controller.signal.aborted) {
            updateItem(item.id, { status: "canceled" });
            return;
          }
          const message =
            err instanceof Error ? err.message : "Upload failed. Try again.";
          updateItem(item.id, { status: "error", error: message });
          announce(`${item.name} failed to upload: ${message}`);
        })
        .finally(() => {
          runningCount.current -= 1;
          drainQueue();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUpload, onUploaded, updateItem, announce],
  );

  const drainQueue = useCallback(() => {
    setItems((prev) => {
      const queued = prev.filter((it) => it.status === "queued");
      const slots = maxConcurrent - runningCount.current;
      const toStart = queued.slice(0, Math.max(0, slots));
      toStart.forEach((it) => runUpload(it));
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxConcurrent, runUpload]);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      const rejected: { name: string; reason: string }[] = [];
      const accepted: QueuedFile[] = [];
      const localTaken = new Set(takenNames);

      for (const file of incoming) {
        if (accept && file.type !== accept) {
          rejected.push({
            name: file.name,
            reason: `Only ${acceptLabel} files are supported.`,
          });
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          rejected.push({
            name: file.name,
            reason: `Exceeds the ${maxSizeMB} MB limit.`,
          });
          continue;
        }
        const finalName = resolveConflict(file.name, localTaken);
        localTaken.add(finalName);
        accepted.push({
          id: makeId(),
          file,
          name: finalName,
          status: "queued",
          progress: 0,
          error: undefined,
          wasRenamed: finalName !== file.name,
          controller: new AbortController(),
        });
      }

      if (accepted.length > 0) {
        setItems((prev) => [...prev, ...accepted]);
        announce(
          `${accepted.length} file${accepted.length > 1 ? "s" : ""} added to the upload queue.`,
        );
      }
      if (rejected.length > 0) {
        announce(
          `${rejected.length} file${rejected.length > 1 ? "s" : ""} could not be added. ${rejected[0]?.name} — ${rejected[0]?.reason}`,
        );
        // Surface rejected files as inline error rows too, so nothing is silently dropped.
        const rejectedItems: QueuedFile[] = rejected.map((r) => ({
          id: makeId(),
          file: new File([], r.name),
          name: r.name,
          status: "error",
          progress: 0,
          error: r.reason,
          wasRenamed: false,
          controller: new AbortController(),
        }));
        setItems((prev) => [...prev, ...rejectedItems]);
      }

      // Kick off uploads on next tick so state above is committed.
      requestAnimationFrame(drainQueue);
    },
    [accept, acceptLabel, maxSizeMB, takenNames, announce, drainQueue],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onZoneKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file after removal
  };

  const cancelItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      it?.controller.abort();
      return prev;
    });
  };

  const retryItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (!it) return prev;
      const fresh: QueuedFile = {
        ...it,
        status: "queued",
        progress: 0,
        error: undefined,
        controller: new AbortController(),
      };
      return prev.map((x) => (x.id === id ? fresh : x));
    });
    requestAnimationFrame(drainQueue);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clearCompleted = () => {
    setItems((prev) =>
      prev.filter((it) => it.status !== "success" && it.status !== "canceled"),
    );
  };

  const summary = useMemo(() => {
    const failed = items.filter((i) => i.status === "error").length;
    const done = items.filter((i) => i.status === "success").length;
    const active = items.filter(
      (i) => i.status === "uploading" || i.status === "queued",
    ).length;
    return { failed, done, active, total: items.length };
  }, [items]);

  // -------------------------------------------------------------------------
  // Disabled / read-only state
  // -------------------------------------------------------------------------
  if (disabled) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-6 text-center"
        role="note"
      >
        <div className="mx-auto flex flex-col items-center gap-2">
          <CloudUpload
            className="size-6 text-muted-foreground/60"
            aria-hidden
          />
          <p className="text-sm font-medium text-muted-foreground">
            Uploading isn&apos;t available here
          </p>
          <p className="text-xs text-muted-foreground/80">{disabledReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Live region for screen readers — mirrors toast-level feedback */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${acceptLabel} files. Drag and drop, or activate to browse.`}
        aria-describedby={`${inputId}-hint`}
        onClick={openPicker}
        onKeyDown={onZoneKeyDown}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        className={[
          "cursor-pointer rounded-xl border border-dashed px-6 py-8 text-center outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-primary/50 bg-primary/3 hover:bg-primary/5",
        ].join(" ")}
      >
        <CloudUpload
          className={`mx-auto size-8 transition-transform ${isDragging ? "scale-110 text-primary" : "text-muted-foreground"}`}
          aria-hidden
        />

        <p className="mt-3 text-sm font-medium text-foreground">
          {isDragging
            ? "Drop to upload"
            : `Drag & drop ${acceptLabel} files here`}
        </p>

        <p
          id={`${inputId}-hint`}
          className="mt-1 text-xs text-muted-foreground"
        >
          or click to browse — multiple files supported, up to {maxSizeMB} MB
          each
        </p>

        {/* Real, keyboard-and-screen-reader-friendly input; not the only way in, but always present. */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple
          onChange={onInputChange}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {items.length > 0 && (
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3
              id={listHeadingId}
              className="text-xs font-medium text-muted-foreground"
            >
              {summary.total} file{summary.total > 1 ? "s" : ""}
              {summary.active > 0 && ` · ${summary.active} uploading`}
              {summary.failed > 0 && ` · ${summary.failed} failed`}
            </h3>
            {summary.done + summary.failed === summary.total &&
              summary.total > 0 && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Clear finished
                </button>
              )}
          </div>

          <ul
            aria-labelledby={listHeadingId}
            className="divide-y divide-border"
          >
            {items.map((it) => (
              <UploadRow
                key={it.id}
                item={it}
                onCancel={() => cancelItem(it.id)}
                onRetry={() => retryItem(it.id)}
                onRemove={() => removeItem(it.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function UploadRow({
  item,
  onCancel,
  onRetry,
  onRemove,
}: {
  item: QueuedFile;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <FileText
        className="size-4 shrink-0 text-muted-foreground/70"
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm text-foreground" title={item.name}>
            {item.name}
          </span>
          {item.file.size > 0 && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatBytes(item.file.size)}
            </span>
          )}
        </div>

        {item.wasRenamed && item.status !== "error" && (
          <p className="mt-0.5 text-xs text-amber-600">
            A file named &ldquo;{item.file.name}&rdquo; already exists here —
            renamed to avoid overwriting it.
          </p>
        )}

        {item.status === "uploading" && (
          <div
            className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={item.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Uploading ${item.name}, ${item.progress}%`}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {item.status === "error" && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {item.error}
          </p>
        )}

        {item.status === "canceled" && (
          <p className="mt-0.5 text-xs text-muted-foreground">Canceled</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.status === "uploading" && (
          <>
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            <button
              type="button"
              onClick={onCancel}
              aria-label={`Cancel upload of ${item.name}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-4" />
            </button>
          </>
        )}

        {item.status === "success" && (
          <CheckCircle2
            className="size-4 text-emerald-600"
            aria-label={`${item.name} uploaded successfully`}
          />
        )}

        {(item.status === "error" || item.status === "canceled") && (
          <>
            <button
              type="button"
              onClick={onRetry}
              aria-label={`Retry upload of ${item.name}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.name} from the list`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-4" />
            </button>
          </>
        )}

        {item.status === "queued" && (
          <span className="text-xs text-muted-foreground">Waiting…</span>
        )}
      </div>
    </li>
  );
}
