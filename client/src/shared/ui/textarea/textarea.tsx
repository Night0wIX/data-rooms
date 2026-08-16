import type { TextareaHTMLAttributes, Ref } from "react";
import { cn } from "@/shared/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ ref, className, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm outline-none",
        "text-sm text-foreground placeholder:text-muted-foreground",
        "transition-colors resize-y",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}
