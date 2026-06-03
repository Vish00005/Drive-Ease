import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Car, User, UserCheck, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const result = await register(form);
    setLoading(false);
    if (result.success) {
      const role = result.user.role;
      if (role === 'agency') navigate('/agency');
      else navigate('/fleet');
    } else {
      setError(result.error || 'Registration failed. Email might already be registered.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh hero-grid">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#7c3aed' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: '#06b6d4' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-neon" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Car size={22} className="text-white" />
            </div>
            <span className="font-outfit font-black text-2xl">
              <span className="gradient-text">Rent</span>
              <span style={{ color: 'var(--text-primary)' }}>-Drive</span>
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Create your account — it's free!</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-3d">
          <h1 className="font-outfit font-black text-2xl mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Create Account</h1>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', icon: UserCheck, label: 'Rent a Vehicle', desc: 'Browse & book' },
                { value: 'agency', icon: Building2, label: 'List My Fleet', desc: 'Agency owner' },
              ].map(opt => (
                <button
                  key={opt.value}
                  id={`role-${opt.value}`}
                  type="button"
                  onClick={() => set('role', opt.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    form.role === opt.value ? 'border-primary-500' : 'border-transparent'
                  }`}
                  style={{ background: form.role === opt.value ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.03)' }}
                >
                  <opt.icon size={20} className={form.role === opt.value ? 'text-primary-500' : ''} style={{ color: form.role === opt.value ? undefined : 'var(--text-muted)' }} />
                  <div className="font-semibold text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{opt.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle size={15} className="text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-name" type="text" required placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} className="input-field input-icon-l" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-email" type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="input-field input-icon-l" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-password" type={showPass ? 'text' : 'password'} required placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} className="input-field input-icon-lr" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" id="register-login-link" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
