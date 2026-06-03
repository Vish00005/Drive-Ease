import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star, MapPin, Phone, Loader2 } from 'lucide-react';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

export default function ManageAgencies() {
  const { toasts, show: showToast, remove } = useToast();
  const [agencies, setAgencies] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.agencies.list()
      .then(res => setAgencies(res.data || []))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.agencies.updateStatus(id, status);
      setAgencies(as => as.map(a => a._id === id ? { ...a, status } : a));
      showToast(status === 'approved' ? 'Agency approved!' : 'Agency suspended.', status === 'approved' ? 'success' : 'warning');
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div className="page-transition">
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="mb-6">
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Manage <span className="gradient-text">Agencies</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{loading ? 'Loading...' : `${agencies.length} rental agencies`}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary-500" /></div>
      ) : agencies.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <p style={{ color: 'var(--text-muted)' }}>No agencies registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agencies.map((agency, i) => (
            <motion.div key={agency._id} id={`agency-card-${agency._id}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.1))' }}>
                  🏢
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-outfit font-bold text-base" style={{ color: 'var(--text-primary)' }}>{agency.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold">{agency.rating?.toFixed(1) || '—'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({agency.totalReviews || 0} reviews)</span>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${agency.status==='approved'?'badge-success':agency.status==='pending'?'badge-warning':'badge-danger'}`}>
                  {agency.status}
                </span>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{agency.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(79,70,229,0.06)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Email</div>
                  <div className="font-bold truncate" style={{ color: 'var(--primary)' }}>{agency.email}</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(79,70,229,0.06)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Reviews</div>
                  <div className="font-bold" style={{ color: 'var(--accent)' }}>{agency.totalReviews || 0}</div>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-xs p-2 rounded-lg"
                  style={{ background: 'rgba(79,70,229,0.06)', color: 'var(--text-secondary)' }}>
                  <MapPin size={11} /> {agency.location} · <Phone size={11} /> {agency.phone}
                </div>
              </div>

              <div className="flex gap-2">
                {agency.status !== 'approved' && (
                  <button id={`approve-agency-${agency._id}`} onClick={() => updateStatus(agency._id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors">
                    <CheckCircle size={13} /> Approve
                  </button>
                )}
                {agency.status !== 'suspended' && (
                  <button id={`suspend-agency-${agency._id}`} onClick={() => updateStatus(agency._id, 'suspended')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 transition-colors">
                    <XCircle size={13} /> Suspend
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
