import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const themes = {
    danger: {
      icon: <AlertCircle className="text-rose-600" size={32} />,
      button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 ring-rose-500/20',
      bg: 'bg-rose-100/50',
    },
    warning: {
      icon: <AlertCircle className="text-amber-600" size={32} />,
      button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 ring-amber-500/20',
      bg: 'bg-amber-100/50',
    },
    info: {
      icon: <AlertCircle className="text-primary" size={32} />,
      button: 'bg-primary hover:opacity-90 text-white shadow-primary/20 ring-primary/20',
      bg: 'bg-primary/10',
    }
  };

  const theme = themes[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden"
          >
            <div className="p-10">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={cn("p-6 rounded-3xl mb-8", theme.bg)}
                >
                  {theme.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-[280px]">
                  {message}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full py-4.5 text-base font-bold rounded-2xl shadow-xl transition-all active:scale-95 ring-offset-2 focus:ring-4",
                    theme.button
                  )}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4.5 text-base font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
