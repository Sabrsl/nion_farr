import { logger } from './logger.js';
import { toAppError, AppError, ApiError } from './custom-errors';

/**
 * Handle API errors with consistent error logging and response formatting
 * @param error - The caught error object
 * @param message - Custom error message for logging
 * @param context - Additional context data for logging
 * @returns Default object or rethrows error if needed
 */
export const handleApiError = (error: any, message: string, context: Record<string, any> = {}) => {
  // Convert to AppError for consistent handling
  const appError = toAppError(error);
  
  // Check if it's an Axios error with response
  if (error.response) {
    const { status, data } = error.response;
    
    logger.error(`API Error (${status}): ${message}`, {
      status,
      data,
      ...context
    });

    // For 401 and 403 errors, you might want to handle authentication issues
    if (status === 401 || status === 403) {
      // Depending on your app, you might want to redirect to login or clear auth state
      // e.g., store.dispatch(logoutUser());
    }

    // Return a default value appropriate for the request
    return { error: true, message: data?.message || 'An error occurred', status };
  }
  
  // Network errors or request cancellation
  logger.error(`API Request Failed: ${message}`, {
    error: appError.message,
    code: appError.code,
    ...context
  });
  
  // Return a default empty response appropriate for the request context
  // For example, for a list request, return empty array with metadata
  if (context.page !== undefined) {
    return { services: [], total: 0, pages: 0 };
  }
  
  // For a single item request, return null
  if (context.id !== undefined) {
    return null;
  }
  
  // Generic error response
  return { error: true, message: appError.message || 'Network error', code: appError.code };
};

/**
 * Handle errors in React components
 * @param error - The caught error
 * @param context - Additional context about where the error occurred
 * @param fallback - Optional fallback value to return
 */
export const handleComponentError = (error: unknown, context: Record<string, any> = {}, fallback?: any) => {
  const appError = toAppError(error);
  
  logger.error(`Component Error: ${appError.message}`, {
    ...context,
    errorDetails: appError.toJSON()
  });
  
  // You could integrate with error monitoring services here
  // Example: Sentry.captureException(appError);
  
  return fallback;
}; 