import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { BookingPieChart } from '../../components/charts/BookingPieChart';
import { useBookings } from '../../context/BookingContext';
import { formatCurrency, formatDate } from '../../utils/pricing';

const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-accent',
  active: 'badge-primary', completed: 'badge-success',
  rejected: 'badge-danger', cancelled: 'badge-danger',
};

export default function AllBookings() {
  const { bookings, loading, fetchAllBookings } = useBookings();

  useEffect(() => { fetchAllBookings(); }, []);

  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          All <span className="gradient-text">Bookings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Loading...' : `${bookings.length} total bookings across the platform`}
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="glass rounded-xl p-3 text-center">
            <div className="font-outfit font-black text-2xl" style={{ color: 'var(--text-primary)' }}>{count}</div>
            <span className={`badge mt-1 ${STATUS_BADGE[status] || 'badge-primary'}`}>{status}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {pieData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Status Breakdown</h3>
          <BookingPieChart data={pieData} />
        </div>
      )}

      {/* Full Table */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-outfit font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>All Booking Records</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Vehicle</th><th>Customer</th><th>Period</th><th>Amount</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{b._id?.slice(-8)}</td>
                    <td className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.vehicleName}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.customerName || b.customerId?.name || 'Unknown Customer'}</td>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.startDate)} — {formatDate(b.endDate)}</td>
                    <td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(b.totalPrice)}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.pickupLocation}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-primary'}`}>{b.status}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No bookings found</div>}
          </div>
        )}
      </div>
    </div>
  );
}
