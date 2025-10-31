import React from 'react';
import styles from './ConfirmationModal.module.css';
import Button from './Button'; // Import the new Button component

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.buttonContainer}>
          <Button onClick={onCancel} variant="secondary">Cancel</Button>
          <Button onClick={onConfirm} variant="danger">Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
