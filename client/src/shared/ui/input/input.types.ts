import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputVariants } from "./input.variants";

export type InputSize = NonNullable<VariantProps<typeof inputVariants>["size"]>;

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}
