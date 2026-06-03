import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Bell, Shield, Menu } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="glass border-b px-4 md:px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors md:hidden text-[var(--text-primary)]"
              style={{ color: 'var(--text-primary)' }}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-emerald-500 hidden sm:block" />
              <div>
                <h2 className="font-outfit font-bold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>Admin Portal</h2>
                <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>{user?.name} · System Administrator</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button className="relative p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
