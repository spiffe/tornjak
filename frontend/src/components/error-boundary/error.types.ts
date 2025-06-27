export interface AppError {
  message: string;
  type: 'server' | 'network' | 'unknown';
  statusCode?: number;
  timestamp: Date;
  details?: any;
}

export interface GlobalErrorState {
  hasError: boolean;
  error?: AppError;
  isServerDown: boolean;
  isConnecting: boolean;
}

export interface GlobalErrorBoundaryProps {
  children: React.ReactNode;

  // Server configuration - If we want to incorporate health check
  serverHealthEndpoint?: string;
  healthCheckInterval?: number;
  maxRetryAttempts?: number;

  // Event handlers
  onServerError?: (error: AppError) => void;
  onServerReconnect?: () => void;

  // UI customization
  showHealthStatus?: boolean;
  enableAutoRetry?: boolean;
  customServerDownMessage?: string;
  customNetworkErrorMessage?: string;
}

export interface ServerHealthCheckOptions {
  endpoint: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ErrorRecoveryOptions {
  maxRetries: number;
  retryInterval: number;
}