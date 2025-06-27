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
}

export interface GlobalErrorBoundaryProps {
  children: React.ReactNode;

  onServerError?: (error: AppError) => void;

  customServerDownMessage?: string;
  customNetworkErrorMessage?: string;
}