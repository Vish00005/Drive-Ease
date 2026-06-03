import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VehicleCard from '../../components/ui/VehicleCard';
import api from '../../services/api';

const DEFAULT_FILTERS = {
  search: '', type: '', fuelType: '', transmission: '',
  location: '', available: '', minPrice: '', maxPrice: '',
  sortBy: 'newest',
  startDate: '',
  endDate: '',
};



export default function Fleet() {
  const [filters,     setFilters]     = useState(DEFAULT_FILTERS);
  const [applied,     setApplied]     = useState(DEFAULT_FILTERS);
  const [vehicles,    setVehicles]    = useState([]);
  const [locations,   setLocations]   = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.vehicles.locations()
      .then(res => setLocations(res.data || []))
      .catch(() => setLocations([]));
  }, []);

  const fetchVehicles = async (params) => {
    setLoading(true); setError(null);
    try {
      // Remove empty strings before sending
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
      const res = await api.vehicles.list(clean);
      setVehicles(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(applied); }, [applied]);

  const applyFilters = () => {
    if ((filters.startDate && !filters.endDate) || (!filters.startDate && filters.endDate)) {
      setError("Please select both Pickup and Return dates to filter by availability.");
      return;
    }
    setApplied(filters);
    setShowFilters(false);
  };
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  };

  const activeCount = Object.entries(applied).filter(([k, v]) =>
    v !== '' && v !== DEFAULT_FILTERS[k]
  ).length;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-outfit font-black text-4xl md:text-5xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Browse <span className="gradient-text">Fleet</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : `${total} vehicle${total !== 1 ? 's' : ''} available`}
              {activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? 's' : ''} active`}
            </p>
          </motion.div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-28 glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h3>
                  {activeCount > 0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear All</button>}
                </div>
                <FilterFields filters={filters} setFilters={setFilters} locations={locations} />
                <button onClick={applyFilters} className="btn-primary w-full text-sm">Apply Filters</button>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Mobile filter toggle */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <button id="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 btn-outline text-sm px-4 py-2">
                  <SlidersHorizontal size={16} /> Filters
                  {activeCount > 0 && <span className="w-5 h-5 rounded-full text-xs text-white flex items-center justify-center" style={{ background: 'var(--primary)' }}>{activeCount}</span>}
                </button>
                {activeCount > 0 && <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1"><X size={14} />Clear</button>}
              </div>

              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 lg:hidden glass rounded-2xl p-4">
                  <FilterFields filters={filters} setFilters={setFilters} locations={locations} />
                  <button onClick={applyFilters} className="btn-primary w-full mt-3 text-sm">Apply</button>
                </motion.div>
              )}

              {/* Results */}
              {loading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 size={36} className="animate-spin text-primary-500" />
                </div>
              ) : error ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-4">⚠️</div>
                  <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Failed to load vehicles</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                  <button onClick={() => fetchVehicles(applied)} className="btn-primary">Retry</button>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-outfit font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No vehicles found</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters.</p>
                  <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((v, i) => <VehicleCard key={v._id} vehicle={v} index={i} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FilterFields({ filters, setFilters, locations = [] }) {
  const s = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const inputCls = 'input-field text-sm w-full';
  const labelCls = 'block text-xs font-medium mb-1';
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Search</label>
        <input className={inputCls} placeholder="Brand, model..." value={filters.search} onChange={e => s('search', e.target.value)} />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Type</label>
        <select className={inputCls} value={filters.type} onChange={e => s('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="2W">2-Wheeler</option>
          <option value="4W">4-Wheeler</option>
        </select>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Fuel Type</label>
        <select className={inputCls} value={filters.fuelType} onChange={e => s('fuelType', e.target.value)}>
          <option value="">All Fuels</option>
          {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Transmission</label>
        <select className={inputCls} value={filters.transmission} onChange={e => s('transmission', e.target.value)}>
          <option value="">All</option>
          <option>Manual</option><option>Automatic</option>
        </select>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>City</label>
        <select className={inputCls} value={filters.location} onChange={e => s('location', e.target.value)}>
          <option value="">All Cities</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Pickup Date</label>
        <input
          className={inputCls}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={filters.startDate}
          onChange={e => {
            const startVal = e.target.value;
            s('startDate', startVal);
            if (filters.endDate && filters.endDate <= startVal) {
              const nextDay = new Date(startVal);
              nextDay.setDate(nextDay.getDate() + 1);
              s('endDate', nextDay.toISOString().split('T')[0]);
            }
          }}
        />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Return Date</label>
        <input
          className={inputCls}
          type="date"
          min={filters.startDate ? (() => {
            const d = new Date(filters.startDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().split('T')[0];
          })() : new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          value={filters.endDate}
          onChange={e => s('endDate', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Availability</label>
        <select className={inputCls} value={filters.available} onChange={e => s('available', e.target.value)}>
          <option value="">All</option>
          <option value="true">Available Only</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Min ₹/day</label>
          <input className={inputCls} type="number" placeholder="0" value={filters.minPrice} onChange={e => s('minPrice', e.target.value)} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Max ₹/day</label>
          <input className={inputCls} type="number" placeholder="∞" value={filters.maxPrice} onChange={e => s('maxPrice', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>Sort By</label>
        <select className={inputCls} value={filters.sortBy} onChange={e => s('sortBy', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
