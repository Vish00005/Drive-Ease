/**
 * Central API client for DriveEase
 * All fetch calls go through here — auto-attaches JWT, handles errors uniformly.
 */

const BASE_URL = 'http://localhost:4000/api';

const getToken = () => localStorage.getItem("driveease-token");

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Normalize error message
    throw new Error(
      data.message || data.errors?.[0]?.msg || "Something went wrong",
    );
  }

  return data;
}

/* ── Auth ── */
export const api = {
  auth: {
    login: (body) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    me: () => request("/auth/me"),
    updatePassword: (body) =>
      request("/auth/updatepassword", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    updateMe: (body) =>
      request("/auth/updateme", { method: "PUT", body: JSON.stringify(body) }),
    updateAvatar: (body) =>
      request("/auth/avatar", { method: "PUT", body: JSON.stringify(body) }),
  },

  vehicles: {
    list: (params = {}) => request("/vehicles?" + new URLSearchParams(params)),
    get: (id) => request(`/vehicles/${id}`),
    myFleet: () => request("/vehicles/agency/fleet"),
    locations: () => request("/vehicles/locations"),
    create: (body) =>
      request("/vehicles", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id) => request(`/vehicles/${id}`, { method: "DELETE" }),
    toggleAvailability: (id) =>
      request(`/vehicles/${id}/availability`, { method: "PATCH" }),
  },

  bookings: {
    create: (body) =>
      request("/bookings", { method: "POST", body: JSON.stringify(body) }),
    my: (params) =>
      request("/bookings/my?" + new URLSearchParams(params || {})),
    agency: (params) =>
      request("/bookings/agency?" + new URLSearchParams(params || {})),
    all: (params) => request("/bookings?" + new URLSearchParams(params || {})),
    updateStatus: (id, body) =>
      request(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    cancel: (id) => request(`/bookings/${id}`, { method: "DELETE" }),
    stats: () => request("/bookings/stats"),
    rate: (id, body) =>
      request(`/bookings/${id}/rate`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    pay: (id, body) =>
      request(`/bookings/${id}/pay`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    confirmPayment: (id) =>
      request(`/bookings/${id}/confirm-payment`, {
        method: "PATCH",
      }),
  },

  users: {
    list: (params) => request("/users?" + new URLSearchParams(params || {})),
    get: (id) => request(`/users/${id}`),
    updateStatus: (id, status) =>
      request(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    stats: () => request("/users/stats"),
  },

  agencies: {
    list: (params) => request("/agencies?" + new URLSearchParams(params || {})),
    get: (id) => request(`/agencies/${id}`),
    updateStatus: (id, status) =>
      request(`/agencies/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    updateProfile: (body) =>
      request("/agencies/profile/me", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    dashboardStats: () => request("/agencies/dashboard/stats"),
    subscribe: (body) =>
      request("/agencies/subscribe", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};

export default api;
