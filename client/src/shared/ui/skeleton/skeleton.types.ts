import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { skeletonVariants } from "./skeleton.variants";

export type SkeletonShape = NonNullable<
  VariantProps<typeof skeletonVariants>["shape"]
>;

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}
