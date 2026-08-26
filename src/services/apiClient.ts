/**
 * FRONTEND API CLIENT
 * Handles asynchronous HTTP communication with the backend Express endpoints (/api/*)
 */

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`/api${cleanEndpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'Gagal memproses permintaan.';
    try {
      const errorData = await response.json();
      if (errorData?.error) errorMessage = errorData.error;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
