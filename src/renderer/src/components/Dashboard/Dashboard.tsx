// src/renderer/src/components/Dashboard/Dashboard.tsx
// Purpose: Main dashboard component showing session overview and statistics

import { FloatingModalDemo } from '../Modals/FloatingModalDemo';

export const Dashboard = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <p className="text-gray-400 mb-6">This will show your writing sessions and statistics.</p>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Floating Modal Demo</h3>
        <p className="text-gray-400 mb-4">Test the floating modal system:</p>
        <FloatingModalDemo />
      </div>
    </div>
  );
};
