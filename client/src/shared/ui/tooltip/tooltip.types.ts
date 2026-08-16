import type {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
} from "react";
import type * as TooltipPrimitive from "@radix-ui/react-tooltip";

export interface TooltipProps extends PropsWithChildren {
  content: ReactNode;
  side?: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["side"];
  align?: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["align"];
  sideOffset?: number | undefined;
  delayDuration?: number | undefined;
  disabled?: boolean;
  className?: string;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}
