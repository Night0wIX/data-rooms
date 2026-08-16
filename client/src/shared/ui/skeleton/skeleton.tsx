import type { CSSProperties } from "react";
import { cn } from "@/shared/utils/cn";
import {
  SKELETON_A11Y_LABEL,
  SKELETON_DEFAULT_SHAPE,
} from "./skeleton.constants";
import type { SkeletonProps } from "./skeleton.types";
import { skeletonVariants } from "./skeleton.variants";

export function Skeleton({
  shape = SKELETON_DEFAULT_SHAPE,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const resolvedStyle: CSSProperties = {
    ...style,
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
  };

  return (
    <div
      role="status"
      aria-label={SKELETON_A11Y_LABEL}
      className={cn(skeletonVariants({ shape, className }))}
      style={resolvedStyle}
      {...props}
    />
  );
}
