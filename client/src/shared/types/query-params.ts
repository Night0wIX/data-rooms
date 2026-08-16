export type QueryPrimitive = string | number | boolean | Date;

export type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;

export type QueryParams = Record<string, QueryValue>;

export type PresentQueryValue = Exclude<QueryValue, null | undefined>;

export type QueryEntry = [key: string, value: PresentQueryValue];

export interface SerializeQueryParamsOptions {
  sortKeys?: boolean;
  dropEmptyStrings?: boolean;
}

export type ParsedQueryValue = string | string[];

export type ParsedQueryParams = Record<string, ParsedQueryValue>;

export interface ParseQueryParamsOptions {
  arrayKeys?: string[];
}
