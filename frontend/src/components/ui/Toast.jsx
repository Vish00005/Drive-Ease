import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const colors = {
  success: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  error: 'border-l-red-500 bg-red-50 dark:bg-red-500/10',
  warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-500/10',
  info: 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-500/10',
};
const textColors = {
  success: 'text-emerald-700 dark:text-emerald-400',
  error: 'text-red-700 dark:text-red-400',
  warning: 'text-amber-700 dark:text-amber-400',
  info: 'text-indigo-700 dark:text-indigo-400',
};

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = icons[type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-xl backdrop-blur-lg max-w-sm ${colors[type]}`}
    >
      <Icon size={18} className={textColors[type]} />
      <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// Toast Container & Hook
let toastCallbacks = [];
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = (message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
  };

  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));

  return { toasts, show, remove };
}

export function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
