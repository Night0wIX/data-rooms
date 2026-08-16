import { buildUrl } from "@/shared/utils/url";

const API_ORIGIN = import.meta.env.VITE_API_URL;
export const API_PREFIX = "/api/v1";
export const REQUEST_TIMEOUT_MS = 15_000;

export const API_BASE_URL = buildUrl({ path: `${API_ORIGIN}${API_PREFIX}` });
