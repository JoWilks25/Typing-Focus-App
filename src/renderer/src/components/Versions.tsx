import { useState } from 'react';
import styles from './Versions.module.css';
import packageJson from '../../../../package.json';

function Versions(): React.JSX.Element {
  const [versions] = useState(window.api?.process?.versions || { electron: 'N/A', chrome: 'N/A', node: 'N/A' });

  return (
    <div className={styles['versions-container']}>
      <span className={styles['version-item']}>App v{packageJson.version}</span>
      <span className={styles['version-separator']}>|</span>
      <span className={styles['version-item']}>Electron v{versions.electron}</span>
      <span className={styles['version-separator']}>|</span>
      <span className={styles['version-item']}>Chromium v{versions.chrome}</span>
      <span className={styles['version-separator']}>|</span>
      <span className={styles['version-item']}>Node v{versions.node}</span>
    </div>
  );
}

export default Versions;
