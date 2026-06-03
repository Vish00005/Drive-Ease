import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Star,
  MapPin,
  Zap,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/ui/Modal";
import { formatCurrency } from "../../utils/pricing";
import { useToast, ToastContainer } from "../../components/ui/Toast";
import api from "../../services/api";

const EMPTY_FORM = {
  name: "",
  brand: "",
  model: "",
  year: 2024,
  type: "2W",
  fuelType: "Petrol",
  transmission: "Manual",
  seats: 2,
  engine: "",
  mileage: "",
  color: "",
  location: "",
  priceDaily: "",
  priceWeekly: "",
  priceMonthly: "",
  description: "",
  available: true,
  image: "",
  featuresString: "",
};

export default function ManageFleet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, show: showToast, remove } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const agency = user?.agencyId;
  const isSubscribed = agency?.subscriptionStatus === "active";
  const plan = agency?.subscriptionPlan || "none";
  const fleetLimit =
    plan === "starter"
      ? 5
      : plan === "growth"
        ? 15
        : plan === "enterprise"
          ? Infinity
          : 0;
  const count = vehicles.length;

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.vehicles.myFleet();
      setVehicles(res.data || []);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    if (!isSubscribed) {
      showToast(
        "An active subscription is required to add vehicles.",
        "warning",
      );
      setTimeout(() => navigate("/agency/pricing"), 1200);
      return;
    }
    if (vehicles.length >= fleetLimit) {
      showToast(
        `Limit reached! Your ${plan} plan only allows up to ${fleetLimit} vehicles. Please upgrade your plan.`,
        "warning",
      );
      setTimeout(() => navigate("/agency/pricing"), 1500);
      return;
    }
    setForm({
      ...EMPTY_FORM,
      location: user?.agencyId?.location || "",
    });
    setEditVehicle(null);
    setShowModal(true);
  };
  const openEdit = (v) => {
    setForm({
      ...v,
      priceDaily: v.price.daily,
      priceWeekly: v.price.weekly,
      priceMonthly: v.price.monthly,
      image: v.images?.[0] || "",
      featuresString: v.features?.join(", ") || "",
    });
    setEditVehicle(v);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setF("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setF("image", "");
  };

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.priceDaily) {
      showToast("Fill required fields.", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: {
          daily: +form.priceDaily,
          weekly: +form.priceWeekly || 0,
          monthly: +form.priceMonthly || 0,
        },
        features: form.featuresString
          ? form.featuresString
              .split(",")
              .map((s) => s.trim())
              .filter((s) => !!s)
          : [],
      };
      delete payload.priceDaily;
      delete payload.priceWeekly;
      delete payload.priceMonthly;
      delete payload.featuresString;

      if (editVehicle) {
        const res = await api.vehicles.update(editVehicle._id, payload);
        setVehicles((vs) =>
          vs.map((v) => (v._id === editVehicle._id ? res.data : v)),
        );
        showToast("Vehicle updated!", "success");
      } else {
        const res = await api.vehicles.create(payload);
        setVehicles((vs) => [res.data, ...vs]);
        showToast("Vehicle added!", "success");
      }
      setShowModal(false);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (v) => {
    try {
      const res = await api.vehicles.toggleAvailability(v._id);
      setVehicles((vs) => vs.map((x) => (x._id === v._id ? res.data : x)));
      showToast(
        `Vehicle ${res.data.available ? "unblocked" : "blocked"}.`,
        "info",
      );
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this vehicle from your fleet?")) return;
    try {
      await api.vehicles.delete(id);
      setVehicles((vs) => vs.filter((v) => v._id !== id));
      showToast("Vehicle removed.", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page-transition">
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="font-outfit font-black text-3xl mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Manage <span className="gradient-text">Fleet</span>
          </h1>
          {isSubscribed ? (
            <div className="flex flex-col gap-1.5 mt-1">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Fleet usage:{" "}
                <strong style={{ color: "var(--primary)" }}>{count}</strong> of{" "}
                {fleetLimit === Infinity ? "unlimited" : fleetLimit} vehicles (
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan)
              </p>
              {fleetLimit !== Infinity && (
                <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (count / fleetLimit) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }} className="text-xs">
              No active subscription plan
            </p>
          )}
        </div>
        <button
          id="add-vehicle-btn"
          onClick={openAdd}
          className="btn-primary flex items-center gap-1.5"
          style={{
            opacity: !isSubscribed || vehicles.length >= fleetLimit ? 0.75 : 1,
          }}
        >
          {!isSubscribed ? <Lock size={16} /> : <Plus size={18} />}
          Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-primary-500" />
        </div>
      ) : vehicles.length === 0 ? (
        !isSubscribed ? (
          <div
            className="glass rounded-2xl p-16 text-center border border-dashed"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h3
              className="font-outfit font-bold text-lg mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Subscription Required
            </h3>
            <p
              className="text-sm max-w-md mx-auto mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Choose a pricing plan to start adding vehicles and listing your
              fleet on Rent-Drive.
            </p>
            <button
              onClick={() => navigate("/agency/pricing")}
              className="btn-primary"
            >
              View Pricing Plans
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <p
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              No vehicles yet
            </p>
            <button onClick={openAdd} className="btn-primary">
              <Plus size={16} /> Add First Vehicle
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {vehicles.map((v, i) => (
              <motion.div
                key={v._id}
                id={`fleet-card-${v._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <div
                  className="h-36 relative"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.05))",
                  }}
                >
                  {v.images?.[0] && (
                    <img
                      src={v.images[0]}
                      alt={v.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span
                      className={`badge ${v.type === "2W" ? "badge-primary" : "badge-accent"}`}
                    >
                      {v.type}
                    </span>
                    <span
                      className={`badge ${v.available ? "badge-success" : "badge-warning"}`}
                    >
                      {v.available ? "Available" : "Blocked"}
                    </span>
                  </div>
                  {v.fuelType === "Electric" && (
                    <div className="absolute bottom-2 left-2">
                      <span className="badge badge-success">
                        <Zap size={10} /> EV
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className="font-outfit font-bold text-base mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {v.name}
                  </h3>
                  <div
                    className="flex items-center gap-3 text-xs mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Star
                        size={11}
                        className="fill-amber-400 text-amber-400"
                      />{" "}
                      {v.rating > 0 ? v.rating.toFixed(1) : "New"}
                      {v.reviews > 0 && ` (${v.reviews})`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {v.location}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-xs mb-4 p-2 rounded-lg"
                    style={{ background: "rgba(79,70,229,0.06)" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>
                      Daily:{" "}
                      <strong style={{ color: "var(--primary)" }}>
                        {formatCurrency(v.price.daily)}
                      </strong>
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      Weekly:{" "}
                      <strong style={{ color: "var(--primary)" }}>
                        {formatCurrency(v.price.weekly)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id={`edit-${v._id}`}
                      onClick={() => openEdit(v)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: "rgba(79,70,229,0.08)",
                        color: "var(--primary)",
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      id={`toggle-${v._id}`}
                      onClick={() => toggleAvailability(v)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold ${v.available ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"}`}
                    >
                      {v.available ? (
                        <>
                          <PowerOff size={13} /> Block
                        </>
                      ) : (
                        <>
                          <Power size={13} /> Unblock
                        </>
                      )}
                    </button>
                    <button
                      id={`delete-${v._id}`}
                      onClick={() => handleDelete(v._id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Vehicle Image
            </label>
            {form.image ? (
              <div
                className="relative rounded-xl overflow-hidden group aspect-[2/1] max-h-48 border border-dashed"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center rounded-xl border border-dashed aspect-[2/1] max-h-48 cursor-pointer transition-all hover:bg-[rgba(79,70,229,0.04)]"
                style={{
                  borderColor: "var(--surface-border)",
                  background: "var(--surface)",
                }}
              >
                <div className="text-center p-6">
                  <div
                    className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: "rgba(79,70,229,0.06)" }}
                  >
                    <Plus size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <span
                    className="text-sm font-semibold block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Upload Image
                  </span>
                  <span
                    className="text-xs mt-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    PNG, JPG or WEBP (Max 5MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Vehicle Name *
            </label>
            <input
              id="vehicle-name"
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. Honda Activa 6G"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Brand *
            </label>
            <input
              id="vehicle-brand"
              value={form.brand}
              onChange={(e) => setF("brand", e.target.value)}
              placeholder="Honda"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Model
            </label>
            <input
              id="vehicle-model"
              value={form.model}
              onChange={(e) => setF("model", e.target.value)}
              placeholder="Activa 6G"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Year
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setF("year", +e.target.value)}
              min="2000"
              max="2025"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Type
            </label>
            <select
              id="vehicle-type"
              value={form.type}
              onChange={(e) => setF("type", e.target.value)}
              className="input-field"
            >
              <option value="2W">2-Wheeler</option>
              <option value="4W">4-Wheeler</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Fuel
            </label>
            <select
              id="vehicle-fuel"
              value={form.fuelType}
              onChange={(e) => setF("fuelType", e.target.value)}
              className="input-field"
            >
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Transmission
            </label>
            <select
              id="vehicle-transmission"
              value={form.transmission}
              onChange={(e) => setF("transmission", e.target.value)}
              className="input-field"
            >
              <option>Manual</option>
              <option>Automatic</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Seats
            </label>
            <input
              type="number"
              value={form.seats}
              onChange={(e) => setF("seats", +e.target.value)}
              min="1"
              max="14"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Location *
            </label>
            <input
              id="vehicle-location"
              value={form.location}
              onChange={(e) => setF("location", e.target.value)}
              placeholder="Add Your Location"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Engine
            </label>
            <input
              id="vehicle-engine"
              value={form.engine}
              onChange={(e) => setF("engine", e.target.value)}
              placeholder="e.g. 1197 cc"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Mileage
            </label>
            <input
              id="vehicle-mileage"
              value={form.mileage}
              onChange={(e) => setF("mileage", e.target.value)}
              placeholder="e.g. 18 kmpl"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Color
            </label>
            <input
              id="vehicle-color"
              value={form.color}
              onChange={(e) => setF("color", e.target.value)}
              placeholder="e.g. Midnight Black"
              className="input-field"
            />
          </div>
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Features (comma-separated)
            </label>
            <input
              id="vehicle-features"
              value={form.featuresString}
              onChange={(e) => setF("featuresString", e.target.value)}
              placeholder="e.g. USB Charging, LED Headlamp, ABS"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Daily Price (₹) *
            </label>
            <input
              id="price-daily"
              type="number"
              value={form.priceDaily}
              onChange={(e) => setF("priceDaily", e.target.value)}
              placeholder="800"
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Weekly Price (₹)
            </label>
            <input
              id="price-weekly"
              type="number"
              value={form.priceWeekly}
              onChange={(e) => setF("priceWeekly", e.target.value)}
              placeholder="4500"
              className="input-field"
            />
          </div>
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Monthly Price (₹)
            </label>
            <input
              id="price-monthly"
              type="number"
              value={form.priceMonthly}
              onChange={(e) => setF("priceMonthly", e.target.value)}
              placeholder="14000"
              className="input-field"
            />
          </div>
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>
          <div
            className="col-span-2 flex justify-end gap-3 pt-2 border-t"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <button onClick={() => setShowModal(false)} className="btn-ghost">
              Cancel
            </button>
            <button
              id="save-vehicle-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editVehicle
                  ? "Update Vehicle"
                  : "Add Vehicle"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
