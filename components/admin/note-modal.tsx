"use client";

import { X } from "lucide-react";

interface NotesModalProps {
  open: boolean;
  note?: string;
  itemName?: string;
  onClose: () => void;
}

export default function NotesModal({ open, note, itemName, onClose }: NotesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md py-4 px-7 w-[320px] relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-left mt-3 text-black">
            Note
          </h3>
          <button className="text-black" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-1 mb-[50px] text-black text-left text-sm">
          {note}
        </div>
        <div className="absolute bottom-3 right-7 text-xs text-gray-500 font-semibold">
          {itemName}
        </div>
      </div>
    </div>
  );
}