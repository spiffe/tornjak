export const DEFAULT_CONFIG = {
  HEALTH_CHECK_INTERVAL: 30000,
  MAX_RETRY_ATTEMPTS: 10,
  SERVER_CHECK_INTERVAL: 5000,
  HEALTH_CHECK_TIMEOUT: 5000
} as const;

export const ERROR_MESSAGES = {
  SERVER_DOWN: 'Unable to connect to server',
  NETWORK_ERROR: 'Network connection error occurred',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  RETRY_EXCEEDED: 'Maximum retry attempts exceeded',
} as const;

export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  UNKNOWN: 'unknown'
} as const;