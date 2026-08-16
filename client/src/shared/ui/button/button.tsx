import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import type { MouseEventHandler } from "react";
import { cn } from "@/shared/utils/cn";
import {
  BUTTON_DEFAULT_SIZE,
  BUTTON_DEFAULT_TYPE,
  BUTTON_DEFAULT_VARIANT,
  BUTTON_SPINNER_SIZE_CLASS,
} from "./button.constants";
import type { ButtonProps } from "./button.types";
import { buttonVariants } from "./button.variants";

export function Button({
  ref,
  className,
  variant = BUTTON_DEFAULT_VARIANT,
  size = BUTTON_DEFAULT_SIZE,
  type = BUTTON_DEFAULT_TYPE,
  asChild = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const isBlocked = disabled || loading;
  const resolvedSize = size ?? BUTTON_DEFAULT_SIZE;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const sharedClassName = cn(
    buttonVariants({ variant, size, className }),
    fullWidth && "w-full",
  );

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={sharedClassName}
        aria-disabled={isBlocked || undefined}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isBlocked}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={sharedClassName}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Loader2
          className={cn(
            "animate-spin",
            BUTTON_SPINNER_SIZE_CLASS[resolvedSize],
          )}
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      {loading && loadingText ? loadingText : children}
      {!loading && rightIcon}
    </button>
  );
}
