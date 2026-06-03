import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, change, changeType = 'up', color = 'primary', index = 0 }) {
  const colorMap = {
    primary: { bg: 'rgba(79,70,229,0.1)', text: '#4f46e5', darkText: '#818cf8', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
    accent:  { bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', darkText: '#22d3ee', gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)' },
    success: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', darkText: '#34d399', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    warning: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', darkText: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    danger:  { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', darkText: '#f87171', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: c.gradient }}
        >
          <Icon size={22} className="text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeType === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-500 bg-red-50 dark:bg-red-500/10'}`}>
            {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
    </motion.div>
  );
}
