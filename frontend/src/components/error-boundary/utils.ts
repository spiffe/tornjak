// features/error-boundary/utils/errorClassifier.ts
import { AppError } from './error.types';
import { ERROR_MESSAGES, ERROR_TYPES } from './constants';

export const classifyError = (error: any): AppError => {
  const timestamp = new Date();

  if (error.isAxiosError && (!error.response || error.code === 'ERR_NETWORK')) {
    return {
      message: ERROR_MESSAGES.SERVER_DOWN,
      type: ERROR_TYPES.SERVER,
      timestamp,
      details: { originalError: error.message }
    };
  }

  if (error?.code === 'ECONNREFUSED' || 
      error?.message?.includes('Network Error') ||
      error?.message?.includes('ERR_CONNECTION_REFUSED')) {
    return {
      message: ERROR_MESSAGES.SERVER_DOWN,
      type: ERROR_TYPES.SERVER,
      timestamp,
      details: { code: error.code, originalError: error.message }
    };
  }

  return {
    message: error?.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
    type: ERROR_TYPES.UNKNOWN,
    timestamp,
    details: error
  };
};

export const isServerError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.SERVER || error.type === ERROR_TYPES.NETWORK;
};

export const isRecoverableError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.SERVER || 
         error.type === ERROR_TYPES.NETWORK
};