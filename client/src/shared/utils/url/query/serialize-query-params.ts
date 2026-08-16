import type {
  PresentQueryValue,
  QueryEntry,
  QueryParams,
  QueryPrimitive,
  SerializeQueryParamsOptions,
} from "@/shared/types";

import { serializeValue } from "./serialize-value";

function isArrayValue(value: PresentQueryValue): value is QueryPrimitive[] {
  return Array.isArray(value);
}

function appendArrayParam(
  params: URLSearchParams,
  key: string,
  values: QueryPrimitive[],
): void {
  for (const value of values) {
    params.append(key, serializeValue(value));
  }
}

function filterPresentEntries(query: QueryParams): QueryEntry[] {
  return Object.entries(query).filter(
    (entry): entry is QueryEntry => entry[1] !== null && entry[1] !== undefined,
  );
}

function dropEmptyStringEntries(entries: QueryEntry[]): QueryEntry[] {
  return entries.filter(([, value]) => value !== "");
}

function sortEntriesByKey(entries: QueryEntry[]): QueryEntry[] {
  return [...entries].sort(([firstKey], [secondKey]) =>
    firstKey.localeCompare(secondKey),
  );
}

export function serializeQueryParams(
  query: QueryParams,
  options: SerializeQueryParamsOptions = {},
): string {
  const presentEntries = filterPresentEntries(query);

  const nonEmptyEntries = options.dropEmptyStrings
    ? dropEmptyStringEntries(presentEntries)
    : presentEntries;

  const orderedEntries = options.sortKeys
    ? sortEntriesByKey(nonEmptyEntries)
    : nonEmptyEntries;

  const params = new URLSearchParams();

  for (const [key, value] of orderedEntries) {
    if (isArrayValue(value)) {
      appendArrayParam(params, key, value);
      continue;
    }

    params.set(key, serializeValue(value));
  }

  return params.toString();
}
