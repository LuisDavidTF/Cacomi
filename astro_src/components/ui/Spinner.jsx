import React from 'react';

export const Spinner = ({ className = "" }) => (
  <div className={`flex justify-center items-center py-4 ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
  </div>
);