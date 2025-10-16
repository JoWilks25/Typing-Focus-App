// src/renderer/src/components/Dashboard/Dashboard.tsx
// Purpose: Main dashboard component showing session overview and statistics

import styles from './Dashboard.module.css';

export const Dashboard = () => {
  return (
    <div className={styles['dashboard-container']}>
      <h2 className={styles['dashboard-title']}>Dashboard</h2>
      <p className={styles['dashboard-description']}>This will show your writing sessions and statistics.</p>
    </div>
  );
};
