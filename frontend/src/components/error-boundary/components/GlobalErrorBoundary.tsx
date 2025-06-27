// features/error-boundary/components/GlobalErrorBoundary.tsx
import React, { Component, ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  GlobalErrorBoundaryProps,
  GlobalErrorState,
  AppError,
} from '../error.types';
import { useErrorHandler } from '../useErrorHandler';
import { classifyError, isServerError } from '../utils';
import { ServerDownError } from './ServerDownError';
import { setServerDownHandler } from '../../../Utils/axiosSetup';

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorState> {
  private isUnmounted = false;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isServerDown: false,
      isConnecting: false,
      error: undefined,
    };
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorState> {
    const appError: AppError = classifyError(error);
    console.log('Error classified:', appError.message, appError.type);
    return {
      hasError: true,
      error: appError,
      isServerDown: isServerError(appError),
    };
  }

  // Methods to be called by the wrapper component
  public updateState = (newState: Partial<GlobalErrorState>) => {
    if (!this.isUnmounted) {
      this.setState((prevState) => ({ ...prevState, ...newState }));
    }
  };

  public resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      isServerDown: false,
      isConnecting: false,
    });
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, isServerDown, error, isConnecting } = this.state;
    const { customServerDownMessage, children } = this.props;

    if (!hasError) {
      return children;
    }

    if (isServerDown) {
      return (
        <ServerDownError
          isConnecting={isConnecting}
          customMessage={customServerDownMessage}
          onReloadPage={this.handleReloadPage}
        />
      );
    }
  }
}

const GlobalErrorBoundaryWrapper: React.FC<GlobalErrorBoundaryProps> = (props) => {
  const errorBoundaryRef = useRef<GlobalErrorBoundary>(null);

  const handleServerError = useCallback(() => {
    errorBoundaryRef.current?.updateState({
      hasError: true,
      isServerDown: true,
      error: {
        message: props.customServerDownMessage || 'Unable to connect to server',
        type: 'server',
        timestamp: new Date(),
      } as AppError,
    });
  }, [props.customServerDownMessage]);

  const handleAppError = useCallback((error: any) => {
    const appError = classifyError(error);
    errorBoundaryRef.current?.updateState({
      hasError: true,
      error: appError,
      isServerDown: isServerError(appError),
    });
  }, []);

  useErrorHandler({
    onServerError: handleServerError,
    enabled: true,
  });

  useEffect(() => {
    setServerDownHandler(() => {
      errorBoundaryRef.current?.updateState({
        hasError: true,
        isServerDown: true,
        error: {
          message: props.customServerDownMessage || 'Unable to connect to server',
          type: 'server',
          timestamp: new Date(),
        } as AppError,
      });
    });
  }, [props.customServerDownMessage]);

  return <GlobalErrorBoundary ref={errorBoundaryRef} {...props} />;
};

export { GlobalErrorBoundaryWrapper as GlobalErrorBoundaryWithHooks };