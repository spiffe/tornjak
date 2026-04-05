import React from 'react';
import { Tile, Button, Loading } from 'carbon-components-react';
import { CloudOffline, Restart } from '@carbon/icons-react';
import styles from '../styles/ServerDownError.module.css';

interface ServerDownErrorProps {
  customMessage?: string;
  onReloadPage: () => void;
}

export const ServerDownError: React.FC<ServerDownErrorProps> = ({
  customMessage,
  onReloadPage,
}) => {
  const defaultMessage = 'The server is currently unavailable. Please try again later.';

  return (
    <div className={styles.errorContainer}>
      <Tile className={styles.errorTile}>
        <div className={styles.iconContainer}>
          <CloudOffline className={styles.serverOfflineIcon} />

          <h2 className={styles.title}>
            Server Unavailable
          </h2>

          <p className={styles.message}>
            {customMessage || defaultMessage}
          </p>

          <p className={styles.description}>
            Please ensure the server is running and try again.
          </p>
        </div>

        <div className={styles.actionButtons}>
          <Button
            kind="secondary"
            renderIcon={Restart}
            onClick={onReloadPage}>
            Reload Page
          </Button>
        </div>
      </Tile>
    </div>
  );
};