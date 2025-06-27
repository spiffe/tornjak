// features/error-boundary/hooks/useErrorHandler.ts
import { useEffect, useCallback } from 'react';
import { AppError } from './error.types';
import { classifyError, isServerError } from './utils';

interface UseErrorHandlerOptions {
  onServerError?: () => void;
  enabled?: boolean;
}

export const useErrorHandler = ({
  onServerError,
  enabled = true,
}: UseErrorHandlerOptions = {}) => {

  const handleGlobalError = useCallback((event: ErrorEvent) => {
    if (!enabled) return;

    const error = event.error || new Error(event.message);
    const appError = classifyError(error);

    if (isServerError(appError)) {
      onServerError?.();
    }

  }, [enabled, onServerError]);

  const handleAppError = useCallback((error: Error | AppError) => {
    if (!enabled) return;

    const appError = error instanceof Error ? classifyError(error) : error;

    if (isServerError(appError)) {
      onServerError?.();
    }

  }, [enabled, onServerError]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [enabled, handleGlobalError]);

  return {
    handleAppError,
  };
};