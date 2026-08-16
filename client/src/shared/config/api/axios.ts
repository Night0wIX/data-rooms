import axios, { HttpStatusCode } from "axios";

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./axios.constants";
import { ROUTES } from "@/shared/constants/routes";
import { supabase } from "../supabase/supabase";

function redirectTo(path: string): void {
  if (window.location.pathname === path) return;
  window.location.assign(path);
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

axiosInstance.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === HttpStatusCode.Unauthorized) {
      await supabase.auth.signOut();
      redirectTo(ROUTES.login);
    }

    if (status === HttpStatusCode.Forbidden) {
      redirectTo(ROUTES.unauthorized);
    }

    return Promise.reject(error);
  },
);
