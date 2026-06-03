import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Phone, MapPin, FileText, Lock, Save, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import api from '../../services/api';

const LOCATIONS = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Other'];

/* ── Avatar: first letter or uploaded image ── */
function Avatar({ src, name, size = 96, onUpload }) {
  const fileRef = useRef();
  const initials = name ? name.trim()[0].toUpperCase() : '?';

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Circle */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-4 flex items-center justify-center"
        style={{ borderColor: 'var(--primary)', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-outfit font-black" style={{ fontSize: size * 0.4 }}>{initials}</span>
        )}
      </div>

      {/* Upload button */}
      {onUpload && (
        <button
          id="avatar-upload-btn"
          type="button"
          onClick={() => fileRef.current.click()}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderColor: 'var(--bg-primary)' }}
        >
          <Camera size={14} className="text-white" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toasts, show: showToast, remove } = useToast();

  /* Profile form */
  const [profile, setProfile] = useState({
    name: '', phone: '', location: '', bio: '',
  });
  const [avatarSrc,    setAvatarSrc]    = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvatar,  setSavingAvatar]  = useState(false);

  /* Password form */
  const [passwords,    setPasswords]    = useState({ current: '', newPass: '', confirm: '' });
  const [showCurr,     setShowCurr]     = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [savingPass,   setSavingPass]   = useState(false);

  /* Hydrate from context */
  useEffect(() => {
    if (user) {
      setProfile({
        name:     user.name     || '',
        phone:    user.phone    || '',
        location: user.location || '',
        bio:      user.bio      || '',
      });
      setAvatarSrc(user.avatar || '');
    }
  }, [user]);

  /* ── Handle avatar image selection ── */
  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1_048_576) { showToast('Image must be under 1 MB.', 'error'); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setAvatarSrc(dataUrl);       // optimistic UI
      setSavingAvatar(true);
      try {
        const res = await api.auth.updateAvatar({ avatar: dataUrl });
        updateUser(res.user);
        showToast('Profile photo updated!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        setAvatarSrc(user?.avatar || '');   // revert
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Save profile info ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { showToast('Name is required.', 'warning'); return; }
    setSavingProfile(true);
    try {
      const res = await api.auth.updateMe(profile);
      updateUser(res.user);
      showToast('Profile saved successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) { showToast('New password must be at least 6 characters.', 'warning'); return; }
    if (passwords.newPass !== passwords.confirm) { showToast('Passwords do not match.', 'error'); return; }
    setSavingPass(true);
    try {
      await api.auth.updatePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      showToast('Password changed successfully!', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary-500" />
      </div>
    </div>
  );

  const setP = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));
  const setPw = (k, v) => setPasswords(prev => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-outfit font-black text-4xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Account <span className="gradient-text">Settings</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your profile and account security.</p>
          </motion.div>

          {/* ── Avatar Card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 mb-6">
            <h2 className="font-outfit font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar src={avatarSrc} name={profile.name || user.name} size={96} onUpload={handleAvatarFile} />
                {savingAvatar && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {profile.name || user.name}
                </p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${user.role === 'admin' ? 'badge-success' : user.role === 'agency' ? 'badge-accent' : 'badge-primary'}`}>
                    {user.role}
                  </span>
                  <span className="badge badge-success">Active</span>
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  Click the camera icon to upload a new photo (max 1 MB).<br />
                  If no photo is set, your initials are shown by default.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Personal Info Form ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-8 mb-6">
            <h2 className="font-outfit font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input id="settings-name" type="text" value={profile.name}
                    onChange={e => setP('name', e.target.value)}
                    placeholder="Your full name" className="input-field input-icon-l" />
                </div>
              </div>

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={user.email} readOnly
                    className="input-field input-icon-l opacity-60 cursor-not-allowed" />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input id="settings-phone" type="tel" value={profile.phone}
                    onChange={e => setP('phone', e.target.value)}
                    placeholder="+91 98765 43210" className="input-field input-icon-l" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>City</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <select id="settings-location" value={profile.location}
                    onChange={e => setP('location', e.target.value)}
                    className="input-field input-icon-l">
                    <option value="">Select city…</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Bio <span style={{ color: 'var(--text-muted)' }}>({profile.bio.length}/300)</span>
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-4" style={{ color: 'var(--text-muted)' }} />
                  <textarea
                    id="settings-bio"
                    rows={3}
                    maxLength={300}
                    value={profile.bio}
                    onChange={e => setP('bio', e.target.value)}
                    placeholder="Tell others a little about yourself…"
                    className="input-field resize-none"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              <button id="save-profile-btn" type="submit" disabled={savingProfile} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {savingProfile
                  ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving…</span>
                  : <span className="flex items-center gap-2"><Save size={16} /> Save Changes</span>
                }
              </button>
            </form>
          </motion.div>

          {/* ── Change Password ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8">
            <h2 className="font-outfit font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input id="current-password" type={showCurr ? 'text' : 'password'} value={passwords.current}
                    onChange={e => setPw('current', e.target.value)}
                    placeholder="Enter current password" className="input-field input-icon-lr" />
                  <button type="button" onClick={() => setShowCurr(!showCurr)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showCurr ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* New */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input id="new-password" type={showNew ? 'text' : 'password'} value={passwords.newPass}
                    onChange={e => setPw('newPass', e.target.value)}
                    placeholder="Min. 6 characters" className="input-field input-icon-lr" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input id="confirm-password" type="password" value={passwords.confirm}
                    onChange={e => setPw('confirm', e.target.value)}
                    placeholder="Repeat new password" className="input-field input-icon-l" />
                  {passwords.confirm && passwords.newPass === passwords.confirm && (
                    <CheckCircle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>

              <button id="change-password-btn" type="submit" disabled={savingPass} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {savingPass
                  ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Updating…</span>
                  : <span className="flex items-center gap-2"><Lock size={16} /> Update Password</span>
                }
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
