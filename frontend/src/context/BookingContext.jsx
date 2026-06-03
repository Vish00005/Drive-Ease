/**
 * BookingContext — all data comes from the backend API.
 * Provides: bookings, loading, error, createBooking, cancelBooking,
 *           updateStatus (agency/admin), refetch
 */
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  /* ── Fetch customer bookings ── */
  const fetchMyBookings = useCallback(async (params) => {
    setLoading(true); setError(null);
    try {
      const res = await api.bookings.my(params);
      setBookings(res.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch agency bookings ── */
  const fetchAgencyBookings = useCallback(async (params) => {
    setLoading(true); setError(null);
    try {
      const res = await api.bookings.agency(params);
      setBookings(res.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch all bookings (admin) ── */
  const fetchAllBookings = useCallback(async (params) => {
    setLoading(true); setError(null);
    try {
      const res = await api.bookings.all(params);
      setBookings(res.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  /* ── Customer: create booking ── */
  const createBooking = useCallback(async (payload) => {
    const res = await api.bookings.create(payload);
    return res.data;
  }, []);

  /* ── Customer: cancel booking ── */
  const cancelBooking = useCallback(async (id) => {
    await api.bookings.cancel(id);
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
  }, []);

  /* ── Customer: rate booking ── */
  const rateBooking = useCallback(async (id, rating, feedback) => {
    const res = await api.bookings.rate(id, { rating, feedback });
    setBookings(prev => prev.map(b => b._id === id ? res.data : b));
    return res.data;
  }, []);

  /* ── Agency/Admin: update status ── */
  const updateStatus = useCallback(async (id, status, rejectionReason) => {
    const res = await api.bookings.updateStatus(id, { status, rejectionReason });
    setBookings(prev => prev.map(b => b._id === id ? res.data : b));
    return res.data;
  }, []);

  /* ── Customer: pay booking ── */
  const payBooking = useCallback(async (id, method, details) => {
    const res = await api.bookings.pay(id, { method, details });
    setBookings(prev => prev.map(b => b._id === id ? res.data : b));
    return res.data;
  }, []);

  /* ── Agency: confirm payment ── */
  const confirmBookingPayment = useCallback(async (id) => {
    const res = await api.bookings.confirmPayment(id);
    setBookings(prev => prev.map(b => b._id === id ? res.data : b));
    return res.data;
  }, []);

  return (
    <BookingContext.Provider value={{
      bookings, loading, error,
      fetchMyBookings, fetchAgencyBookings, fetchAllBookings,
      createBooking, cancelBooking, rateBooking, updateStatus,
      payBooking, confirmBookingPayment,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);
