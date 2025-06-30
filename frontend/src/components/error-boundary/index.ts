export { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
export { GlobalErrorBoundaryWithHooks } from './components/GlobalErrorBoundary';
export { ServerDownError } from './components/ServerDownError';

export type {
  AppError,
  GlobalErrorState,
  GlobalErrorBoundaryProps
} from './error.types';

export { classifyError, isServerError } from './utils';
export { ERROR_MESSAGES, ERROR_TYPES } from './constants';

// Default export
export { GlobalErrorBoundaryWithHooks as default } from './components/GlobalErrorBoundary';