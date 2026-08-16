import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/shared/utils/cn";
import {
  TOOLTIP_DEFAULT_DELAY_MS,
  TOOLTIP_DEFAULT_SIDE_OFFSET,
  TOOLTIP_SKIP_DELAY_MS,
} from "./tooltip.constants";
import type { TooltipProps } from "./tooltip.types";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={TOOLTIP_DEFAULT_DELAY_MS}
      skipDelayDuration={TOOLTIP_SKIP_DELAY_MS}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = TOOLTIP_DEFAULT_SIDE_OFFSET,
  delayDuration,
  disabled = false,
  className,
  open,
  onOpenChange,
}: TooltipProps) {
  if (disabled || !content) {
    return children;
  }

  return (
    <TooltipPrimitive.Root
      {...(open !== undefined && { open })}
      {...(onOpenChange !== undefined && { onOpenChange })}
      {...(delayDuration !== undefined && { delayDuration })}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-popover" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
