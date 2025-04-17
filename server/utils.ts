// UUID validation utility
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Try to parse ID as UUID or fallback to empty string if invalid
export function safeParseUUID(id: any): string {
  if (typeof id === 'string' && isValidUUID(id)) {
    return id;
  }
  return '';
}

// Standard API error response format
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Create a consistent error response
export function createErrorResponse(message: string, status: number = 500, errors?: Record<string, string[]>): ApiError {
  return {
    message,
    status,
    ...(errors && { errors })
  };
}