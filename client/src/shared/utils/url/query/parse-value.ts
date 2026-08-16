import { FALSE_BOOLEAN_TOKENS, TRUE_BOOLEAN_TOKENS } from "./constants";

function isBlank(raw: string): boolean {
  return raw.trim() === "";
}

export function parseAsString(raw: string | null): string | undefined {
  return raw ?? undefined;
}

export function parseAsNumber(raw: string | null): number | undefined {
  if (raw === null || isBlank(raw)) {
    return undefined;
  }

  const parsedValue = Number(raw);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function parseAsBoolean(raw: string | null): boolean | undefined {
  if (raw === null) {
    return undefined;
  }

  const normalized = raw.trim();

  if (TRUE_BOOLEAN_TOKENS.has(normalized)) {
    return true;
  }

  if (FALSE_BOOLEAN_TOKENS.has(normalized)) {
    return false;
  }

  return undefined;
}

export function parseAsDate(raw: string | null): Date | undefined {
  if (raw === null || isBlank(raw)) {
    return undefined;
  }

  const parsedDate = new Date(raw.trim());

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

export function parseAsEnum<const TValues extends readonly string[]>(
  raw: string | null,
  allowedValues: TValues,
): TValues[number] | undefined {
  if (raw === null) return undefined;

  const normalized = raw.trim();
  return (allowedValues as readonly string[]).includes(normalized)
    ? (normalized as TValues[number])
    : undefined;
}

export function parseAsGuessedPrimitive(
  raw: string | null,
): string | number | boolean | undefined {
  if (raw === null) {
    return undefined;
  }

  const asBoolean = parseAsBoolean(raw);
  if (asBoolean !== undefined) {
    return asBoolean;
  }

  const asNumber = parseAsNumber(raw);
  if (asNumber !== undefined) {
    return asNumber;
  }

  return raw;
}
