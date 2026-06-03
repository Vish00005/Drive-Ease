import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export default function AgencyLayout() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar role="agency" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--surface-border)' }}>
          <div>
            <h2 className="font-outfit font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Agency Portal
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user?.name} · SpeedWheels Rentals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
