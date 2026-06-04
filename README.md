# 🚗 Rent-Drive — Peer-to-Peer Vehicle Rental Platform

Rent-Drive is a premium, full-stack vehicle rental marketplace designed to bridge the gap between customers looking for rides and rental agencies listing their fleets. Built with modern, glassmorphic aesthetics, fluid micro-animations, and client-side routing, the platform features complete dashboard systems for customers, listing agencies, and platform administrators.

---

## 🌟 Core Features

### 👤 Customer Experience
*   **Dynamic Fleet Catalog**: Browse and search vehicles with filters for type (2-wheeler vs 4-wheeler), transmission (Manual/Automatic), fuel type (Petrol, Diesel, Hybrid, Electric), and maximum daily pricing.
*   **Real-time Date Range Availability Filter**: Excludes vehicles that have overlapping confirmed/active bookings during the requested trip window.
*   **Detailed Vehicle Specifications**: View engine size (cc), mileage (kmpl), color, custom features list, reviews, and average rating.
*   **Secure Payment Checkout Modal**:
    *   **UPI QR Code**: High-tech QR code with a scanning light animation, displaying transaction details and collecting the UTR transaction reference.
    *   **3D Interactive Credit Card**: Interactive glassmorphic preview card that updates in real-time and flips to show CVV signature area when the input is focused.
    *   **Cash at Desk**: Instructions displaying the specific agency counter address and contact phone number.
*   **Booking Management**: Track active, completed, or pending trips, and review vehicles with star ratings.

### 🏢 Agency Management Console
*   **Subscription plans**: Tiered subscription plans (Starter, Growth, Enterprise) that restrict maximum fleet sizes (up to 5, 15, or unlimited vehicles respectively).
*   **Fleet Inventory Management**: Add, edit, or delete vehicles, update pricing structures, and upload image files.
*   **Interactive Booking Approval**: Accept or reject pending customer requests, view payment methods and customer transaction receipts, and manually activate or end trips.
*   **Agency Profile Branding**: Customize agency logo/avatar, description, location details, and business email.

### 🛡️ System Administration Portal
*   **Aggregated Platform Analytics**: Complete status summary showing registered users, total vehicles, system revenue, and booking distributions via interactive Recharts pie charts.
*   **Agency Registration Approvals**: Review new agency accounts to approve or suspend operations.
*   **User Account Moderation**: Activate or suspend customer and agency profile log-ins.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), React Router Dom, Framer Motion, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, MongoDB (Mongoose ODM), JWT, BcryptJS, CORS |
| **Tooling & Deploy**| Nodemon, Vercel SPA Rewrites |

---

## 📂 Project Structure

```bash
PROJECT1/
├── backend/
│   ├── config/             # DB & authentication setups
│   ├── controllers/        # Express handlers (auth, vehicles, bookings, agencies)
│   ├── middleware/         # Auth verification and roles parser
│   ├── models/             # Mongoose schemas (User, Vehicle, Booking, Agency)
│   ├── routes/             # REST API routes declarations
│   ├── seed.js             # Seed script for initial DB setup
│   └── server.js           # Server application entry point
├── frontend/
│   ├── public/             # Static assets (HTML header icons)
│   ├── src/
│   │   ├── components/     # Reusable inputs, modals, charts, sidebars, layouts
│   │   ├── context/        # Authentication and Booking states providers
│   │   ├── pages/          # Layout sections (Landing, Fleet, Pricing, Dashboards)
│   │   ├── services/       # Axios/Fetch API wrapper
│   │   └── utils/          # Formatting & pricing calculator helpers
│   ├── vercel.json         # Client redirect configurations
│   └── vite.config.js      # Vite build setup
└── vercel.json             # Root routing configurations
```

---

## 🔑 Demo & Test Credentials

The database seeding script configures three main roles with password **`demo123`**:

| Role | Email Login | Password | Description |
| :--- | :--- | :--- | :--- |
| **🛡️ System Admin** | `admin@demo.com` | `demo123` | Total platform overview and account moderation |
| **🏢 Agency Owner** | `rajesh@demo.com` | `demo123` | Mumbai agency owner listing 6 vehicles |
| **👤 Customer** | `customer@demo.com` | `demo123` | Standard user for browsing and booking |

---

## ⚙️ Setup & Installation

### 1. Database & Backend Configuration

1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment file. Create a `.env` file in the `backend/` directory:
    ```env
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/rent-drive
    JWT_SECRET=your_jwt_signing_token_key_here
    ```
4.  Seed the database with default vehicles, users, and bookings:
    ```bash
    npm run seed
    ```
5.  Start the development API server:
    ```bash
    npm run dev
    ```

### 2. Frontend Configuration

1.  Navigate into the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the environment file. Create a `.env` file in `frontend/` to point to the backend URL:
    ```env
    VITE_API_URL=http://localhost:4000/api
    ```
4.  Run the Vite development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:5173`.

---

## 🚀 Deployment Notes (Vercel)

For single-page routing to function properly on page refreshes when deploying to Vercel, the configuration file `vercel.json` rewrites all incoming links to `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Ensure your Vercel project environment variable `VITE_API_URL` is set to point to your live hosted backend URL.
