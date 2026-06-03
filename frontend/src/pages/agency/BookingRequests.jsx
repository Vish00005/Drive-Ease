import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Loader2, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { formatCurrency, formatDate } from '../../utils/pricing';
import { useToast, ToastContainer } from '../../components/ui/Toast';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'active', 'completed', 'rejected'];
const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-accent', active: 'badge-primary', completed: 'badge-success', rejected: 'badge-danger'
};

export default function BookingRequests() {
  const { user } = useAuth();
  const { bookings, loading, fetchAgencyBookings, updateStatus, confirmBookingPayment } = useBookings();
  const { toasts, show: showToast, remove } = useToast();
  const [tab, setTab] = useState('all');

  useEffect(() => {
    fetchAgencyBookings();
  }, [fetchAgencyBookings]);

  const userAgencyId = typeof user?.agencyId === 'object' ? user.agencyId?._id : user?.agencyId;

  const agencyBookings = bookings
    .filter(b => {
      const bookingAgencyId = typeof b.agencyId === 'object' ? b.agencyId?._id : b.agencyId;
      return bookingAgencyId === (userAgencyId || 'a1');
    })
    .filter(b => tab === 'all' || b.status === tab)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const approve = async (b) => {
    try {
      await updateStatus(b._id, 'confirmed');
      showToast('Booking approved!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to approve booking', 'error');
    }
  };

  const reject = async (b) => {
    try {
      await updateStatus(b._id, 'rejected');
      showToast('Booking rejected.', 'warning');
    } catch (e) {
      showToast(e.message || 'Failed to reject booking', 'error');
    }
  };

  const startTrip = async (b) => {
    try {
      await updateStatus(b._id, 'active');
      showToast('Trip started!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to start trip', 'error');
    }
  };

  const completeTrip = async (b) => {
    try {
      await updateStatus(b._id, 'completed');
      showToast('Trip completed!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to complete trip', 'error');
    }
  };

  const confirmPayment = async (b) => {
    try {
      await confirmBookingPayment(b._id);
      showToast('Payment confirmed! Rental trip is now active.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to confirm payment', 'error');
    }
  };

  return (
    <div className="page-transition">
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="mb-6">
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Booking <span className="gradient-text">Requests</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{agencyBookings.length} booking{agencyBookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            id={`req-tab-${t}`}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border"
            style={{
              background: tab === t ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--surface)',
              color: tab === t ? 'white' : 'var(--text-secondary)',
              borderColor: tab === t ? 'transparent' : 'var(--surface-border)',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-primary-500" />
        </div>
      ) : agencyBookings.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Clock size={48} className="mx-auto mb-3 opacity-20" />
          <p style={{ color: 'var(--text-muted)' }}>No {tab === 'all' ? '' : tab} bookings found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencyBookings.map((b, i) => (
                <motion.tr
                  key={b._id}
                  id={`booking-row-${b._id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.vehicleName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{b._id}</p>
                  </td>
                  <td>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.customerId?.name || b.customerName || 'Unknown Customer'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{b.customerId?.email || 'No email'}</p>
                  </td>
                  <td>
                    <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={11} /> {formatDate(b.startDate)} — {formatDate(b.endDate)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.days}d · {b.durationType}</div>
                  </td>
                  <td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(b.totalPrice)}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span>
                      {b.status === 'confirmed' && (
                        b.paymentStatus === 'unpaid' ? (
                          <span className="text-[10px] font-semibold text-amber-500 select-none">Awaiting Payment</span>
                        ) : b.paymentStatus === 'pending_approval' ? (
                          <div className="text-[10px] leading-tight text-indigo-500 font-bold flex flex-col gap-0.5">
                            <span>Paid (Review)</span>
                            <span className="text-[9px] text-gray-500 font-mono select-text font-normal">
                              {b.paymentMethod === 'upi' && `UPI: ${b.paymentDetails?.transactionId}`}
                              {b.paymentMethod === 'card' && `Card: ${b.paymentDetails?.cardNumber} (${b.paymentDetails?.cardholderName})`}
                              {b.paymentMethod === 'cash' && `Cash payment on counter`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-500 select-none">Paid</span>
                        )
                      )}
                    </div>
                  </td>
                  <td>
                    {b.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button id={`approve-req-${b._id}`} onClick={() => approve(b)} title="Approve" className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                          <CheckCircle size={16} />
                        </button>
                        <button id={`reject-req-${b._id}`} onClick={() => reject(b)} title="Reject" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      b.paymentStatus === 'pending_approval' ? (
                        <button id={`confirm-pay-${b._id}`} onClick={() => confirmPayment(b)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors shadow-sm">
                          <CheckCircle size={12} /> Confirm Payment
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 select-none italic">Awaiting Payment</span>
                      )
                    )}
                    {b.status === 'active' && (
                      <button id={`complete-trip-${b._id}`} onClick={() => completeTrip(b)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors">
                        <CheckCircle size={12} /> End Trip
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
