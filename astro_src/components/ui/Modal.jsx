import React from 'react';
import { XIcon } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', noPadding = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full ${maxWidth} max-h-[95vh] overflow-hidden flex flex-col transition-all duration-300 transform scale-100 border border-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-6 sm:p-8'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};