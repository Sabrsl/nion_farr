/**
 * Système d'erreurs personnalisées pour l'application
 */

/**
 * Classe d'erreur de base pour toute l'application
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code = 'APP_ERROR',
    statusCode = 500,
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Nécessaire pour que instanceof fonctionne avec les classes qui étendent Error
    Object.setPrototypeOf(this, new.target.prototype);
    
    // Capture la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convertit l'erreur en objet JSON pour les logs et APIs
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      stack: process.env.NODE_ENV !== 'production' ? this.stack : undefined
    };
  }

  /**
   * Vérifie si l'erreur est opérationnelle (attendue)
   */
  isExpected() {
    return this.isOperational;
  }
}

/**
 * Erreur liée à un service non trouvé
 */
export class ServiceNotFoundError extends AppError {
  constructor(message = 'Service not found or has been deleted', context?: Record<string, any>) {
    super(message, 'SERVICE_NOT_FOUND', 404, true, context);
  }
}

/**
 * Erreur liée à un service inactif
 */
export class ServiceInactiveError extends AppError {
  constructor(message = 'Service is currently unavailable', context?: Record<string, any>) {
    super(message, 'SERVICE_INACTIVE', 403, true, context);
  }
}

/**
 * Erreur levée quand un utilisateur tente de commander son propre service
 */
export class SelfOrderError extends AppError {
  constructor(message = 'You cannot order your own service', context?: Record<string, any>) {
    super(message, 'SELF_ORDER_PROHIBITED', 403, true, context);
  }
}

/**
 * Erreur liée à l'authentification manquante
 */
export class AuthenticationRequiredError extends AppError {
  constructor(message = 'Authentication required to perform this action', context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_REQUIRED', 401, true, context);
  }
}

/**
 * Erreur de validation des données
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

/**
 * Erreur d'API
 */
export class ApiError extends AppError {
  constructor(
    message = 'API request failed',
    statusCode = 500,
    code = 'API_ERROR',
    context?: Record<string, any>
  ) {
    super(message, code, statusCode, true, context);
  }
}

/**
 * Erreur lors du parsing de données
 */
export class DataParsingError extends AppError {
  constructor(message = 'Failed to parse data', context?: Record<string, any>) {
    super(message, 'DATA_PARSING_ERROR', 400, true, context);
  }
}

/**
 * Erreur de rate limiting
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, true, context);
  }
}

/**
 * Erreur de configuration
 */
export class ConfigurationError extends AppError {
  constructor(message = 'Configuration error', context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', 500, false, context);
  }
}

/**
 * Erreur non gérée
 */
export class UnhandledError extends AppError {
  constructor(originalError: Error, context?: Record<string, any>) {
    super(
      originalError.message || 'An unexpected error occurred',
      'UNHANDLED_ERROR',
      500,
      false,
      {
        ...context,
        originalErrorName: originalError.name,
        originalErrorStack: originalError.stack
      }
    );
  }
}

/**
 * Fonction utilitaire pour créer une erreur HTTP
 */
export function createHttpError(statusCode: number, message?: string, context?: Record<string, any>) {
  const statusMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };

  const code = `HTTP_${statusCode}`;
  const defaultMessage = statusMessages[statusCode] || 'HTTP Error';

  return new AppError(message || defaultMessage, code, statusCode, true, context);
}

/**
 * Convertit une erreur quelconque en AppError
 * Utile pour normaliser la gestion des erreurs
 */
export function toAppError(error: unknown, defaultMessage = 'An unexpected error occurred'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message || defaultMessage,
      'UNKNOWN_ERROR',
      500,
      false,
      { originalError: error.name, stack: error.stack }
    );
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError(
    defaultMessage,
    'UNKNOWN_ERROR',
    500,
    false,
    { originalError: error }
  );
}

export default {
  AppError,
  ServiceNotFoundError,
  ServiceInactiveError,
  SelfOrderError,
  AuthenticationRequiredError,
  ValidationError,
  ApiError,
  DataParsingError,
  RateLimitError,
  ConfigurationError,
  UnhandledError,
  createHttpError,
  toAppError
}; 