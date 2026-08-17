import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "@/shared/ui/input/input";

interface DataRoomSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function DataRoomSearch({
  value,
  onChange,
  placeholder = "Search files in this Data Room…",
  debounceMs = 300,
}: DataRoomSearchProps) {
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timeout = setTimeout(() => onChangeRef.current(draft), debounceMs);
    return () => clearTimeout(timeout);
  }, [draft, debounceMs]);

  const clear = () => {
    setDraft("");
    onChangeRef.current("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && draft) {
      // Don't let Escape also close a parent dialog/panel when the intent
      // here is just "clear my search text".
      event.stopPropagation();
      clear();
    }
  };

  return (
    <div className="relative max-w-md">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search files by name"
        leftIcon={<Search className="size-4" />}
        className="pr-8"
      />

      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
