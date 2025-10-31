import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, ...rest }) => {
  return (
    <div className={styles.card} {...rest}>
      {children}
    </div>
  );
};

export default Card;
