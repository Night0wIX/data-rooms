import type { BuildUrlArguments, SplitUrl } from "@/shared/types";

import {
  ABSOLUTE_URL_SCHEME_PATTERN,
  PATH_QUERY_SEPARATOR,
  QUERY_PARAM_SEPARATOR,
} from "./constants";
import { applyPathParams } from "./path";
import { serializeQueryParams } from "./query";

function splitOriginFromPath(path: string): SplitUrl {
  if (!ABSOLUTE_URL_SCHEME_PATTERN.test(path)) {
    return { origin: "", pathname: path, hash: "" };
  }

  const parsedUrl = new URL(path);

  return {
    origin: parsedUrl.origin,
    pathname: parsedUrl.pathname + parsedUrl.search,
    hash: parsedUrl.hash,
  };
}

function appendQueryString(pathname: string, queryString: string): string {
  if (!queryString) {
    return pathname;
  }

  const separator = pathname.includes(PATH_QUERY_SEPARATOR)
    ? QUERY_PARAM_SEPARATOR
    : PATH_QUERY_SEPARATOR;

  return `${pathname}${separator}${queryString}`;
}

export function buildUrl({
  path,
  pathParams,
  query,
  options,
}: BuildUrlArguments): string {
  const { origin, pathname, hash } = splitOriginFromPath(path);

  const resolvedPathname = pathParams
    ? applyPathParams(pathname, pathParams)
    : pathname;

  const queryString = query ? serializeQueryParams(query, options) : "";
  const fullPathname = appendQueryString(resolvedPathname, queryString);

  return `${origin}${fullPathname}${hash}`;
}
