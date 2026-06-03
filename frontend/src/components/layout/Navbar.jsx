import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/fleet', label: 'Browse Vehicles' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin';
    if (user.role === 'agency') return '/agency';
    return '/my-bookings';
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'glass shadow-glass py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Car size={18} className="text-white" />
            </div>
            <span className="font-outfit font-black text-xl">
              <span className="gradient-text">Rent</span>
              <span style={{ color: 'var(--text-primary)' }}>-Drive</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 animated-underline ${
                    isActive ? 'nav-active' : ''
                  }`
                }
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  {/* Avatar: show image or initials */}
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border-2 border-primary-200 object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-primary-300 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-glass overflow-hidden"
                    >
                      <div className="p-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        <span className={`badge mt-1 ${user.role === 'admin' ? 'badge-success' : user.role === 'agency' ? 'badge-accent' : 'badge-primary'}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to={getDashboardLink()}
                          id="dashboard-link"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <Link
                          to="/settings"
                          id="settings-link"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Settings size={15} /> Settings
                        </Link>
                        <button
                          id="logout-btn"
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" id="nav-login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" id="nav-register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: 'var(--text-secondary)' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t mt-2" style={{ borderColor: 'var(--surface-border)' }}>
                {NAV_LINKS.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.exact}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'nav-active' : ''}`
                    }
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!user && (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary block text-center mx-4">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
