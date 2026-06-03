import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      id="theme-toggle"
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-7 rounded-full p-0.5 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
          : 'linear-gradient(135deg, #f59e0b, #f97316)',
      }}
      aria-label="Toggle dark mode"
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={13} className="text-indigo-600" />
        ) : (
          <Sun size={13} className="text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
