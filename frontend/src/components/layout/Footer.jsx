import { Link } from "react-router-dom";
import {
  Car,
  Mail,
  Phone,
  MapPin,
  Send,
  Globe,
  Share2,
  Heart,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative mt-20"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Top gradient border */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #4f46e5, #06b6d4, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                }}
              >
                <Car size={18} className="text-white" />
              </div>
              <span className="font-outfit font-black text-xl">
                <span className="gradient-text">Drive</span>
                <span style={{ color: "var(--text-primary)" }}>Ease</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Your premium vehicle rental platform. Rent two-wheelers and
              four-wheelers across India with real-time availability and
              flexible pricing.
            </p>
            <div className="flex items-center gap-3">
              {[Send, Globe, Share2, Heart].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  style={{
                    background: "rgba(79,70,229,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-outfit font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/fleet", label: "Browse Fleet" },
                { to: "/login", label: "Login" },
                { to: "/register", label: "Register" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm animated-underline hover:text-primary-500 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4
              className="font-outfit font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              For Business
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/register", label: "List Your Fleet" },
                { to: "/pricing", label: "Pricing Plans" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm animated-underline hover:text-primary-500 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-outfit font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Contact
            </h4>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: "support@driveease.in" },
                { icon: Phone, text: "+91 1800 123 4567" },
                { icon: MapPin, text: "Nadiad,Gujarat,India" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(79,70,229,0.1)" }}
                  >
                    <Icon size={13} style={{ color: "var(--primary)" }} />
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © {year} DriveEase. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs hover:text-primary-500 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
