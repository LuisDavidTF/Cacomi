import React from 'react';
import { AlertTriangleIcon } from './Icons';

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-md min-h-[300px]">
    <AlertTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-black/50"
    >
      Volver a intentar
    </button>
  </div>
);