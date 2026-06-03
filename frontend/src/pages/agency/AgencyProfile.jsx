import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Building2, Mail, Phone, MapPin, FileText, Save, Loader2, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

export default function AgencyProfile() {
  const { user, updateUser } = useAuth();
  const { toasts, show: showToast, remove } = useToast();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    location: 'Mumbai',
    logo: '',
  });

  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  // Hydrate fields from user context agency object
  useEffect(() => {
    if (user?.agencyId) {
      const agency = user.agencyId;
      setForm({
        name: agency.name || '',
        description: agency.description || '',
        phone: agency.phone || '',
        email: agency.email || '',
        location: agency.location || 'Mumbai',
        logo: agency.logo || '',
      });
      setLogoPreview(agency.logo || '');
    }
  }, [user]);

  const handleFieldChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo image must be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        handleFieldChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    handleFieldChange('logo', '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Agency name is required.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.agencies.updateProfile(form);
      if (res.success) {
        // Sync agency info into current user context
        const updatedUser = {
          ...user,
          agencyId: {
            ...user.agencyId,
            ...res.data,
          },
        };
        updateUser(updatedUser);
        showToast('Agency profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update agency profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.agencyId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={36} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const agency = user.agencyId;

  return (
    <div className="page-transition space-y-6 max-w-4xl">
      <ToastContainer toasts={toasts} remove={remove} />

      <div>
        <h1 className="font-outfit font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Agency <span className="gradient-text">Profile</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your business information and listings branding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Branding / Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 text-center"
        >
          <div className="relative inline-block group mb-4">
            <div
              onClick={handleLogoUploadClick}
              className="w-24 h-24 rounded-2xl mx-auto overflow-hidden border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
              style={{
                borderColor: 'var(--primary)',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(6,182,212,0.05))',
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-3">
                  <Building2 size={24} style={{ color: 'var(--primary)' }} className="mx-auto mb-1" />
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Upload</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold shadow flex items-center justify-center transition-transform hover:scale-110"
              >
                ×
              </button>
            )}
          </div>

          <h3 className="font-outfit font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            {form.name || 'Unnamed Agency'}
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            {form.location || 'Mumbai'}, India
          </p>

          <div className="flex items-center justify-center gap-1.5 p-3 rounded-2xl text-xs mb-4" style={{ background: 'rgba(79,70,229,0.04)' }}>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              {agency.rating > 0 ? agency.rating.toFixed(1) : '0.0'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>{agency.totalReviews || 0} customer reviews</span>
          </div>

          <div className="p-3 rounded-2xl border text-left text-xs space-y-2" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span className="badge badge-success capitalize py-0.5 px-2 text-[10px]">{agency.status || 'approved'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Active Rentals:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{agency.activeBookings || 0} active</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-3xl p-8"
        >
          <form onSubmit={handleSave} className="space-y-5">
            {/* Agency Name */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Agency Name *
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. SpeedWheels Rentals"
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className="input-field input-icon-l"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Agency Description
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-4" style={{ color: 'var(--text-muted)' }} />
                <textarea
                  rows={3}
                  placeholder="Tell clients about your services, fleet types, or history..."
                  value={form.description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  className="input-field resize-none"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Email */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Business Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="contact@agency.com"
                    value={form.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    className="input-field input-icon-l"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    className="input-field input-icon-l"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Business City
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Nadiad"
                  value={form.location}
                  onChange={e => handleFieldChange('location', e.target.value)}
                  className="input-field input-icon-l"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--surface-border)' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-3.5 px-8 disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile Info
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
