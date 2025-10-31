import React from 'react';
import styles from './Timeline.module.css';

const Timeline = ({ children }) => {
  return (
    <div className={styles.timeline}>
      {children}
    </div>
  );
};

export default Timeline;
