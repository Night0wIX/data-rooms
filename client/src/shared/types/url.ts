import type { ExtractedPathParams, PathParams } from "./path-params";
import type {
  ParsedQueryParams,
  ParseQueryParamsOptions,
  QueryParams,
  SerializeQueryParamsOptions,
} from "./query-params";

export type BuildUrlOptions = SerializeQueryParamsOptions;

export interface BuildUrlArguments {
  path: string;
  pathParams?: PathParams;
  query?: QueryParams;
  options?: BuildUrlOptions;
}

export interface ParseUrlArguments {
  template: string;
  actualUrl: string;
  queryOptions?: ParseQueryParamsOptions;
}

export interface SplitUrl {
  origin: string;
  pathname: string;
  hash: string;
}

export interface ParsedUrl {
  pathParams: ExtractedPathParams;
  query: ParsedQueryParams;
}

export interface SplitPathAndSearch {
  pathname: string;
  search: string;
}
