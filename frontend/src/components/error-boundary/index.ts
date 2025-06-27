// features/error-boundary/index.ts
// Main component exports
export { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
export { GlobalErrorBoundaryWithHooks } from './components/GlobalErrorBoundary';
export { ServerDownError } from './components/ServerDownError';

// Hook exports
export { useErrorHandler } from './useErrorHandler';

// Type exports
export type {
  AppError,
  GlobalErrorState,
  GlobalErrorBoundaryProps,
  ServerHealthCheckOptions,
  ErrorRecoveryOptions,
} from './error.types';

// Utility exports
export { classifyError, isServerError, isRecoverableError } from './utils';
export { DEFAULT_CONFIG, ERROR_MESSAGES, ERROR_TYPES } from './constants';

// Default export - the main component most users will need
export { GlobalErrorBoundaryWithHooks as default } from './components/GlobalErrorBoundary';