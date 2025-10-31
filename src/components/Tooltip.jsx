import React, { useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className={styles.tooltipContainer}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <div className={styles.tooltipText}>{text}</div>}
    </div>
  );
};

export default Tooltip;
