import type { ReactNode } from "react";

export interface FormFieldControlProps {
  id: string;
  name?: string | undefined;
  "aria-invalid": boolean;
  "aria-describedby"?: string | undefined;
  "aria-required"?: boolean | undefined;
}

export interface FormFieldProps {
  name?: string;
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (field: FormFieldControlProps) => ReactNode;
}
