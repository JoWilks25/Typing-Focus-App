// src/renderer/src/components/Modals/Modal.tsx
// Purpose: Base modal component for reusable dialogs

import styles from './Modal.module.css';

export const Modal = () => {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <p className={styles['modal-content']}>Modal - Coming Soon</p>
      </div>
    </div>
  );
};
