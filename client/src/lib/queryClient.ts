import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers || {})
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    ...options
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
    // Build the URL from all parts of queryKey for proper resource addressing
    let url = queryKey[0] as string;
    
    // If there are additional query key segments, append them to the URL
    if (queryKey.length > 1) {
      for (let i = 1; i < queryKey.length; i++) {
        if (queryKey[i] && typeof queryKey[i] !== 'undefined') {
          // If already has a trailing slash, don't add another
          if (!url.endsWith('/')) {
            url += '/';
          }
          url += queryKey[i];
        }
      }
    }
    
    console.log(`Query request to: ${url}`);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
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
