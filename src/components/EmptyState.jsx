
import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ message }) => {
  return (
    <div className={styles.emptyStateContainer}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
