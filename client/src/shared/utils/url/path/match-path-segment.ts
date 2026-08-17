import type { CatchAllPathModifier, PathSegmentMatch } from "@/shared/types";

import { PATH_PARAM_SEGMENT_PATTERN } from "./constants";

export function matchPathSegment(
  segment: string,
): PathSegmentMatch | undefined {
  const match = segment.match(PATH_PARAM_SEGMENT_PATTERN);

  if (!match) {
    return undefined;
  }

  const [, parameterName, modifier] = match;

  if (!parameterName) {
    return undefined;
  }

  return {
    parameterName,
    ...(modifier ? { modifier: modifier as PathSegmentMatch["modifier"] } : {}),
  };
}

export function isCatchAllModifier(
  modifier: PathSegmentMatch["modifier"],
): modifier is CatchAllPathModifier {
  return modifier === "*" || modifier === "+";
}

export function isMeaningfulPathSegment(
  segment: string,
  index: number,
  segments: string[],
): boolean {
  return segment !== "" || index === 0 || index === segments.length - 1;
}

export function splitPathIntoSegments(path: string): string[] {
  return path.split("/").filter(isMeaningfulPathSegment);
}
