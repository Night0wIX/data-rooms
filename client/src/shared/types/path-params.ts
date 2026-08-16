export type PathParamValue = string | number | string[];

export type PathParams = Record<string, PathParamValue>;

export type ExtractedPathParamValue = string | string[];

export type ExtractedPathParams = Record<string, ExtractedPathParamValue>;

export type PathSegmentModifier = "?" | "*" | "+";

export type CatchAllPathModifier = Extract<PathSegmentModifier, "*" | "+">;

export interface PathSegmentMatch {
  parameterName: string;
  modifier?: PathSegmentModifier;
}
