import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Mail, MapPin, Loader2 } from 'lucide-react';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

export default function ManageUsers() {
  const { toasts, show: showToast, remove } = useToast();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const res = await api.users.list(params);
      setUsers(res.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'suspended' : 'active';
    try {
      await api.users.updateStatus(u._id, next);
      setUsers(us => us.map(x => x._id === u._id ? { ...x, status: next } : x));
      showToast(`User ${next === 'active' ? 'activated' : 'suspended'}.`, 'info');
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div className="page-transition">
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="mb-6">
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Manage <span className="gradient-text">Users</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{loading ? 'Loading...' : `${filtered.length} users`}</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input id="user-search" type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
        {['all', 'customer', 'agency', 'admin'].map(r => (
          <button key={r} id={`role-tab-${r}`} onClick={() => setRoleFilter(r)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: roleFilter === r ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'var(--surface)',
              color: roleFilter === r ? 'white' : 'var(--text-secondary)',
              borderColor: roleFilter === r ? 'transparent' : 'var(--surface-border)',
            }}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u._id} id={`user-row-${u._id}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff`}
                        alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{u._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td><div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}><Mail size={12} />{u.email}</div></td>
                  <td><span className={`badge ${u.role==='admin'?'badge-success':u.role==='agency'?'badge-accent':'badge-primary'}`}>{u.role}</span></td>
                  <td><div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}><MapPin size={12} />{u.location||'—'}</div></td>
                  <td><span className={`badge ${u.status==='active'?'badge-success':'badge-danger'}`}>{u.status||'active'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <button id={`toggle-user-${u._id}`} onClick={() => toggleStatus(u)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.status==='active'?'text-red-500 bg-red-50 dark:bg-red-500/10':'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'}`}>
                        {u.status==='active' ? <><UserX size={12}/> Suspend</> : <><UserCheck size={12}/> Activate</>}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No users found</div>}
        </div>
      )}
    </div>
  );
}
