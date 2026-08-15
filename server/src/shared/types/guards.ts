export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function hasProperty<K extends string>(value: unknown, key: K): value is Record<K, unknown> {
  return isObject(value) && key in value;
}
