import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';
import Button from '../components/Button'; // Using the standardized Button

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Oops! Page not found.</p>
        <p className={styles.description}>
          We can't seem to find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
