import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { BREADCRUMB_OVERFLOW_LABEL } from "./breadcrumb.constants";
import type { BreadcrumbItem } from "./breadcrumb.types";

interface BreadcrumbOverflowMenuProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
}

export function BreadcrumbOverflowMenu({
  items,
  onNavigate,
}: BreadcrumbOverflowMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={BREADCRUMB_OVERFLOW_LABEL}
        className={cn(
          "flex size-6 items-center justify-center rounded-sm text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={cn(
            "z-50 min-w-40 max-w-64 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              onSelect={() => onNavigate(item.id)}
              className={cn(
                "cursor-pointer truncate rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              )}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
