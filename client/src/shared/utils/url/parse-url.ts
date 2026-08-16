import type {
  ParsedUrl,
  ParseUrlArguments,
  SplitPathAndSearch,
} from "@/shared/types";

import { PATH_QUERY_SEPARATOR } from "./constants";
import { extractPathParams } from "./path";
import { parseQueryParams } from "./query";

function splitPathAndSearch(url: string): SplitPathAndSearch {
  const separatorIndex = url.indexOf(PATH_QUERY_SEPARATOR);

  if (separatorIndex === -1) {
    return { pathname: url, search: "" };
  }

  return {
    pathname: url.slice(0, separatorIndex),
    search: url.slice(separatorIndex + 1),
  };
}

export function parseUrl({
  template,
  actualUrl,
  queryOptions,
}: ParseUrlArguments): ParsedUrl | null {
  const { pathname, search } = splitPathAndSearch(actualUrl);

  const pathParams = extractPathParams(template, pathname);

  if (pathParams === null) {
    return null;
  }

  const query = parseQueryParams(search, queryOptions);

  return { pathParams, query };
}
