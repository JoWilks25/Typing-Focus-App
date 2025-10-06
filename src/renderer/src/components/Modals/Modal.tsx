// src/renderer/src/components/Modals/Modal.tsx
// Purpose: Base modal component for reusable dialogs

export const Modal = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300">Modal - Coming Soon</p>
      </div>
    </div>
  );
};
