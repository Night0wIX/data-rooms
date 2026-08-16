import type {
  ParsedQueryParams,
  ParseQueryParamsOptions,
} from "@/shared/types";

function isDeclaredArrayKey(
  key: string,
  arrayKeys: string[] | undefined,
): boolean {
  return arrayKeys?.includes(key) ?? false;
}

export function parseQueryParams(
  search: string,
  options: ParseQueryParamsOptions = {},
): ParsedQueryParams {
  const searchParams = new URLSearchParams(search);
  const result: ParsedQueryParams = {};

  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    const shouldBeArray =
      values.length > 1 || isDeclaredArrayKey(key, options.arrayKeys);

    result[key] = shouldBeArray ? values : (values[0] ?? "");
  }

  return result;
}
