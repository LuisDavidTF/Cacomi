'use client'
import React, { useEffect } from 'react';
import { create } from 'zustand';

export const useToast = create((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  }
}));

export function ToastProvider({ children }) {
  const toast = useToast((state) => state.toast);

  return (
    <>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white
          ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}
          transition-all duration-300 animate-fade-in-up z-50`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}