import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Lock, ShieldCheck, AlertCircle, Sparkles, TrendingUp, Building2, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/pricing';
import { useToast, ToastContainer } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    desc: 'Perfect for small fleets and individual vehicle owners starting out.',
    priceMonthly: 3999,
    priceAnnually: 3199,
    limit: 'Up to 5 vehicles',
    color: 'from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600',
    borderColor: 'var(--surface-border)',
    features: [
      'List up to 5 vehicles',
      'Instant booking notifications',
      'Real-time availability toggles',
      'Standard search result placement',
      'Basic fleet performance analytics',
      'Email support (24h response time)',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    desc: 'Designed for expanding agencies seeking high booking volume.',
    priceMonthly: 7999,
    priceAnnually: 6399,
    limit: 'Up to 15 vehicles',
    popular: true,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    features: [
      'List up to 15 vehicles',
      'Priority booking notifications',
      'Featured placement in search results',
      'Customer review dashboard & management',
      'Advanced analytics & revenue reports',
      'Discount promotional tools for listings',
      'Priority 24/7 chat support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    desc: 'Unlimited power for established professional rental agencies.',
    priceMonthly: 15999,
    priceAnnually: 12799,
    limit: 'Unlimited vehicles',
    color: 'from-cyan-500 to-indigo-600',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    features: [
      'List unlimited vehicles',
      'Top tier placement in search results',
      'Auto-approve bookings assistant API',
      'Premium custom reviews widget',
      'Comprehensive custom business analytics',
      'Multi-user access control for employees',
      'Dedicated accounts manager support',
      'Custom branding configurations',
    ],
  },
];

export default function Pricing({ isDashboard = false }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, show: showToast, remove } = useToast();

  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Form states
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [checkoutStep, setCheckoutStep] = useState('form'); // form | processing | success

  const currentAgencyPlan = user?.agencyId?.subscriptionPlan || 'none';
  const currentAgencyStatus = user?.agencyId?.subscriptionStatus || 'none';

  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      showToast('Please sign in or register to subscribe.', 'info');
      navigate('/register?role=agency');
      return;
    }
    if (user?.role !== 'agency') {
      showToast('Only Agency owners can subscribe to pricing plans.', 'warning');
      return;
    }
    setSelectedPlan(plan);
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
    setCheckoutStep('form');
    setShowCheckout(true);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'number') {
      formatted = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
    } else if (name === 'expiry') {
      formatted = value.replace(/\//g, '').replace(/(\d{2})/, '$1/').trim().substring(0, 5);
    } else if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardForm(prev => ({ ...prev, [name]: formatted }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv) {
      showToast('Please fill all card details.', 'warning');
      return;
    }

    setCheckoutStep('processing');

    try {
      // Simulate API call and checkout delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await api.agencies.subscribe({ plan: selectedPlan.id });
      
      if (res.success) {
        setCheckoutStep('success');

        // Update local context
        const updatedUser = {
          ...user,
          agencyId: {
            ...user.agencyId,
            subscriptionPlan: res.data.subscriptionPlan,
            subscriptionStatus: res.data.subscriptionStatus,
            subscriptionExpiresAt: res.data.subscriptionExpiresAt,
          },
        };
        updateUser(updatedUser);

        showToast(`Successfully subscribed to ${selectedPlan.name}!`, 'success');
        
        setTimeout(() => {
          setShowCheckout(false);
          if (location.pathname !== '/agency/pricing') {
            navigate('/agency');
          }
        }, 2200);
      }
    } catch (err) {
      setCheckoutStep('form');
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    }
  };

  const hasActiveSub = currentAgencyStatus === 'active';
  const agencyDetails = user?.agencyId;
  const joiningDate = agencyDetails?.updatedAt ? formatDate(agencyDetails.updatedAt) : 'Recent';
  const expiryDate = agencyDetails?.subscriptionExpiresAt ? formatDate(agencyDetails.subscriptionExpiresAt) : 'N/A';

  const pageContent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-transition">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        {!isDashboard && (
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-1.5 text-sm mb-4 hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <h1 className="font-outfit font-black text-4xl sm:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
          {hasActiveSub ? 'My ' : 'Choose a '} <span className="gradient-text">Subscription</span>
        </h1>
        <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
          {hasActiveSub 
            ? 'Manage your active subscription plan details and billing configurations below.' 
            : 'Select a plan to activate your account and start listing your vehicles to accept rentals.'}
        </p>
      </div>

      {/* Active Subscription Details Card */}
      {hasActiveSub && (
        <div className="glass rounded-3xl p-8 mb-12 shadow-3d border" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex flex-col lg:flex-row items-stretch gap-8">
            {/* Elegant Premium Subscription Card */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
              {(() => {
                const activePlanDetails = PLANS.find(p => p.id === currentAgencyPlan) || PLANS[0];
                return (
                  <div className={`rounded-3xl p-6 text-white h-56 flex flex-col justify-between shadow-2xl relative overflow-hidden bg-gradient-to-br ${activePlanDetails.color}`}>
                    {/* Background design elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-6 -mb-6" />
                    
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">DriveEase Premium Partner</span>
                        <h4 className="font-outfit font-black text-xl leading-none mt-1">{activePlanDetails.name}</h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Building2 size={20} className="text-white" />
                      </div>
                    </div>

                    <div className="z-10">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Agency Account</p>
                          <p className="font-semibold text-sm truncate max-w-[160px]">{user?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Status</p>
                          <span className="badge bg-emerald-500 text-white border-none text-[9px] font-extrabold uppercase px-2.5 py-0.5 mt-0.5">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Plan Info and Details */}
            {(() => {
              const activePlanDetails = PLANS.find(p => p.id === currentAgencyPlan) || PLANS[0];
              return (
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active membership info</span>
                        <h3 className="font-outfit font-black text-2xl mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {activePlanDetails.name}
                        </h3>
                      </div>
                      <div className="badge badge-accent py-1 px-3.5 text-xs font-bold">
                        {activePlanDetails.limit}
                      </div>
                    </div>

                    <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                      {activePlanDetails.desc}
                    </p>

                    {/* Sub Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-2xl border" style={{ background: 'rgba(79,70,229,0.03)', borderColor: 'var(--surface-border)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Subscribed On</span>
                        <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{joiningDate}</p>
                      </div>
                      <div className="p-3 rounded-2xl border" style={{ background: 'rgba(79,70,229,0.03)', borderColor: 'var(--surface-border)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Expiry Date</span>
                        <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--primary)' }}>{expiryDate}</p>
                      </div>
                      <div className="p-3 rounded-2xl border" style={{ background: 'rgba(79,70,229,0.03)', borderColor: 'var(--surface-border)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Billing Frequency</span>
                        <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>Monthly Renewal</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span style={{ color: 'var(--text-secondary)' }}>Your subscription is active. You can add fleet up to the plan limit and list vehicles on the marketplace.</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Upgrade / Change Plan Section Header */}
      {hasActiveSub && (
        <div className="text-center max-w-3xl mx-auto mb-8 mt-16">
          <h2 className="font-outfit font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Upgrade or Change Plan
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Need to add more vehicles? Select one of our other premium plans below to upgrade instantly.
          </p>
        </div>
      )}

      {/* Toggle (displayed when either not subscribed or if upgrade option shown) */}
      {(!hasActiveSub || hasActiveSub) && (
        <div className="flex items-center justify-center gap-3 mt-8 mb-8">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-primary-500' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-7 rounded-full p-1 transition-all duration-300 relative bg-indigo-500/30"
          >
            <motion.div
              layout
              className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400"
              animate={{ x: isAnnual ? 28 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-primary-500' : 'text-slate-400'}`}>
            Annually
            <span className="badge badge-success text-[10px] px-1.5 py-0.5">Save 20%</span>
          </span>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
        {PLANS.map((plan) => {
          const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
          const isCurrent = currentAgencyPlan === plan.id && currentAgencyStatus === 'active';

          return (
            <div
              key={plan.id}
              className={`glass rounded-3xl p-8 flex flex-col relative transition-all duration-300 ${
                plan.popular ? 'border-2 shadow-2xl scale-[1.02]' : 'border'
              }`}
              style={{
                borderColor: plan.popular ? 'var(--primary)' : 'var(--surface-border)',
                boxShadow: plan.popular ? '0 10px 40px rgba(99, 102, 241, 0.15)' : undefined,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs px-4 py-1.5 rounded-full flex items-center gap-1 shadow-neon">
                    <Sparkles size={11} /> MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-outfit font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </h3>
                <p className="text-xs mt-2 min-h-[32px]" style={{ color: 'var(--text-muted)' }}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-outfit font-black text-4xl" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(price)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  / month
                </span>
              </div>

              <div className="mb-6 py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2" style={{ background: 'rgba(79,70,229,0.06)', color: 'var(--primary)' }}>
                <TrendingUp size={13} /> {plan.limit}
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <button disabled className="btn-outline w-full cursor-default opacity-80 border-emerald-500 text-emerald-500 bg-emerald-500/5">
                  Current Plan (Active)
                </button>
              ) : (
                <button
                  id={`subscribe-${plan.id}`}
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3.5 ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                >
                  {currentAgencyPlan !== 'none' ? 'Upgrade Plan' : 'Subscribe Now'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Banner */}
      <div className="glass rounded-3xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-indigo-500/10 text-indigo-500">
          <HelpCircle size={24} />
        </div>
        <div>
          <h4 className="font-outfit font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Have questions about billing, changing plans, or refund policies? Visit our support page or get in touch with our partnerships coordinator at partners@driveease.in.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Checkout Details" size="md">
        {selectedPlan && (
          <div className="p-1">
            {checkoutStep === 'form' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid var(--surface-border)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Selected Plan:</span>
                    <span className="text-xs font-bold badge badge-primary">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total Amount:</span>
                    <span className="font-outfit font-black text-lg" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(isAnnual ? selectedPlan.priceAnnually : selectedPlan.priceMonthly)}
                      <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}> / month</span>
                    </span>
                  </div>
                  <div className="text-[10px] mt-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <ShieldCheck size={11} className="text-emerald-500" /> Secure 256-bit SSL encrypted checkout
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Cardholder Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={cardForm.name}
                      onChange={handleCardInputChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Card Number</label>
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="number"
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardForm.number}
                        onChange={handleCardInputChange}
                        className="input-field input-icon-l"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Expiration Date</label>
                      <input
                        name="expiry"
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={handleCardInputChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>CVV</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          name="cvv"
                          type="password"
                          required
                          placeholder="***"
                          value={cardForm.cvv}
                          onChange={handleCardInputChange}
                          className="input-field input-icon-l"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  id="submit-payment"
                  type="submit"
                  className="btn-primary w-full py-3.5 mt-3 flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} /> Pay {formatCurrency(isAnnual ? selectedPlan.priceAnnually : selectedPlan.priceMonthly)}
                </button>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                <h4 className="font-outfit font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                  Processing Payment...
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Verifying transaction details with your bank. Do not refresh or close.
                </p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 text-2xl shadow-lg shadow-emerald-500/20"
                >
                  <Check size={28} strokeWidth={3} />
                </motion.div>
                <h4 className="font-outfit font-black text-xl mb-1 text-emerald-500">
                  Payment Successful!
                </h4>
                <p className="text-xs px-6" style={{ color: 'var(--text-muted)' }}>
                  Subscription activated. Your plan limits have been instantly updated. Welcome to DriveEase Pro!
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

  if (isDashboard) {
    return <div className="page-transition">{pageContent}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-grow pt-24">{pageContent}</main>
      <Footer />
    </div>
  );
}
