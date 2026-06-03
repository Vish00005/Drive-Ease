import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Fuel, Users, Calendar, ArrowLeft, CheckCircle, Zap, Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { calculatePrice, formatCurrency, formatDate } from '../../utils/pricing';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { toasts, show: showToast, remove } = useToast();

  const [vehicle,    setVehicle]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeImg,  setActiveImg]  = useState(0);
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.vehicles.get(id)
      .then(res => setVehicle(res.data))
      .catch(e  => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const priceCalc = useMemo(() => calculatePrice(vehicle, startDate, endDate), [vehicle, startDate, endDate]);

  const isDateRangeOverlapping = useMemo(() => {
    if (!startDate || !endDate || !vehicle?.bookings) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return vehicle.bookings.some(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return start < bEnd && end > bStart;
    });
  }, [startDate, endDate, vehicle?.bookings]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate) { showToast('Please select rental dates.', 'warning'); return; }
    if (priceCalc.days <= 0) { showToast('End date must be after start date.', 'error'); return; }
    setSubmitting(true);
    try {
      await createBooking({
        vehicleId: vehicle._id,
        startDate,
        endDate,
        pickupLocation: vehicle.location,
      });
      showToast('Booking request sent! Awaiting agency approval.', 'success');
      setTimeout(() => navigate('/my-bookings'), 1800);
    } catch (e) {
      showToast(e.message || 'Booking failed. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 size={40} className="animate-spin text-primary-500" /></div>
    </div>
  );

  if (error || !vehicle) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">🚗</div>
        <h1 className="font-outfit font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Vehicle not found</h1>
        <Link to="/fleet" className="btn-primary">Back to Fleet</Link>
      </div>
    </div>
  );

  const specs = [
    { label: 'Brand',        value: vehicle.brand        },
    { label: 'Model',        value: vehicle.model        },
    { label: 'Year',         value: vehicle.year         },
    { label: 'Type',         value: vehicle.type === '2W' ? '2-Wheeler' : '4-Wheeler' },
    { label: 'Fuel Type',    value: vehicle.fuelType     },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Seats',        value: vehicle.seats        },
    { label: 'Engine',       value: vehicle.engine       },
    { label: 'Mileage',      value: vehicle.mileage      },
    { label: 'Color',        value: vehicle.color        },
    { label: 'Location',     value: vehicle.location     },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Back to Fleet
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass rounded-3xl overflow-hidden mb-3 aspect-video">
                <img
                  src={vehicle.images?.[activeImg] || vehicle.images?.[0] || `https://ui-avatars.com/api/?name=${vehicle.brand}&background=4f46e5&color=fff&size=600`}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${vehicle.brand}&background=4f46e5&color=fff&size=600`; }}
                />
              </div>
              {vehicle.images?.length > 1 && (
                <div className="flex gap-2">
                  {vehicle.images.map((img, i) => (
                    <button key={i} id={`img-thumb-${i}`} onClick={() => setActiveImg(i)}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-60'}`}
                      style={{ width: 80, height: 55 }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info + Booking */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start gap-2 mb-2">
                <span className={`badge ${vehicle.type === '2W' ? 'badge-primary' : 'badge-accent'}`}>
                  {vehicle.type === '2W' ? '🏍 2-Wheeler' : '🚗 4-Wheeler'}
                </span>
                {vehicle.fuelType === 'Electric' && <span className="badge badge-success"><Zap size={11} /> EV</span>}
                {!vehicle.available ? (
                  <span className="badge badge-danger">✗ Blocked</span>
                ) : vehicle.isBookedToday ? (
                  <span className="badge badge-warning">✗ Booked Today</span>
                ) : (
                  <span className="badge badge-success">✓ Available</span>
                )}
              </div>

              <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>{vehicle.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-sm">{vehicle.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({vehicle.reviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <MapPin size={13} /> {vehicle.location}
                </div>
              </div>

              {/* Agency info */}
              {vehicle.agencyId && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Listed by: <strong style={{ color: 'var(--text-secondary)' }}>{vehicle.agencyId.name || 'Agency'}</strong>
                </p>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[{ label: 'Daily', key: 'daily' }, { label: 'Weekly', key: 'weekly' }, { label: 'Monthly', key: 'monthly' }]
                  .map(({ label, key }) => (
                    <div key={key} className="glass rounded-2xl p-3 text-center border-2 transition-all"
                      style={{ borderColor: priceCalc.type === key && priceCalc.days > 0 ? 'var(--primary)' : 'transparent' }}>
                      <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
                      <div className="font-outfit font-black text-lg" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(vehicle.price?.[key])}
                      </div>
                    </div>
                  ))}
              </div>

              <p className="text-sm leading-relaxed mb-6 p-4 rounded-xl" style={{ background: 'rgba(79,70,229,0.05)', color: 'var(--text-secondary)' }}>
                {vehicle.description}
              </p>

              {/* Features */}
              {vehicle.features?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map(f => (
                      <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)' }}>
                        <CheckCircle size={11} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Picker + Booking */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-outfit font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Select Rental Period</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Start Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input id="start-date" type="date" min={today} value={startDate}
                        onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(''); }}
                        className="input-field pl-10 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>End Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input id="end-date" type="date" min={startDate || today} value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="input-field pl-10 text-sm" />
                    </div>
                  </div>
                </div>

                {isDateRangeOverlapping && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                    <span className="font-semibold">⚠️ Alert:</span> This vehicle is already booked for the selected dates.
                  </div>
                )}

                {priceCalc.days > 0 && !isDateRangeOverlapping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4 mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.05))' }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{priceCalc.days} day{priceCalc.days > 1 ? 's' : ''} × {priceCalc.type} rate</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(vehicle.price?.[priceCalc.type])}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: 'var(--surface-border)' }}>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                      <span className="font-outfit font-black text-xl gradient-text">{formatCurrency(priceCalc.total)}</span>
                    </div>
                  </motion.div>
                )}

                <button id="book-now-btn" onClick={handleBook}
                  disabled={!vehicle.available || isDateRangeOverlapping || submitting}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </span>
                  ) : !vehicle.available ? 'Not Available' : isDateRangeOverlapping ? 'Dates Already Booked' : 'Send Booking Request'}
                </button>

                {vehicle.bookings?.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <h4 className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      🚫 Booked / Unavailable Dates
                    </h4>
                    <div className="space-y-1">
                      {vehicle.bookings.map((b, i) => (
                        <div key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          • {formatDate(b.startDate)} — {formatDate(b.endDate)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!user && (
                  <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                    <Link to="/login" className="text-primary-500 hover:underline">Sign in</Link> to book this vehicle
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Specs */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 glass rounded-3xl p-8">
            <h2 className="font-outfit font-black text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
              Vehicle <span className="gradient-text">Specifications</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {specs.map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(79,70,229,0.04)' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
