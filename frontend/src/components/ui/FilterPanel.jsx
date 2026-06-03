import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
const FUEL_TYPES    = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const LOCATIONS     = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur'];

const PRICE_MAX = 15000;

export default function FilterPanel({ filters, onChange }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
          <h3 className="font-outfit font-bold text-base" style={{ color: 'var(--text-primary)' }}>Filters</h3>
        </div>
        <button
          id="clear-filters-btn"
          onClick={() => onChange({ search: '', type: 'all', fuelType: 'all', transmission: 'all', location: 'all', availableOnly: false, maxPrice: PRICE_MAX, sortBy: 'default' })}
          className="text-xs text-primary-500 hover:underline font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          id="vehicle-search"
          type="text"
          placeholder="Search vehicles, brands..."
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="input-field pl-9 text-sm"
        />
        {filters.search && (
          <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Vehicle Type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Vehicle Type</label>
        <div className="flex gap-2">
          {['all', '2W', '4W'].map(t => (
            <button
              key={t}
              id={`type-filter-${t}`}
              onClick={() => set('type', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filters.type === t
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500'
              }`}
              style={{ background: filters.type === t ? 'rgba(79,70,229,0.1)' : 'var(--surface-border)' }}
            >
              {t === 'all' ? 'All' : t === '2W' ? '🏍 2W' : '🚗 4W'}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Fuel Type</label>
        <div className="flex flex-wrap gap-2">
          {['all', ...FUEL_TYPES].map(f => (
            <button
              key={f}
              id={`fuel-filter-${f}`}
              onClick={() => set('fuelType', f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filters.fuelType === f
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent'
              }`}
              style={{ background: filters.fuelType === f ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
              {f === 'all' ? 'All' : f === 'Electric' ? '⚡ EV' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Transmission</label>
        <select
          id="transmission-filter"
          value={filters.transmission || 'all'}
          onChange={e => set('transmission', e.target.value)}
          className="input-field text-sm"
        >
          <option value="all">All Transmissions</option>
          {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Location</label>
        <select
          id="location-filter"
          value={filters.location || 'all'}
          onChange={e => set('location', e.target.value)}
          className="input-field text-sm"
        >
          <option value="all">All Locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Max Daily Price</label>
          <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
            ₹{(filters.maxPrice || PRICE_MAX).toLocaleString()}
          </span>
        </div>
        <input
          id="price-range"
          type="range"
          min={200}
          max={PRICE_MAX}
          step={100}
          value={filters.maxPrice || PRICE_MAX}
          onChange={e => set('maxPrice', Number(e.target.value))}
          className="w-full"
          style={{ '--range-progress': `${((filters.maxPrice || PRICE_MAX) - 200) / (PRICE_MAX - 200) * 100}%` }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          <span>₹200</span>
          <span>₹{PRICE_MAX.toLocaleString()}</span>
        </div>
      </div>

      {/* Available Only */}
      <div className="mb-4 flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Available Only</label>
        <button
          id="available-toggle"
          onClick={() => set('availableOnly', !filters.availableOnly)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${filters.availableOnly ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${filters.availableOnly ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Sort By</label>
        <select
          id="sort-filter"
          value={filters.sortBy || 'default'}
          onChange={e => set('sortBy', e.target.value)}
          className="input-field text-sm"
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
