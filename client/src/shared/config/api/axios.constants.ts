import { buildUrl } from "@/shared/utils/url";
import { envConfig } from "../env/env";

export const API_PREFIX = "/api/v1";
export const REQUEST_TIMEOUT_MS = 15_000;

export const API_BASE_URL = buildUrl({
  path: `${envConfig.api.url}${API_PREFIX}`,
});
