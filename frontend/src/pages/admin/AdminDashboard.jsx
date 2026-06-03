import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Car, CalendarCheck, DollarSign, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { BookingPieChart } from '../../components/charts/BookingPieChart';
import { useBookings } from '../../context/BookingContext';
import { formatCurrency, formatDate } from '../../utils/pricing';
import api from '../../services/api';

const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-accent',
  active: 'badge-primary',  completed: 'badge-success', rejected: 'badge-danger',
};

export default function AdminDashboard() {
  const { bookings, loading: bLoading, fetchAllBookings } = useBookings();
  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading,  setStatsLoading]  = useState(true);

  useEffect(() => {
    fetchAllBookings();
    // Fetch aggregate platform stats
    Promise.all([
      api.users.stats().catch(() => null),
      api.vehicles.list({ limit: 1 }).catch(() => null),
      api.vehicles.list({ available: true, limit: 1 }).catch(() => null),
      api.agencies.list({ limit: 1 }).catch(() => null),
      api.agencies.list({ status: 'pending', limit: 1 }).catch(() => null),
    ]).then(([uStats, vRes, vAvailRes, aRes, aPendingRes]) => {
      setPlatformStats({
        customers:       uStats?.data?.stats?.find(s => s._id === 'customer')?.count ?? uStats?.data?.total ?? 0,
        totalVehicles:   vRes?.total       ?? 0,
        totalAgencies:   aRes?.total       ?? 0,
        pendingAgencies: aPendingRes?.total ?? 0,
        availableVehicles: vAvailRes?.total ?? 0,
      });
    }).finally(() => setStatsLoading(false));
  }, []);

  const totalRevenue   = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0);
  const conflictRate   = bookings.length ? Math.round((bookings.filter(b => b.status === 'rejected').length / bookings.length) * 100) : 0;

  const statusCounts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const statCards = [
    { title: 'Registered Users',  value: platformStats?.customers    ?? '—', icon: Users,        color: 'primary',  change: '', changeType: 'up' },
    { title: 'Total Vehicles',    value: platformStats?.totalVehicles ?? '—', icon: Car,          color: 'accent',   change: '', changeType: 'up' },
    { title: 'Total Bookings',    value: bookings.length,                     icon: CalendarCheck,color: 'success',  change: '', changeType: 'up' },
    { title: 'System Revenue',    value: formatCurrency(totalRevenue),        icon: DollarSign,   color: 'warning',  change: '', changeType: 'up' },
  ];

  const kpis = [
    {
      label: 'Partner Agencies',
      value: platformStats?.totalAgencies ?? '—',
      sub: platformStats ? `${platformStats.pendingAgencies} pending approval` : '',
      icon: Activity,
      ok: !platformStats?.pendingAgencies,
    },
    {
      label: 'Booking Conflict Rate',
      value: `${conflictRate}%`,
      sub: 'Rejected / Total',
      icon: AlertTriangle,
      ok: conflictRate < 15,
    },
    {
      label: 'Available Vehicles',
      value: platformStats?.availableVehicles ?? '—',
      sub: platformStats ? `of ${platformStats.totalVehicles} total` : '',
      icon: CheckCircle,
      ok: true,
    },
  ];

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          System <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Full platform overview and management console.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.ok ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
              <k.icon size={20} className={k.ok ? 'text-emerald-500' : 'text-amber-500'} />
            </div>
            <div>
              <div className="font-outfit font-black text-2xl" style={{ color: 'var(--text-primary)' }}>{k.value}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{k.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6 min-w-0 overflow-hidden">
          <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Booking Status Distribution</h3>
          {pieData.length > 0
            ? <BookingPieChart data={pieData} />
            : <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No booking data yet</div>}
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Quick Summary</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(79,70,229,0.04)' }}>
                <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{status}</span>
                <span className={`badge ${STATUS_BADGE[status] || 'badge-primary'}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Recent Platform Bookings</h3>
        {bLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Booking ID</th><th>Vehicle</th><th>Customer</th><th>Period</th><th>Amount</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.slice(0, 10).map(b => (
                  <tr key={b._id}>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{b._id?.slice(-8)}</td>
                    <td className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.vehicleName}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.customerName || b.customerId?.name || 'Unknown Customer'}</td>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.startDate)} — {formatDate(b.endDate)}</td>
                    <td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(b.totalPrice)}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.pickupLocation}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
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
