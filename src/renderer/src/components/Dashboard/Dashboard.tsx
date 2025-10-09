// src/renderer/src/components/Dashboard/Dashboard.tsx
// Purpose: Main dashboard component showing session overview and statistics

import { FloatingModalDemo } from '../Modals/FloatingModalDemo';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  return (
    <div className={styles['dashboard-container']}>
      <h2 className={styles['dashboard-title']}>Dashboard</h2>
      <p className={styles['dashboard-description']}>This will show your writing sessions and statistics.</p>

      <div className={styles['demo-section']}>
        <h3 className={styles['demo-title']}>Floating Modal Demo</h3>
        <p className={styles['demo-description']}>Test the floating modal system:</p>
        <FloatingModalDemo />
      </div>
    </div>
  );
};
