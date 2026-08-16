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
  label?: string;
  description?: string;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  action?: ReactNode;
  children: (controlProps: FormFieldControlProps) => ReactNode;
}
