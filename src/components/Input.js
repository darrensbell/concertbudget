import React from 'react';
import styles from './Input.module.css';

const Input = ({ value, onChange, ...rest }) => {
  return (
    <input
      className={styles.input}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

export default Input;
