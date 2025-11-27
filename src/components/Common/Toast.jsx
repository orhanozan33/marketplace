import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const isSuccess = type === 'success';
  const icon = isSuccess ? <CheckCircle size={20} /> : <XCircle size={20} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8, rotateX: -20 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, rotateX: 15 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md relative overflow-hidden"
      style={{
        background: isSuccess 
          ? 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)'
          : 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
        boxShadow: isSuccess
          ? '0 25px 50px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.2)'
          : '0 25px 50px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(239, 68, 68, 0.2)',
        transform: 'perspective(1000px) rotateX(3deg) translateZ(30px)',
        transformStyle: 'preserve-3d',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* 3D Işık efekti */}
      <div 
        className="absolute top-0 left-0 w-full h-1/2 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent)',
          transform: 'translateZ(10px)',
        }}
      />
      <div className="flex-shrink-0 relative z-10">{icon}</div>
      <p className="flex-1 text-sm font-medium relative z-10">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors relative z-10"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;

