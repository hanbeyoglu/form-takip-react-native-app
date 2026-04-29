import { ApiErrorResponse, ApiResponse } from "../../types/api.types";
import { Platform } from "react-native";

const API_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const BASE_URL = `http://${API_HOST}:3000/api`;

export class ApiClientError extends Error {
  code: string;
  details?: unknown;
  status?: number;

  constructor(params: {
    message: string;
    code: string;
    details?: unknown;
    status?: number;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.code = params.code;
    this.details = params.details;
    this.status = params.status;
  }
}

export class ApiClient {
  private accessToken: string | null = null;
  private unauthorizedHandler: (() => void) | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  setUnauthorizedHandler(handler: (() => void) | null): void {
    this.unauthorizedHandler = handler;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T, B>(path: string, body: B): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  async patch<T, B>(path: string, body: B): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "DELETE"
    });
  }

  async getData<T>(path: string): Promise<T> {
    const response = await this.get<T>(path);
    return this.unwrapOrThrow(response);
  }

  async postData<T, B>(path: string, body: B): Promise<T> {
    const response = await this.post<T, B>(path, body);
    return this.unwrapOrThrow(response);
  }

  async patchData<T, B>(path: string, body: B): Promise<T> {
    const response = await this.patch<T, B>(path, body);
    return this.unwrapOrThrow(response);
  }

  async deleteData<T>(path: string): Promise<T> {
    const response = await this.delete<T>(path);
    return this.unwrapOrThrow(response);
  }

  private async request<T>(
    path: string,
    init: RequestInit
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {})
    };

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers
      });

      const json = (await response.json()) as ApiResponse<T>;
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      if (!response.ok && "error" in json) {
        throw this.mapApiError(json.error, response.status);
      }
      if (!response.ok) {
        throw new ApiClientError({
          code: "HTTP_ERROR",
          message: "Request failed",
          status: response.status
        });
      }
      return json;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError({
        code: "NETWORK_ERROR",
        message: "Network request failed",
        details: error
      });
    }
  }

  private mapApiError(error: ApiErrorResponse["error"], status: number): ApiClientError {
    return new ApiClientError({
      code: error.code,
      message: error.message,
      details: error.details,
      status
    });
  }

  private unwrapOrThrow<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    }
    throw new ApiClientError({
      code: response.error.code,
      message: response.error.message,
      details: response.error.details
    });
  }
}

export const apiClient = new ApiClient();
