import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarCheck, Users, BarChart3, Settings, LogOut, Shield, Building2, ClipboardList, CreditCard, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Car as CarLogo } from 'lucide-react';

const AGENCY_LINKS = [
  { to: '/agency', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/agency/fleet', label: 'My Fleet', icon: Car },
  { to: '/agency/bookings', label: 'Booking Requests', icon: CalendarCheck },
  { to: '/agency/pricing', label: 'Subscription', icon: CreditCard },
  { to: '/agency/profile', label: 'Agency Profile', icon: Building2 },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/agencies', label: 'Agencies', icon: Building2 },
  { to: '/admin/bookings', label: 'All Bookings', icon: ClipboardList },
];

export default function Sidebar({ role = 'agency', isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? ADMIN_LINKS : AGENCY_LINKS;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 md:static md:flex flex-col h-full w-64 glass border-r transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        style={{ borderColor: 'var(--surface-border)', background: 'var(--bg-primary)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <CarLogo size={16} className="text-white" />
          </div>
          <span className="font-outfit font-black text-lg">
            <span className="gradient-text">Rent</span>
            <span style={{ color: 'var(--text-primary)' }}>-Drive</span>
          </span>
          {role === 'admin' && (
            <Shield size={14} className="ml-2 text-emerald-500 md:block hidden" />
          )}
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3 p-4 m-3 rounded-xl" style={{ background: 'rgba(79,70,229,0.06)' }}>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl border-2 border-primary-200" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <span className={`badge text-xs ${role === 'admin' ? 'badge-success' : 'badge-accent'}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              id={`sidebar-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={17} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--surface-border)' }}>
          <NavLink to="/fleet" onClick={onClose} className="sidebar-link">
            <Car size={17} /> Browse Fleet
          </NavLink>
          <button
            id="sidebar-logout"
            onClick={() => { onClose?.(); logout(); navigate('/'); }}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
