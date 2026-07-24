type ApiResponse<T> = {
  data?: T;
  success?: boolean;
  error?: { code?: string; message: string };
  meta?: { total: number; page?: number; limit?: number; cursor?: string; hasNextPage?: boolean };
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        credentials: 'include',
        ...options,
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error ?? { message: `HTTP ${res.status}` } };
      }
      return json;
    } catch (err) {
      return { success: false, error: { message: err instanceof Error ? err.message : 'Network error' } };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
