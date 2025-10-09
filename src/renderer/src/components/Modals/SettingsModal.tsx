// src/renderer/src/components/Modals/SettingsModal.tsx
// Purpose: Settings/preferences modal component

import styles from './SettingsModal.module.css';

export const SettingsModal = () => {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <h3 className={styles['modal-title']}>Settings - Coming Soon</h3>
        <p className={styles['modal-content']}>App preferences will go here.</p>
      </div>
    </div>
  );
};
