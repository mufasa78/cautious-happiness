import { getAuthToken } from "../lib/auth-tokens";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export async function apiRequest(method: HttpMethod, endpoint: string, data?: any) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const fullUrl = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error instanceof Error ? error : new Error('Network error occurred. Please check your connection.');
  }
}