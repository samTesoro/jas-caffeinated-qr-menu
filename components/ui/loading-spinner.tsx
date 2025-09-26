import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-orange-400"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}