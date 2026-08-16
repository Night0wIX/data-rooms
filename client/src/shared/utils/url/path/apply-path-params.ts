import type { CatchAllPathModifier, PathParams } from "@/shared/types";

import { isCatchAllModifier, matchPathSegment } from "./match-path-segment";

const ERROR_PREFIX = "[applyPathParams]";

function assertNotEmptyString(parameterName: string, value: string): void {
  if (value === "") {
    throw new Error(
      `${ERROR_PREFIX} Param "${parameterName}" cannot be an empty string`,
    );
  }
}

function resolveCatchAllSegments(
  parameterName: string,
  modifier: CatchAllPathModifier,
  value: PathParams[string] | undefined,
): string[] {
  if (value === undefined) {
    if (modifier === "+") {
      throw new Error(
        `${ERROR_PREFIX} Missing required catch-all param: "${parameterName}"`,
      );
    }

    return [];
  }

  const segmentValues = Array.isArray(value) ? value : [value];

  if (modifier === "+" && segmentValues.length === 0) {
    throw new Error(
      `${ERROR_PREFIX} Catch-all param "${parameterName}" requires at least one segment`,
    );
  }

  return segmentValues.map((segmentValue) => {
    const stringValue = String(segmentValue);
    assertNotEmptyString(parameterName, stringValue);

    return encodeURIComponent(stringValue);
  });
}

function resolveSingleSegment(
  parameterName: string,
  isOptional: boolean,
  value: PathParams[string] | undefined,
): string | undefined {
  if (value === undefined) {
    if (isOptional) {
      return undefined;
    }

    throw new Error(`${ERROR_PREFIX} Missing path param: "${parameterName}"`);
  }

  if (Array.isArray(value)) {
    throw new Error(
      `${ERROR_PREFIX} Param "${parameterName}" is not a catch-all segment, array value is not allowed`,
    );
  }

  const stringValue = String(value);
  assertNotEmptyString(parameterName, stringValue);

  return encodeURIComponent(stringValue);
}

function resolveTemplateSegment(segment: string, params: PathParams): string[] {
  const segmentMatch = matchPathSegment(segment);

  if (!segmentMatch) {
    return [segment];
  }

  const { parameterName, modifier } = segmentMatch;
  const value = params[parameterName];

  if (isCatchAllModifier(modifier)) {
    return resolveCatchAllSegments(parameterName, modifier, value);
  }

  const resolvedSegment = resolveSingleSegment(
    parameterName,
    modifier === "?",
    value,
  );

  return resolvedSegment === undefined ? [] : [resolvedSegment];
}

export function applyPathParams(template: string, params: PathParams): string {
  return template
    .split("/")
    .flatMap((segment) => resolveTemplateSegment(segment, params))
    .join("/");
}
