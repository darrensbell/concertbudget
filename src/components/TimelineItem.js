import React from 'react';
import styles from './TimelineItem.module.css';

const TimelineItem = ({ children, ...rest }) => {
  return (
    <div className={styles.timelineItem} {...rest}>
      <div className={styles.timelineDot}></div>
      <div className={styles.timelineContent}>
        {children}
      </div>
    </div>
  );
};

export default TimelineItem;
