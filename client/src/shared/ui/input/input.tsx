import { Loader2, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  INPUT_CLEAR_BUTTON_LABEL,
  INPUT_DEFAULT_SIZE,
  INPUT_ICON_SIZE_CLASS,
} from "./input.constants";
import type { InputProps } from "./input.types";
import { inputVariants } from "./input.variants";

export function Input({
  ref,
  className,
  containerClassName,
  size = INPUT_DEFAULT_SIZE,
  leftIcon,
  rightIcon,
  loading = false,
  clearable = false,
  onClear,
  disabled,
  value,
  ...props
}: InputProps) {
  const resolvedSize = size ?? INPUT_DEFAULT_SIZE;
  const iconSizeClass = INPUT_ICON_SIZE_CLASS[resolvedSize];

  const hasLeftIcon = Boolean(leftIcon);
  const showClear =
    clearable && !loading && !disabled && value !== undefined && value !== "";
  const hasRightIcon = loading || showClear || Boolean(rightIcon);

  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      {leftIcon && (
        <span
          className={cn(
            "pointer-events-none absolute left-3 flex items-center text-muted-foreground",
            iconSizeClass,
          )}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}

      <input
        ref={ref}
        disabled={disabled}
        value={value}
        className={cn(
          inputVariants({ size, hasLeftIcon, hasRightIcon, className }),
        )}
        {...props}
      />

      {loading && (
        <span
          className="absolute right-3 flex items-center text-muted-foreground"
          aria-hidden="true"
        >
          <Loader2 className={cn("animate-spin", iconSizeClass)} />
        </span>
      )}

      {!loading && showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={INPUT_CLEAR_BUTTON_LABEL}
          className="absolute right-2 flex items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className={iconSizeClass} />
        </button>
      )}

      {!loading && !showClear && rightIcon && (
        <span className="absolute right-3 flex items-center text-muted-foreground">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
