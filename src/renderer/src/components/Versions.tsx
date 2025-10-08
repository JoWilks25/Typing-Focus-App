import { useState } from 'react';

function Versions(): React.JSX.Element {
  const [versions] = useState(window.api?.process?.versions || { electron: 'N/A', chrome: 'N/A', node: 'N/A' });

  return (
    <div className="flex justify-center items-center gap-4 text-xs text-gray-400 font-mono">
      <span>Electron v{versions.electron}</span>
      <span className="text-gray-600">|</span>
      <span>Chromium v{versions.chrome}</span>
      <span className="text-gray-600">|</span>
      <span>Node v{versions.node}</span>
    </div>
  );
}

export default Versions;
