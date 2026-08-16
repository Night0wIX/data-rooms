import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { QueryParams } from "@/shared/types";
import { axiosInstance } from "../config/api/axios";
import { buildUrl } from "../utils/url";

export abstract class BaseApiService {
  protected readonly http: AxiosInstance;
  protected readonly baseUrl: string;

  constructor(domain: string) {
    this.http = axiosInstance;
    this.baseUrl = domain;
  }

  protected url(
    path: string,
    pathParams?: Record<string, string | number>,
    query?: QueryParams,
  ): string {
    return buildUrl({
      path: `${this.baseUrl}${path}`,
      ...(pathParams && { pathParams }),
      ...(query && { query }),
    });
  }

  protected get<TResponseData>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponseData>> {
    return this.http.get<TResponseData>(url, config);
  }

  protected post<TResponseData, TRequestBody = unknown>(
    url: string,
    data?: TRequestBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponseData>> {
    return this.http.post<TResponseData>(url, data, config);
  }

  protected put<TResponseData, TRequestBody = unknown>(
    url: string,
    data?: TRequestBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponseData>> {
    return this.http.put<TResponseData>(url, data, config);
  }

  protected patch<TResponseData, TRequestBody = unknown>(
    url: string,
    data?: TRequestBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponseData>> {
    return this.http.patch<TResponseData>(url, data, config);
  }

  protected delete<TResponseData>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponseData>> {
    return this.http.delete<TResponseData>(url, config);
  }
}
