import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    "flex w-full min-w-0 rounded-md border border-input bg-transparent shadow-sm outline-none",
    "text-sm text-foreground placeholder:text-muted-foreground",
    "transition-colors",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "read-only:cursor-default read-only:bg-muted/50",
    "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
    "[&::-webkit-search-cancel-button]:hidden",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs",
        default: "h-9 px-3 py-1",
        lg: "h-10 px-4",
      },
      hasLeftIcon: { true: "pl-9", false: "" },
      hasRightIcon: { true: "pr-9", false: "" },
    },
    defaultVariants: {
      size: "default",
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  },
);
