// API configuration for production and development environments

// Define the base URL for API calls
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://your-backend-api-url.com/api' // This is a fallback, prefer using VITE_API_URL
    : '/api'); // Use relative path for development

console.log('API_BASE_URL:', API_BASE_URL);

// Helper function for API requests
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // For non-JSON responses
  if (!response.headers.get('content-type')?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response;
  }

  // For JSON responses
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data;
}
