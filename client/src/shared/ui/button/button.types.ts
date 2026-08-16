import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./button.variants";

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof buttonVariants> {
  ref?: Ref<HTMLButtonElement>;
  asChild?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}
