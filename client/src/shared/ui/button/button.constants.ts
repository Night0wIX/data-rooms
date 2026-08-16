import type { ButtonSize, ButtonVariant } from "./button.types";

export const BUTTON_DEFAULT_VARIANT: ButtonVariant = "default";
export const BUTTON_DEFAULT_SIZE: ButtonSize = "default";

export const BUTTON_DEFAULT_TYPE = "button" as const;

export const BUTTON_SPINNER_SIZE_CLASS: Record<ButtonSize, string> = {
  default: "size-4",
  sm: "size-3.5",
  lg: "size-4",
  icon: "size-4",
  "icon-sm": "size-3.5",
  "icon-lg": "size-4",
};
