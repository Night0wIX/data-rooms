import { useId } from "react";
import { cn } from "@/shared/utils/cn";
import type { FormFieldControlProps, FormFieldProps } from "./form-field.types";

export function FormField({
  name,
  id: idProp,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const id = idProp ?? name ?? generatedId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const invalid = Boolean(error);
  const describedBy = invalid
    ? errorId
    : description
      ? descriptionId
      : undefined;

  const controlProps: FormFieldControlProps = {
    id,
    name,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none text-foreground"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children(controlProps)}

      {!invalid && description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {invalid && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
