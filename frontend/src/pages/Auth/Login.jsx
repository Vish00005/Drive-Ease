import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Car, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      const role = result.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "agency") navigate("/agency");
      else navigate("/fleet");
    } else {
      setError(result.error);
    }
  };

  const demoLogins = [
    { label: "👤 Customer", email: "customer@demo.com", password: "demo123" },
    { label: "🏢 Agency", email: "rajesh@demo.com", password: "demo123" },
    { label: "🛡 Admin", email: "admin@demo.com", password: "demo123" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh hero-grid">
      {/* Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#4f46e5" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: "#06b6d4" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-neon"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              }}
            >
              <Car size={22} className="text-white" />
            </div>
            <span className="font-outfit font-black text-2xl">
              <span className="gradient-text">Rent</span>
              <span style={{ color: "var(--text-primary)" }}>-Drive</span>
            </span>
          </Link>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-3d">
          <h1
            className="font-outfit font-black text-2xl mb-6 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Sign In
          </h1>

          {/* Demo Logins */}
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Quick Demo Access
            </p>
            <div className="flex gap-2">
              {demoLogins.map((d) => (
                <button
                  key={d.label}
                  id={`demo-${d.label.replace(/\W/g, "").toLowerCase()}`}
                  onClick={() =>
                    setForm({ email: d.email, password: d.password })
                  }
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105"
                  style={{
                    background: "rgba(79,70,229,0.06)",
                    borderColor: "var(--surface-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--surface-border)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              or continue with email
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--surface-border)" }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
            >
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="  absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="input-field input-icon-l"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="input-field input-icon-lr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} /> Sign In
                </span>
              )}
            </button>
          </form>

          <p
            className="text-center text-sm mt-5"
            style={{ color: "var(--text-secondary)" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              id="login-register-link"
              className="font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
