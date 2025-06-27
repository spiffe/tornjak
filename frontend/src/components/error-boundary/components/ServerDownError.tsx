import React from 'react';
import { Tile, Button, Loading } from 'carbon-components-react';
import { CloudOffline, Cloud, Restart } from '@carbon/icons-react';
import styles from '../styles/ServerDownError.module.css';

interface ServerDownErrorProps {
  isConnecting: boolean;
  customMessage?: string;
  onReloadPage: () => void;
}

export const ServerDownError: React.FC<ServerDownErrorProps> = ({
  isConnecting,
  customMessage,
  onReloadPage,
}) => {
  const defaultMessage = 'The server is currently unavailable. This could be because the server is not started or there\'s a network connectivity issue.';

  return (
    <div className={styles.errorContainer}>
      <Tile className={styles.errorTile}>
        <div className={styles.iconContainer}>
          {isConnecting ? (
            <div className={styles.loadingContainer}>
              <Loading description="Connecting to server..." />
            </div>
          ) : (
            <CloudOffline className={styles.serverOfflineIcon} />
          )}
          
          <h2 className={styles.title}>
            {isConnecting ? 'Reconnecting...' : 'Server Unavailable'}
          </h2>
          
          <p className={styles.message}>
            {isConnecting 
              ? 'Attempting to reconnect to the server...'
              : (customMessage || defaultMessage)
            }
          </p>
          
          <p className={styles.description}>
            {isConnecting 
              ? 'Please wait while we restore the connection.'
              : 'Please ensure the server is running and try again.'
            }
          </p>
        </div>

        <div className={styles.actionButtons}>
          {/* Can be enabled if we have health check end point in tornjak backend */}
          {/* <Button
            kind="primary"
            renderIcon={Cloud}
            onClick={onRetryConnection}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Retry Connection'}
          </Button> */}
          
          <Button
            kind="secondary"
            renderIcon={Restart}
            onClick={onReloadPage}
            disabled={isConnecting}
          >
            Reload Page
          </Button>
        </div>
      </Tile>
    </div>
  );
};