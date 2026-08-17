import { Link } from "react-router-dom";
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button/button";
import { cn } from "@/shared/utils/cn";
import type { DataRoom, SharedDataRoom } from "../api/data-room.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface DataRoomCardProps {
  dataRoom: DataRoom | SharedDataRoom;
  onRename?: (dataRoom: DataRoom) => void;
  onDelete?: (dataRoom: DataRoom) => void;
}

function getCardHref(dataRoom: DataRoom | SharedDataRoom): string {
  if (
    "entryResourceType" in dataRoom &&
    dataRoom.entryResourceType === "FOLDER"
  ) {
    return `/data-rooms/${dataRoom.id}/folders/${dataRoom.entryResourceId}`;
  }
  return `/data-rooms/${dataRoom.id}`;
}

export function DataRoomCard({
  dataRoom,
  onRename,
  onDelete,
}: DataRoomCardProps) {
  const hasActions = Boolean(onRename || onDelete);
  const href = getCardHref(dataRoom);

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-4",
        "transition-colors motion-reduce:transition-none",
        "hover:border-ring/40 hover:bg-accent/40 focus-within:border-ring/40 focus-within:bg-accent/40",
      )}
    >
      <Link
        to={href}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open ${dataRoom.name}`}
      />

      <div className="flex items-start justify-between">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Folder className="size-4" aria-hidden="true" />
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="relative z-10 opacity-0 transition-opacity motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Actions for ${dataRoom.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              {onRename && (
                <DropdownMenuItem onSelect={() => onRename(dataRoom)}>
                  <Pencil className="size-4" />
                  Rename
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(dataRoom)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-3 min-w-0">
        <p
          className="truncate text-sm font-semibold text-foreground"
          title={dataRoom.name}
        >
          {dataRoom.name}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {dataRoom.description?.trim()
            ? dataRoom.description
            : "No description"}
        </p>
      </div>
    </div>
  );
}
