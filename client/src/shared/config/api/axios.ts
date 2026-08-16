import axios from "axios";

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./axios.constants";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});
