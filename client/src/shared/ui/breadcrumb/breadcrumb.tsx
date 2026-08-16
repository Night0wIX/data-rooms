import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { Tooltip } from "@/shared/ui/tooltip";
import { cn } from "@/shared/utils/cn";
import { BreadcrumbOverflowMenu } from "./breadcrumb-overflow-menu";
import {
  BREADCRUMB_DEFAULT_MAX_VISIBLE_ITEMS,
  BREADCRUMB_ITEM_MAX_WIDTH_CLASS,
  BREADCRUMB_MIN_VISIBLE_ITEMS,
  BREADCRUMB_NAV_LABEL,
  BREADCRUMB_TOOLTIP_THRESHOLD,
} from "./breadcrumb.constants";
import type { BreadcrumbItem, BreadcrumbProps } from "./breadcrumb.types";

function BreadcrumbLabel({ label }: { label: string }) {
  return (
    <Tooltip
      content={label}
      disabled={label.length <= BREADCRUMB_TOOLTIP_THRESHOLD}
    >
      <span className={cn("truncate", BREADCRUMB_ITEM_MAX_WIDTH_CLASS)}>
        {label}
      </span>
    </Tooltip>
  );
}

export function Breadcrumb({
  items,
  onNavigate,
  maxVisibleItems = BREADCRUMB_DEFAULT_MAX_VISIBLE_ITEMS,
  className,
}: BreadcrumbProps) {
  const root = items[0];

  if (!root) return null;

  const resolvedMax = Math.max(maxVisibleItems, BREADCRUMB_MIN_VISIBLE_ITEMS);
  const shouldCollapse = items.length > resolvedMax;

  const tailCount = resolvedMax - 1;
  const tail = shouldCollapse
    ? items.slice(items.length - tailCount)
    : items.slice(1);
  const hidden = shouldCollapse ? items.slice(1, items.length - tailCount) : [];

  const visible: (BreadcrumbItem | { overflow: true })[] = shouldCollapse
    ? [root, { overflow: true }, ...tail]
    : items;

  return (
    <nav aria-label={BREADCRUMB_NAV_LABEL} className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden">
        {visible.map((entry, index) => {
          const isLast = index === visible.length - 1;

          if ("overflow" in entry) {
            return (
              <Fragment key="overflow">
                <li className="flex shrink-0 items-center">
                  <BreadcrumbOverflowMenu
                    items={hidden}
                    onNavigate={onNavigate}
                  />
                </li>
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Fragment>
            );
          }

          return (
            <Fragment key={entry.id}>
              <li className="flex shrink-0 items-center">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="truncate text-sm font-medium text-foreground"
                  >
                    <BreadcrumbLabel label={entry.label} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(entry.id)}
                    className={cn(
                      "rounded-sm text-sm text-muted-foreground transition-colors",
                      "hover:text-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <BreadcrumbLabel label={entry.label} />
                  </button>
                )}
              </li>
              {!isLast && (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
