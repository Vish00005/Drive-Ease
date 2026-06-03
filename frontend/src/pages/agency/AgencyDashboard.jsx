import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, CalendarCheck, DollarSign, Clock, CheckCircle, XCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import { BookingPieChart, UtilizationChart } from '../../components/charts/BookingPieChart';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { formatCurrency, formatDate } from '../../utils/pricing';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-accent',
  active: 'badge-primary', completed: 'badge-success', rejected: 'badge-danger',
};

export default function AgencyDashboard() {
  const { user } = useAuth();
  const { bookings, loading: bLoading, fetchAgencyBookings, updateStatus } = useBookings();
  const { toasts, show: showToast, remove } = useToast();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchAgencyBookings();
    // Fetch dashboard stats
    api.agencies.dashboardStats()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const pendingBookings   = bookings.filter(b => b.status === 'pending');
  const activeBookings    = bookings.filter(b => b.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue      = completedBookings.reduce((s, b) => s + b.totalPrice, 0);

  const statCards = [
    { title: 'Fleet Size',         value: stats?.fleetTotal     ?? '—', icon: Car,          color: 'primary',  change: '', changeType: 'up'   },
    { title: 'Active Rentals',     value: activeBookings.length,        icon: Clock,        color: 'accent',   change: '', changeType: 'up'   },
    { title: 'Total Revenue',      value: formatCurrency(stats?.totalRevenue ?? totalRevenue), icon: DollarSign,   color: 'success',  change: '', changeType: 'up'   },
    { title: 'Pending Requests',   value: stats?.pendingCount ?? pendingBookings.length,       icon: CalendarCheck,color: 'warning',  change: ''                     },
  ];

  // Chart data derived from real bookings
  const statusCounts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const handleApprove = async (b) => {
    try {
      await updateStatus(b._id, 'confirmed');
      showToast('Booking approved!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleReject = async (b) => {
    try {
      await updateStatus(b._id, 'rejected');
      showToast('Booking rejected.', 'warning');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const hasActiveSub = user?.agencyId?.subscriptionStatus === 'active';
  const currentPlan = user?.agencyId?.subscriptionPlan || 'none';
  const planDisplay = currentPlan === 'none' ? 'No Plan' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) + ' Plan';

  return (
    <div className="page-transition space-y-6">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Subscription Alert Banner */}
      {!hasActiveSub && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border text-amber-800 dark:text-amber-300"
          style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
            borderColor: 'rgba(245, 158, 11, 0.3)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-sm">Subscription Required</h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Your account does not have an active subscription plan. You cannot add fleet or accept rentals until you subscribe.
              </p>
            </div>
          </div>
          <Link
            to="/agency/pricing"
            className="btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5 flex-shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
            }}
          >
            Choose Plan <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-outfit font-black text-3xl mb-1 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
            <span className={`badge text-xs font-bold py-1 px-3 ${
              hasActiveSub 
                ? (currentPlan === 'enterprise' ? 'badge-accent' : 'badge-success') 
                : 'badge-danger'
            }`}>
              {planDisplay}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's your fleet performance overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Booking Status Overview</h3>
          {pieData.length > 0
            ? <BookingPieChart data={pieData} />
            : <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No booking data yet</div>}
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Completed Trips', value: completedBookings.length, color: 'text-emerald-500' },
              { label: 'Active Rentals',  value: activeBookings.length,    color: 'text-indigo-500'  },
              { label: 'Pending',         value: pendingBookings.length,   color: 'text-amber-500'   },
              { label: 'Total Revenue',   value: formatCurrency(totalRevenue), color: 'text-primary-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(79,70,229,0.04)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className={`font-outfit font-bold text-sm ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-outfit font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Pending Requests
            {pendingBookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-600">{pendingBookings.length}</span>
            )}
          </h3>
        </div>
        {bLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : pendingBookings.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle size={36} className="mx-auto mb-2 text-emerald-400" />
            <p>All requests processed!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(79,70,229,0.04)' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.vehicleName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {b.customerName || b.customerId?.name || 'Unknown Customer'} · {formatDate(b.startDate)} — {formatDate(b.endDate)} · {b.days}d · {formatCurrency(b.totalPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button id={`approve-${b._id}`} onClick={() => handleApprove(b)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button id={`reject-${b._id}`} onClick={() => handleReject(b)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 transition-colors">
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings Table */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h3>
        {bLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : bookings.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Customer</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.slice(0, 8).map(b => (
                  <tr key={b._id}>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.vehicleName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.customerName || b.customerId?.name || 'Unknown Customer'}</td>
                    <td>{formatDate(b.startDate)} — {formatDate(b.endDate)}</td>
                    <td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(b.totalPrice)}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-primary'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
