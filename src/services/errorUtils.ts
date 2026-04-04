// Utility to extract and format error messages from API responses
export function getErrorMessage(
  error: any,
  fallback = 'An unexpected error occurred. Please try again.',
) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  
  // Handle Spring Boot validation errors
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      // Return the first field error message
      return errors[0].defaultMessage || errors[0].message || fallback;
    }
  }
  
  // Handle single error message
  if (error.response?.data?.message) return error.response.data.message;
  
  // Handle field-specific errors from Spring Boot
  if (error.response?.data?.fieldErrors) {
    const fieldErrors = error.response.data.fieldErrors;
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      return fieldErrors[0].defaultMessage || fieldErrors[0].message || fallback;
    }
  }
  
  // Handle general error message
  if (error.message) return error.message;
  
  return fallback;
}

// Extract field-specific validation errors for form display
export function getFieldErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  if (!error?.response?.data) return fieldErrors;
  
  // Handle Spring Boot fieldErrors format
  if (error.response.data.fieldErrors) {
    error.response.data.fieldErrors.forEach((fieldError: any) => {
      fieldErrors[fieldError.field] = fieldError.defaultMessage || fieldError.message;
    });
  }
  
  // Handle errors array format
  if (error.response.data.errors) {
    error.response.data.errors.forEach((errorItem: any) => {
      if (errorItem.field && errorItem.defaultMessage) {
        fieldErrors[errorItem.field] = errorItem.defaultMessage;
      }
    });
  }
  
  return fieldErrors;
}
