import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.id = 'toast-container';
  toast.className = 'fixed top-4 right-4 z-[99999]';
  document.body.appendChild(toast);

  const ToastComponent = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        toast.remove();
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        <CheckCircle size={20} />
        <span className="font-semibold">{message}</span>
      </motion.div>
    );
  };

  // React'i kullanmadan basit bir toast
  toast.innerHTML = `
    <div class="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-green-500 text-white animate-slide-in">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};


