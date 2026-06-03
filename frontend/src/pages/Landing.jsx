import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import {
  Car, Bike, Shield, Clock, MapPin, Star, ChevronRight,
  Zap, CheckCircle, ArrowRight,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import VehicleCard from "../components/ui/VehicleCard";
import api from "../services/api";

/* ─── Floating glassmorphic shape config ─── */
const SHAPES = [
  // Spheres
  { type: "sphere", size: 140, x: "8%",  y: "12%", color: "rgba(79,70,229,0.18)",  blur: 0,  delay: 0,    duration: 7  },
  { type: "sphere", size: 80,  x: "88%", y: "18%", color: "rgba(6,182,212,0.20)",  blur: 0,  delay: 1.2,  duration: 9  },
  { type: "sphere", size: 55,  x: "72%", y: "72%", color: "rgba(124,58,237,0.22)", blur: 0,  delay: 0.5,  duration: 8  },
  { type: "sphere", size: 100, x: "5%",  y: "68%", color: "rgba(6,182,212,0.14)",  blur: 0,  delay: 2,    duration: 10 },
  { type: "sphere", size: 36,  x: "50%", y: "85%", color: "rgba(16,185,129,0.20)", blur: 0,  delay: 1.5,  duration: 6  },
  { type: "sphere", size: 22,  x: "93%", y: "60%", color: "rgba(245,158,11,0.22)", blur: 0,  delay: 0.8,  duration: 7  },
  // Cubes
  { type: "cube",   size: 70,  x: "82%", y: "45%", color: "rgba(79,70,229,0.14)",  blur: 8,  delay: 0.3,  duration: 11, rotate: 25 },
  { type: "cube",   size: 44,  x: "14%", y: "40%", color: "rgba(6,182,212,0.16)",  blur: 6,  delay: 1.8,  duration: 9,  rotate: 15 },
  { type: "cube",   size: 56,  x: "60%", y: "10%", color: "rgba(124,58,237,0.15)", blur: 7,  delay: 0.7,  duration: 12, rotate: 40 },
  // Rings / Donuts (CSS border trick)
  { type: "ring",   size: 120, x: "22%", y: "78%", color: "rgba(79,70,229,0.20)",  blur: 0,  delay: 1,    duration: 14 },
  { type: "ring",   size: 70,  x: "75%", y: "28%", color: "rgba(16,185,129,0.22)", blur: 0,  delay: 2.2,  duration: 10 },
  { type: "ring",   size: 45,  x: "38%", y: "7%",  color: "rgba(6,182,212,0.18)",  blur: 0,  delay: 0.4,  duration: 8  },
  // Triangular prisms (rotated cubes)
  { type: "prism",  size: 52,  x: "90%", y: "82%", color: "rgba(245,158,11,0.18)", blur: 10, delay: 1.1,  duration: 9,  rotate: 55 },
  { type: "prism",  size: 38,  x: "32%", y: "90%", color: "rgba(124,58,237,0.20)", blur: 8,  delay: 0.9,  duration: 11, rotate: 30 },
];

function GlassShape({ type, size, x, y, color, blur, delay, duration, rotate = 0 }) {
  const floatY   = [-12, 12, -12];
  const floatX   = [0, 6, 0];
  const rotateTo = [rotate, rotate + 15, rotate];

  const base = {
    position: "absolute",
    left: x,
    top: y,
    width: size,
    height: size,
    backdropFilter: `blur(${blur + 10}px)`,
    WebkitBackdropFilter: `blur(${blur + 10}px)`,
    boxShadow: `0 8px 32px ${color}, inset 0 1px 0 rgba(255,255,255,0.18)`,
    border: "1px solid rgba(255,255,255,0.15)",
    pointerEvents: "none",
  };

  if (type === "sphere") {
    Object.assign(base, {
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25), ${color})`,
    });
  } else if (type === "ring") {
    Object.assign(base, {
      borderRadius: "50%",
      background: "transparent",
      border: `${Math.max(8, size * 0.1)}px solid ${color}`,
      boxShadow: `0 0 20px ${color}`,
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    });
  } else if (type === "cube") {
    Object.assign(base, {
      borderRadius: "12px",
      background: `linear-gradient(135deg, rgba(255,255,255,0.18), ${color})`,
      transform: `rotate(${rotate}deg)`,
    });
  } else if (type === "prism") {
    Object.assign(base, {
      borderRadius: "6px",
      background: `linear-gradient(135deg, rgba(255,255,255,0.12), ${color})`,
      transform: `rotate(${rotate}deg) skewX(8deg)`,
    });
  }

  return (
    <motion.div
      style={base}
      animate={{
        y: floatY,
        x: floatX,
        rotate: type === "cube" || type === "prism" ? rotateTo : [0, 3, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Data ─── */
const FEATURES = [
  { icon: Zap,    title: "Real-Time Availability", desc: "Instant updates on vehicle availability. No more double bookings or conflicts.",            color: "primary" },
  { icon: Clock,  title: "Flexible Durations",     desc: "Rent daily, weekly, or monthly. Our pricing adapts to your rental duration automatically.", color: "accent"  },
  { icon: Shield, title: "Secure Bookings",        desc: "Role-based access control, encrypted data, and transparent booking history.",               color: "success" },
  { icon: MapPin, title: "Multi-City Coverage",    desc: "Available across major Indian cities. Expanding rapidly to new locations every month.",      color: "warning" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse & Filter", desc: "Search vehicles by type, fuel, price range, and location. Find your perfect ride in seconds." },
  { step: "02", title: "Select & Book",   desc: "Choose your rental dates, see the live total price, and send your booking request instantly."  },
  { step: "03", title: "Get Confirmed",   desc: "The rental agency reviews and confirms your booking. You receive instant notification."         },
  { step: "04", title: "Ride & Return",   desc: "Pick up your vehicle, enjoy your ride, and return it at the agreed location and time."          },
];

const STATS = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+",    label: "Vehicles Listed"  },
  { value: "50+",     label: "Partner Agencies" },
  { value: "12",      label: "Cities Covered"   },
];

const TESTIMONIALS = [
  { name: "Rohan Mehta", city: "Mumbai",    rating: 5, text: "Booked a Swift for my family trip. Seamless experience from booking to return. Absolutely loved it!",                      avatar: "https://ui-avatars.com/api/?name=Rohan+Mehta&background=4f46e5&color=fff" },
  { name: "Ananya Iyer", city: "Bangalore", rating: 5, text: "The KTM Duke was in perfect condition. The real-time availability saved me so much time.",                                avatar: "https://ui-avatars.com/api/?name=Ananya+Iyer&background=06b6d4&color=fff" },
  { name: "Karthik R.",  city: "Chennai",   rating: 4, text: "Great platform! Booking the Innova Crysta for a monthly rental was straightforward and transparent.", avatar: "https://ui-avatars.com/api/?name=Karthik+R&background=10b981&color=fff"   },
];

const colorMap = {
  primary: { gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
  accent:  { gradient: "linear-gradient(135deg, #06b6d4, #0284c7)" },
  success: { gradient: "linear-gradient(135deg, #10b981, #059669)" },
  warning: { gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
};

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y       = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  useEffect(() => {
    api.vehicles.list({ available: 'true', limit: 3, sortBy: 'rating' })
      .then(res => setFeaturedVehicles(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO — centered text + floating 3D shapes
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="hero-section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-50" />

        {/* ── Ambient orbs ── */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(79,70,229,0.10)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(6,182,212,0.08)" }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        {/* ── Floating glassmorphic 3D shapes ── */}
        {SHAPES.map((s, i) => (
          <GlassShape key={i} {...s} />
        ))}

        {/* ── Centered content ── */}
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8 border"
            style={{ borderColor: "rgba(79,70,229,0.3)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              🚀 India's Premier Vehicle Rental Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-outfit font-black text-5xl md:text-7xl lg:text-8xl leading-tight mb-6"
          >
            <span style={{ color: "var(--text-primary)" }}>Your Drive,</span>
            <br />
            <span className="gradient-text">Your Terms.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Rent premium two-wheelers and four-wheelers across India.
            Real-time availability, flexible daily / weekly / monthly pricing, zero hassle.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/fleet" id="hero-browse-cta" className="btn-primary text-base px-8 py-4 shadow-neon">
              Browse Vehicles <ArrowRight size={18} />
            </Link>
            <Link to="/register" id="hero-register-cta" className="btn-outline text-base px-8 py-4">
              List Your Fleet
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex flex-wrap items-center justify-center gap-8 glass px-8 py-4 rounded-2xl"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-outfit font-black text-2xl gradient-text">{s.value}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating vehicle chips */}
        <motion.div
          className="absolute bottom-20 left-12 hidden lg:flex items-center gap-3 glass px-4 py-3 rounded-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Bike size={22} className="text-primary-500" />
          <div>
            <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>2-Wheelers</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>From ₹350/day</div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-12 hidden lg:flex items-center gap-3 glass px-4 py-3 rounded-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <Car size={22} className="text-accent-500" />
          <div>
            <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>4-Wheelers</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>From ₹2,500/day</div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════ */}
      <section className="section-padding" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
              Why Choose <span className="gradient-text">Rent-Drive?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              A platform built for the modern renter — fast, reliable, and beautifully designed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-3d group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: colorMap[f.color].gradient }}
                >
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-outfit font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED VEHICLES
      ═══════════════════════════════════════ */}
      <section className="section-padding" id="featured-vehicles">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="font-outfit font-black text-4xl mb-2" style={{ color: "var(--text-primary)" }}>
                Featured <span className="gradient-text">Vehicles</span>
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>Top picks for your next ride</p>
            </div>
            <Link to="/fleet" className="btn-outline hidden md:flex">
              View All <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((v, i) => (
              <VehicleCard key={v._id} vehicle={v} index={i} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/fleet" className="btn-primary">View All Vehicles</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="section-padding" id="how-it-works" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              From discovery to key pickup in 4 simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div
              className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-0.5"
              style={{ background: "linear-gradient(90deg, #4f46e5, #06b6d4)" }}
            />
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-6 text-center relative"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-outfit font-black text-xl text-white shadow-neon"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  {step.step}
                </div>
                <h3 className="font-outfit font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="section-padding" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-outfit font-black text-4xl mb-4" style={{ color: "var(--text-primary)" }}>
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-3d"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: "var(--text-secondary)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section className="section-padding" id="cta-section">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }} />
            <div className="relative z-10">
              <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
                Ready to Hit the Road?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Join 10,000+ happy customers who trust Rent-Drive for their rental needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" id="cta-register" className="btn-primary text-base px-10 py-4">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/fleet" id="cta-fleet" className="btn-outline text-base px-10 py-4">
                  Browse Fleet
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                {["No Hidden Fees", "Instant Booking", "24/7 Support"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle size={15} className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
