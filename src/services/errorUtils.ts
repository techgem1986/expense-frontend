// Utility to extract and format error messages from API responses
export function getErrorMessage(
  error: any,
  fallback = 'An unexpected error occurred. Please try again.',
) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallback;
}
