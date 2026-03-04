import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-card dark:bg-gray-800 rounded-2xl border border-gray-100/50 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
    {/* Image Container Skeleton */}
    <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700">
      {/* Floating Badge Skeleton */}
      <div className="absolute top-3 right-3 w-16 h-6 bg-white/50 dark:bg-gray-600/50 rounded-full"></div>
    </div>

    {/* Content Skeleton */}
    <div className="p-5 flex flex-col flex-grow relative">
      {/* Title Skeleton */}
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>

      {/* Description Lines */}
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6"></div>
      </div>

      {/* Footer / Button Skeleton */}
      <div className="pt-4 mt-auto border-t border-gray-50 dark:border-gray-700">
        <div className="w-full h-10 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
      </div>
    </div>
  </div>
);