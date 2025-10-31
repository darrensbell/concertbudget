import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ message, ...rest }) => {
  return (
    <div className={styles.emptyState} {...rest}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
