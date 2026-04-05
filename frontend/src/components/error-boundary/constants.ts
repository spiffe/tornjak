export const ERROR_MESSAGES = {
  SERVER_DOWN: 'Unable to connect to server',
  NETWORK_ERROR: 'Network connection error occurred',
  UNEXPECTED_ERROR: 'An unexpected error occurred'
} as const;

export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  UNKNOWN: 'unknown'
} as const;