import type { ValidationError } from "class-validator";
import type { FlatValidationErrors } from "./validation.types.js";

// Recursive: a nested DTO (e.g. an array field validated with @ValidateNested())
// produces ValidationError.children, which get flattened into "field.0.prop" paths.
export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = "",
): FlatValidationErrors {
  return errors.reduce<FlatValidationErrors>((acc, error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(acc, formatValidationErrors(error.children, path));
    }

    return acc;
  }, {});
}
