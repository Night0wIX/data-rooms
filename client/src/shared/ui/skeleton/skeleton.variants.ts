import { cva } from "class-variance-authority";

export const skeletonVariants = cva(
  [
    "block bg-muted",
    "animate-pulse motion-reduce:animate-none",
    "motion-reduce:opacity-70",
  ],
  {
    variants: {
      shape: {
        text: "h-4 rounded-sm",
        rectangle: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "rectangle",
    },
  },
);
