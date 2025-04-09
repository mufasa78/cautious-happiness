import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth-tokens";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get the auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Get the API base URL from environment or use a default
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Prepend the API base URL if the URL starts with /api
  const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url}` : url;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the URL from the query key
    const url = queryKey[0] as string;

    // Prepend the API base URL if the URL starts with /api
    const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url}` : url;

    const res = await fetch(fullUrl, {
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
