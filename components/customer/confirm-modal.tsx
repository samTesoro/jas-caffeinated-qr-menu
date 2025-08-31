import React from 'react';

export default function ConfirmModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center">
        <h2 className="font-bold text-black text-xl mb-4">Cancel this item order?</h2>
        <div className="flex gap-6">
          <button className="bg-red-400 text-white rounded-full px-6 py-2 font-bold" onClick={onClose}>No</button>
          <button className="bg-green-300 text-black rounded-full px-6 py-2 font-bold" onClick={onClose}>Yes</button>
        </div>
      </div>
    </div>
  );
}
