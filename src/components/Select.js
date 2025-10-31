import React from 'react';
import styles from './Select.module.css';

const Select = ({ value, onChange, children, ...rest }) => {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={onChange}
      {...rest}
    >
      {children}
    </select>
  );
};

export default Select;
