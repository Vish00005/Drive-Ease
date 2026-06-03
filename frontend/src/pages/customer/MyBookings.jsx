import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, Car, Loader2, Star } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { formatCurrency, formatDate } from '../../utils/pricing';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   class: 'badge-warning', dot: 'bg-amber-500'  },
  confirmed: { label: 'Confirmed', class: 'badge-accent',  dot: 'bg-cyan-500'   },
  active:    { label: 'Active',    class: 'badge-primary', dot: 'bg-indigo-500' },
  completed: { label: 'Completed', class: 'badge-success', dot: 'bg-emerald-500' },
  rejected:  { label: 'Rejected',  class: 'badge-danger',  dot: 'bg-red-500'    },
  cancelled: { label: 'Cancelled', class: 'badge-danger',  dot: 'bg-red-400'    },
};

const TABS = ['all', 'pending', 'confirmed', 'active', 'completed', 'rejected', 'cancelled'];

export default function MyBookings() {
  const { user } = useAuth();
  const { bookings, loading, error, fetchMyBookings, cancelBooking, rateBooking, payBooking } = useBookings();
  const { toasts, show: showToast, remove } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  // Rating Modal States
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Payment Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cash'
  const [upiTxnId, setUpiTxnId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (user) fetchMyBookings();
  }, [user]);

  const openRateModal = (b) => {
    setSelectedBooking(b);
    setRating(5);
    setFeedback('');
    setRateModalOpen(true);
  };

  const openPaymentModal = (b) => {
    setSelectedBooking(b);
    setPaymentMethod('upi');
    setUpiTxnId('');
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
    setCvvFocused(false);
    setPayModalOpen(true);
  };

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCardCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(val);
  };

  const handleUpiTxnChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
    setUpiTxnId(val);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedBooking) return;
    setSubmittingPayment(true);
    try {
      let details = {};
      if (paymentMethod === 'upi') {
        if (!/^\d{12}$/.test(upiTxnId)) {
          throw new Error('Please enter a valid 12-digit UPI Transaction Reference ID');
        }
        details = { transactionId: upiTxnId };
      } else if (paymentMethod === 'card') {
        const cleanNo = cardNumber.replace(/\s/g, '');
        if (cleanNo.length !== 16) {
          throw new Error('Please enter a valid 16-digit card number');
        }
        if (!cardHolder.trim()) {
          throw new Error('Please enter the cardholder name');
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
          throw new Error('Please enter a valid expiry date (MM/YY)');
        }
        if (cardCvv.length !== 3) {
          throw new Error('Please enter a valid 3-digit CVV');
        }
        details = {
          cardholderName: cardHolder,
          cardNumber: `xxxx-xxxx-xxxx-${cleanNo.slice(-4)}`
        };
      }

      await payBooking(selectedBooking._id, paymentMethod, details);
      showToast('Payment submitted successfully! Awaiting agency verification.', 'success');
      setPayModalOpen(false);
    } catch (e) {
      showToast(e.message || 'Payment submission failed', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleRateSubmit = async () => {
    if (!selectedBooking) return;
    setSubmittingRating(true);
    try {
      await rateBooking(selectedBooking._id, rating, feedback);
      showToast('Thank you for your feedback!', 'success');
      setRateModalOpen(false);
    } catch (e) {
      showToast(e.message || 'Failed to submit rating', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const displayed = bookings.filter(b => activeTab === 'all' || b.status === activeTab);

  const handleCancel = async (booking) => {
    try {
      await cancelBooking(booking._id);
      showToast('Booking cancelled.', 'info');
    } catch (e) {
      showToast(e.message || 'Failed to cancel booking.', 'error');
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="font-outfit font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Please login to view bookings</h2>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-outfit font-black text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
              My <span className="gradient-text">Bookings</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : `${displayed.length} booking${displayed.length !== 1 ? 's' : ''}`}
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button key={tab} id={`booking-tab-${tab}`} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--surface)',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${activeTab === tab ? 'transparent' : 'var(--surface-border)'}`,
                }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={36} className="animate-spin text-primary-500" />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => fetchMyBookings()} className="btn-primary">Retry</button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-outfit font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No bookings yet</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'all' ? 'Start your rental journey today!' : `No ${activeTab} bookings found.`}
              </p>
              <Link to="/fleet" className="btn-primary">Browse Fleet</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((booking, i) => {
                let statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                if (booking.status === 'confirmed' && booking.paymentStatus === 'pending_approval') {
                  statusCfg = { label: 'Payment Under Review', class: 'badge-warning', dot: 'bg-amber-500' };
                } else if (booking.status === 'confirmed' && booking.paymentStatus === 'unpaid') {
                  statusCfg = { label: 'Approved (Unpaid)', class: 'badge-accent', dot: 'bg-cyan-500' };
                }
                const img = booking.vehicleId?.images?.[0];
                return (
                  <motion.div key={booking._id} id={`booking-${booking._id}`}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass rounded-2xl p-5 hover:shadow-card-hover transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.05))' }}>
                        {img ? <img src={img} alt={booking.vehicleName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Car size={30} style={{ color: 'var(--text-muted)' }} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-outfit font-bold text-base" style={{ color: 'var(--text-primary)' }}>{booking.vehicleName}</h3>
                            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{booking._id?.slice(-8)}</p>
                          </div>
                          <span className={`badge ${statusCfg.class} flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <Calendar size={13} className="text-primary-500" />
                            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <Clock size={13} className="text-primary-500" />
                            {booking.days} day{booking.days > 1 ? 's' : ''} ({booking.durationType})
                          </span>
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <MapPin size={13} className="text-primary-500" />{booking.pickupLocation}
                          </span>
                        </div>
                        {booking.rating && booking.feedback && (
                          <div className="mb-3 p-2.5 rounded-xl text-xs italic" style={{ background: 'rgba(245,158,11,0.04)', color: 'var(--text-secondary)' }}>
                            “ {booking.feedback} ”
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-outfit font-black text-lg gradient-text">{formatCurrency(booking.totalPrice)}</span>
                          <div className="flex items-center gap-2">
                            {['pending', 'confirmed'].includes(booking.status) && (
                              <button id={`cancel-booking-${booking._id}`} onClick={() => handleCancel(booking)}
                                className="text-xs px-3 py-1.5 rounded-lg text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors">
                                Cancel
                              </button>
                            )}
                            {booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && (
                              <button id={`pay-booking-${booking._id}`} onClick={() => openPaymentModal(booking)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors flex items-center gap-1 shadow-sm">
                                Pay Now
                              </button>
                            )}
                            {booking.status === 'confirmed' && booking.paymentStatus === 'pending_approval' && (
                              <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20 select-none">
                                Verification Pending
                              </span>
                            )}
                            {booking.status === 'completed' && (
                              booking.rating ? (
                                <div className="flex items-center gap-0.5 mr-2" title={`Rated ${booking.rating} stars`}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={13} className={star <= booking.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
                                  ))}
                                </div>
                              ) : (
                                <button id={`rate-${booking._id}`} onClick={() => openRateModal(booking)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors flex items-center gap-1">
                                  <Star size={11} className="fill-white" /> Rate Trip
                                </button>
                              )
                            )}
                            {booking.vehicleId?._id && (
                              <Link to={`/vehicle/${booking.vehicleId._id}`} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                                View Vehicle <ChevronRight size={13} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Rate Your Trip" size="md">
        <div className="space-y-4">
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-secondary)' }}>
            How was your rental experience with the <strong className="text-indigo-500">{selectedBooking?.vehicleName}</strong>?
          </p>

          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                id={`star-${star}`}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform active:scale-95 hover:scale-110"
              >
                <Star
                  size={32}
                  className={star <= rating ? "fill-amber-400 text-amber-400 filter drop-shadow-md" : "text-gray-300 dark:text-gray-600"}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Written Feedback (Optional)
            </label>
            <textarea
              id="feedback-text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you liked or what could be improved..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <button onClick={() => setRateModalOpen(false)} className="btn-ghost">Cancel</button>
            <button
              id="submit-rating-btn"
              onClick={handleRateSubmit}
              disabled={submittingRating}
              className="btn-primary"
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Checkout Modal */}
      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Secure Checkout" size="md">
        <style>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          @keyframes scan {
            0%, 100% { top: 0%; }
            50% { top: 100%; }
          }
          .scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #10b981, transparent);
            box-shadow: 0 0 8px #10b981;
            animation: scan 2s linear infinite;
          }
        `}</style>

        <div className="space-y-5">
          {/* Booking Summary */}
          <div className="p-3.5 rounded-xl text-xs flex flex-col gap-1.5" style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid var(--surface-border)' }}>
            <div className="flex justify-between font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              <span>{selectedBooking?.vehicleName}</span>
              <span className="gradient-text">{selectedBooking && formatCurrency(selectedBooking.totalPrice)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Rental Duration ({selectedBooking?.days} day{selectedBooking?.days > 1 ? 's' : ''})</span>
              <span>{selectedBooking && formatDate(selectedBooking.startDate)} — {selectedBooking && formatDate(selectedBooking.endDate)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Pickup Location</span>
              <span>{selectedBooking?.pickupLocation}</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upi', label: 'UPI QR' },
              { id: 'card', label: 'Card' },
              { id: 'cash', label: 'Pay Cash' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                id={`pay-tab-${m.id}`}
                onClick={() => setPaymentMethod(m.id)}
                className="py-2.5 rounded-xl text-xs font-bold transition-all border text-center"
                style={{
                  background: paymentMethod === m.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--surface)',
                  color: paymentMethod === m.id ? 'white' : 'var(--text-secondary)',
                  borderColor: paymentMethod === m.id ? 'transparent' : 'var(--surface-border)'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Payment Method Details */}
          <div className="pt-2 min-h-[220px]">
            {paymentMethod === 'upi' && (
              <div className="space-y-4 flex flex-col items-center">
                {/* Mock QR Code Container */}
                <div className="relative w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 overflow-hidden">
                  <div className="scan-line" />
                  <svg width="120" height="120" viewBox="0 0 140 140" className="text-slate-900 fill-current">
                    <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="18" y="18" width="14" height="14" fill="currentColor" />
                    <rect x="100" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="108" y="18" width="14" height="14" fill="currentColor" />
                    <rect x="10" y="100" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="18" y="108" width="14" height="14" fill="currentColor" />
                    <rect x="50" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="65" y="15" width="16" height="8" fill="currentColor" />
                    <rect x="55" y="30" width="8" height="16" fill="currentColor" />
                    <rect x="85" y="20" width="8" height="8" fill="currentColor" />
                    <rect x="100" y="50" width="16" height="8" fill="currentColor" />
                    <rect x="110" y="65" width="8" height="16" fill="currentColor" />
                    <rect x="125" y="55" width="8" height="8" fill="currentColor" />
                    <rect x="10" y="50" width="8" height="16" fill="currentColor" />
                    <rect x="25" y="60" width="16" height="8" fill="currentColor" />
                    <rect x="15" y="75" width="8" height="8" fill="currentColor" />
                    <rect x="50" y="50" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="58" y="58" width="14" height="14" fill="currentColor" />
                    <rect x="50" y="90" width="8" height="8" fill="currentColor" />
                    <rect x="65" y="95" width="16" height="16" fill="currentColor" />
                    <rect x="90" y="90" width="8" height="8" fill="currentColor" />
                    <rect x="100" y="100" width="16" height="8" fill="currentColor" />
                    <rect x="120" y="110" width="8" height="16" fill="currentColor" />
                    <rect x="95" y="120" width="20" height="8" fill="currentColor" />
                    <rect x="55" y="120" width="8" height="8" fill="currentColor" />
                  </svg>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Scan QR to Pay: <span className="font-mono text-indigo-500 font-bold">driveease@upi</span>
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Or pay using any UPI app (GPay, PhonePe, Paytm, BHIM)
                  </p>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    12-Digit Transaction Reference ID (UTR)
                  </label>
                  <input
                    type="text"
                    id="upi-txn-id"
                    value={upiTxnId}
                    onChange={handleUpiTxnChange}
                    placeholder="e.g. 123456789012"
                    className="input-field font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                {/* 3D Flip Card Visualization */}
                <div className="w-full max-w-[320px] mx-auto h-44 relative mb-4 perspective-1000">
                  <div className="w-full h-full duration-500 transform-style-3d relative" style={{ transform: cvvFocused ? 'rotateY(180deg)' : 'none' }}>
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between backface-hidden shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, rgba(79,70,229,0.85), rgba(6,182,212,0.65))',
                           border: '1px solid rgba(255,255,255,0.2)',
                         }}>
                       <div className="flex justify-between items-start">
                         <div className="w-9 h-7 rounded bg-amber-400/40 relative overflow-hidden">
                           <div className="absolute inset-0.5 grid grid-cols-3 gap-0.5 opacity-40">
                             {[...Array(9)].map((_, idx) => <div key={idx} className="border border-white/50" />)}
                           </div>
                         </div>
                         <span className="font-outfit font-black italic text-base text-white">DriveEase Pay</span>
                       </div>
                       
                       <div className="text-lg font-mono tracking-widest text-white/95 py-2">
                         {cardNumber || '•••• •••• •••• ••••'}
                       </div>
                       
                       <div className="flex justify-between items-end">
                         <div className="min-w-0 flex-1 mr-2">
                           <div className="text-[8px] text-white/50 uppercase font-mono">Cardholder</div>
                           <div className="text-xs font-semibold tracking-wider text-white truncate">
                             {cardHolder.toUpperCase() || 'YOUR NAME'}
                           </div>
                         </div>
                         <div className="text-right flex-shrink-0">
                           <div className="text-[8px] text-white/50 uppercase font-mono">Expiry</div>
                           <div className="text-xs font-semibold tracking-wider text-white">
                             {cardExpiry || 'MM/YY'}
                           </div>
                         </div>
                       </div>
                    </div>
                    
                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between backface-hidden shadow-lg rotate-y-180"
                         style={{
                           background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(55,65,81,0.9))',
                           border: '1px solid rgba(255,255,255,0.1)',
                         }}>
                       <div className="h-8 bg-black -mx-4 mt-2" />
                       
                       <div className="my-2">
                         <div className="text-[8px] text-white/50 uppercase font-mono mb-1 text-right">CVV</div>
                         <div className="h-7 bg-white/10 rounded flex items-center justify-end px-2">
                           <div className="bg-white text-black font-mono text-xs px-2 py-0.5 rounded select-none font-bold">
                             {cardCvv || '•••'}
                           </div>
                         </div>
                       </div>
                       
                       <div className="text-[8px] text-white/30 leading-none">
                         Simulated payment for DriveEase. No real transactions are processed.
                       </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="card-holder"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. JOHN DOE"
                      className="input-field"
                      onFocus={() => setCvvFocused(false)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="e.g. 4111 2222 3333 4444"
                      className="input-field font-mono"
                      onFocus={() => setCvvFocused(false)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="card-expiry"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      placeholder="MM/YY"
                      className="input-field font-mono"
                      onFocus={() => setCvvFocused(false)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      CVV
                    </label>
                    <input
                      type="password"
                      id="card-cvv"
                      value={cardCvv}
                      onChange={handleCardCvvChange}
                      placeholder="•••"
                      className="input-field font-mono"
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => setCvvFocused(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="flex flex-col justify-center h-full min-h-[220px] p-4 rounded-xl text-center space-y-4" style={{ background: 'rgba(245,158,11,0.02)', border: '1px dashed rgba(245,158,11,0.2)' }}>
                <div className="text-4xl">💵</div>
                <div className="space-y-1.5">
                  <h4 className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Pay in Cash at Agency</h4>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    You will pay the total amount of <strong className="text-emerald-500 font-black">{selectedBooking && formatCurrency(selectedBooking.totalPrice)}</strong> in cash at the counter upon vehicle collection.
                  </p>
                </div>
                
                {selectedBooking?.agencyId && (
                  <div className="p-3 rounded-lg text-left text-xs space-y-1 bg-neutral-50 dark:bg-neutral-800/30">
                    <p style={{ color: 'var(--text-primary)' }}>
                      <strong>Agency Name:</strong> {selectedBooking.agencyId.name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      <strong>Pickup Address:</strong> {selectedBooking.pickupLocation}
                    </p>
                    {selectedBooking.agencyId.phone && (
                      <p style={{ color: 'var(--text-secondary)' }}>
                        <strong>Contact Phone:</strong> {selectedBooking.agencyId.phone}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-[10px] text-amber-500 font-medium italic">
                  Note: The agency must verify your request and confirm the transaction at the counter to start the rental.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <button onClick={() => setPayModalOpen(false)} className="btn-ghost">Cancel</button>
            <button
              id="submit-payment-btn"
              onClick={handlePaymentSubmit}
              disabled={submittingPayment}
              className="btn-primary"
            >
              {submittingPayment ? 'Processing...' : (paymentMethod === 'cash' ? 'Confirm Cash Request' : 'Submit Payment')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
