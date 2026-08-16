import type {
  CatchAllPathModifier,
  ExtractedPathParams,
  PathSegmentMatch,
} from "@/shared/types";

import {
  isCatchAllModifier,
  matchPathSegment,
  splitPathIntoSegments,
} from "./match-path-segment";

interface ExtractedParameter {
  name: string;
  value: string | string[];
}

interface SegmentMatchResult {
  consumedPathSegmentCount: number;
  extractedParameter: ExtractedParameter | undefined;
}

function matchLiteralSegment(
  templateSegment: string,
  pathSegments: string[],
  pathIndex: number,
): SegmentMatchResult | undefined {
  if (pathSegments[pathIndex] !== templateSegment) {
    return undefined;
  }

  return { consumedPathSegmentCount: 1, extractedParameter: undefined };
}

function matchCatchAllSegment(
  parameterName: string,
  modifier: CatchAllPathModifier,
  pathSegments: string[],
  pathIndex: number,
  remainingTemplateSegmentCount: number,
): SegmentMatchResult | undefined {
  const availablePathSegmentCount =
    pathSegments.length - pathIndex - remainingTemplateSegmentCount;

  if (availablePathSegmentCount < 0) {
    return undefined;
  }

  if (modifier === "+" && availablePathSegmentCount < 1) {
    return undefined;
  }

  const capturedValues = pathSegments
    .slice(pathIndex, pathIndex + availablePathSegmentCount)
    .map((segment) => decodeURIComponent(segment));

  return {
    consumedPathSegmentCount: availablePathSegmentCount,
    extractedParameter: { name: parameterName, value: capturedValues },
  };
}

function matchOptionalSegment(
  parameterName: string,
  pathSegments: string[],
  pathIndex: number,
  remainingTemplateSegmentCount: number,
): SegmentMatchResult {
  const currentSegment = pathSegments[pathIndex];

  const hasValueForOptionalSegment =
    pathSegments.length - pathIndex > remainingTemplateSegmentCount &&
    currentSegment !== undefined;

  if (!hasValueForOptionalSegment || currentSegment === undefined) {
    return { consumedPathSegmentCount: 0, extractedParameter: undefined };
  }

  return {
    consumedPathSegmentCount: 1,
    extractedParameter: {
      name: parameterName,
      value: decodeURIComponent(currentSegment),
    },
  };
}

function matchRequiredSegment(
  parameterName: string,
  pathSegments: string[],
  pathIndex: number,
): SegmentMatchResult | undefined {
  const currentSegment = pathSegments[pathIndex];

  if (currentSegment === undefined) {
    return undefined;
  }

  return {
    consumedPathSegmentCount: 1,
    extractedParameter: {
      name: parameterName,
      value: decodeURIComponent(currentSegment),
    },
  };
}

function matchTemplateSegment(
  templateSegment: string,
  segmentMatch: PathSegmentMatch | undefined,
  pathSegments: string[],
  pathIndex: number,
  remainingTemplateSegmentCount: number,
): SegmentMatchResult | undefined {
  if (!segmentMatch) {
    return matchLiteralSegment(templateSegment, pathSegments, pathIndex);
  }

  const { parameterName, modifier } = segmentMatch;

  if (isCatchAllModifier(modifier)) {
    return matchCatchAllSegment(
      parameterName,
      modifier,
      pathSegments,
      pathIndex,
      remainingTemplateSegmentCount,
    );
  }

  if (modifier === "?") {
    return matchOptionalSegment(
      parameterName,
      pathSegments,
      pathIndex,
      remainingTemplateSegmentCount,
    );
  }

  return matchRequiredSegment(parameterName, pathSegments, pathIndex);
}

export function extractPathParams(
  template: string,
  actualPath: string,
): ExtractedPathParams | null {
  const templateSegments = splitPathIntoSegments(template);
  const pathSegments = splitPathIntoSegments(actualPath);

  const extractedParameters: ExtractedPathParams = {};
  let pathIndex = 0;

  for (
    let templateIndex = 0;
    templateIndex < templateSegments.length;
    templateIndex += 1
  ) {
    const templateSegment = templateSegments[templateIndex];

    if (templateSegment === undefined) {
      return null;
    }

    const segmentMatch = matchPathSegment(templateSegment);
    const remainingTemplateSegmentCount =
      templateSegments.length - templateIndex - 1;

    const matchResult = matchTemplateSegment(
      templateSegment,
      segmentMatch,
      pathSegments,
      pathIndex,
      remainingTemplateSegmentCount,
    );

    if (!matchResult) {
      return null;
    }

    if (matchResult.extractedParameter) {
      const { name, value } = matchResult.extractedParameter;
      extractedParameters[name] = value;
    }

    pathIndex += matchResult.consumedPathSegmentCount;
  }

  const isFullyConsumed = pathIndex === pathSegments.length;

  return isFullyConsumed ? extractedParameters : null;
}
