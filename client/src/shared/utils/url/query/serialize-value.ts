import type { QueryPrimitive } from "@/shared/types";

export function serializeValue(value: QueryPrimitive): string {
  switch (typeof value) {
    case "string":
      return value;

    case "number":
      // Infinity and NaN have no meaningful URL representation.
      if (!Number.isFinite(value)) {
        throw new Error(`Cannot serialize non-finite number: ${value}`);
      }

      return value.toString();

    case "boolean":
      return value.toString();

    case "object":
      if (value instanceof Date) {
        return value.toISOString();
      }

      throw new Error("Cannot serialize value of type: object");

    default:
      throw new Error(`Cannot serialize value of type: ${typeof value}`);
  }
}
