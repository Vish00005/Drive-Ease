import { motion } from 'framer-motion';
import { Star, MapPin, Zap, Users, Fuel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/pricing';

export default function VehicleCard({ vehicle, index = 0 }) {
  const { _id: id, name, type, fuelType, transmission, seats, price, available, location, rating, reviews, images, brand, isBookedToday } = vehicle || {};

  return (
    <motion.div
      id={`vehicle-card-${id}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden card-3d group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-50 to-accent-400/10 dark:from-primary-900/20 dark:to-accent-400/5">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand)}&background=4f46e5&color=fff&size=300`;
          }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${type === '2W' ? 'badge-primary' : 'badge-accent'}`}>
            {type === '2W' ? '🏍 2-Wheeler' : '🚗 4-Wheeler'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {!available ? (
            <span className="badge badge-danger">✗ Blocked</span>
          ) : isBookedToday ? (
            <span className="badge badge-warning">✗ Booked Today</span>
          ) : (
            <span className="badge badge-success">✓ Available</span>
          )}
        </div>
        {fuelType === 'Electric' && (
          <div className="absolute bottom-3 left-3">
            <span className="badge badge-success">
              <Zap size={11} /> Electric
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-outfit font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{brand}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
            {reviews > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({reviews})</span>}
          </div>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Fuel size={12} className="text-primary-500" />
            {fuelType}
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-primary-500">⚙</span>
            {transmission}
          </div>
          {seats && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Users size={12} className="text-primary-500" />
              {seats}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={12} className="text-primary-500" />
            {location}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(79,70,229,0.06)' }}>
          <div className="text-center flex-1 border-r" style={{ borderColor: 'var(--surface-border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily</div>
            <div className="font-outfit font-bold text-sm" style={{ color: 'var(--primary)' }}>{formatCurrency(price.daily)}</div>
          </div>
          <div className="text-center flex-1 border-r" style={{ borderColor: 'var(--surface-border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Weekly</div>
            <div className="font-outfit font-bold text-sm" style={{ color: 'var(--primary)' }}>{formatCurrency(price.weekly)}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly</div>
            <div className="font-outfit font-bold text-sm" style={{ color: 'var(--primary)' }}>{formatCurrency(price.monthly)}</div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/vehicle/${id}`}
          id={`view-vehicle-${id}`}
          className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            available
              ? 'btn-primary'
              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          {available ? 'View & Book' : 'Not Available'}
        </Link>
      </div>
    </motion.div>
  );
}
