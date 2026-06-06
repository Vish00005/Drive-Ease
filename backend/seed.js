/**
 * DriveEase — Full Database Seeder
 * Run from backend/ directory:  node seed.js
 *
 * Seeds: 1 Admin, 3 Agency Owners, 3 Agencies,
 *        18 Vehicles (6 per agency), 6 Customers, 12 Bookings
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User    = require('./models/User');
const Agency  = require('./models/Agency');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

/* ─── helpers ─── */
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

/* ─── Static data ─── */
const AGENCY_DATA = [
  { name: 'Rajesh Motors Rentals',  description: 'Premium rentals in Mumbai since 2015.', phone: '+91 98765 43210', email: 'rajesh@motors.com',  location: 'Mumbai',    rating: 4.7, totalReviews: 312, logo: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png' },
  { name: 'Bangalore Drive Hub',    description: 'Top-rated service in Bangalore.', phone: '+91 90876 54321', email: 'info@drivehub.in',      location: 'Bangalore', rating: 4.5, totalReviews: 218, logo: 'https://cdn-icons-png.flaticon.com/512/4812/4812244.png' },
  { name: 'Delhi Wheels Co.',       description: 'Affordable rentals across Delhi NCR.',  phone: '+91 88765 32109', email: 'support@delhiwheels.com', location: 'Delhi', rating: 4.3, totalReviews: 176, logo: 'https://cdn-icons-png.flaticon.com/512/2760/2760824.png' },
];

const AGENCY_OWNERS = [
  { name: 'Rajesh Kumar', email: 'rajesh@demo.com', password: 'demo123', location: 'Mumbai',    avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' },
  { name: 'Priya Sharma', email: 'priya@demo.com',  password: 'demo123', location: 'Bangalore', avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177465.png' },
  { name: 'Amit Verma',   email: 'amit@demo.com',   password: 'demo123', location: 'Delhi',     avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' },
];

const CUSTOMERS = [
  { name: 'Rohan Mehta',   email: 'customer@demo.com', password: 'demo123', location: 'Mumbai',    avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' },
  { name: 'Ananya Iyer',   email: 'ananya@demo.com',   password: 'demo123', location: 'Bangalore', avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177465.png' },
  { name: 'Karthik Reddy', email: 'karthik@demo.com',  password: 'demo123', location: 'Hyderabad', avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' },
  { name: 'Sneha Patel',   email: 'sneha@demo.com',    password: 'demo123', location: 'Pune',      avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177465.png' },
  { name: 'Vikram Singh',  email: 'vikram@demo.com',   password: 'demo123', location: 'Delhi',     avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' },
  { name: 'Divya Nair',    email: 'divya@demo.com',    password: 'demo123', location: 'Chennai',   avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177465.png' },
];

const makeVehicles = (agencyId, location) => [
  { name: 'Honda Activa 6G',          brand: 'Honda',          model: 'Activa 6G',     year: 2023, type: '2W', fuelType: 'Petrol',  transmission: 'Automatic', seats: 2, engine: '109.51cc', mileage: '60 kmpl', color: 'Pearl White',    location, agencyId, price: { daily: 400,  weekly: 2500,  monthly: 8000  }, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], features: ['USB Charging', 'LED Headlamp', 'Silent Start'],              description: "India's most trusted scooter.",          available: true,  rating: 4.3, reviews: 128 },
  { name: 'Royal Enfield Classic 350', brand: 'Royal Enfield', model: 'Classic 350',   year: 2023, type: '2W', fuelType: 'Petrol',  transmission: 'Manual',    seats: 2, engine: '349cc',    mileage: '35 kmpl', color: 'Halcyon Black',  location, agencyId, price: { daily: 900,  weekly: 5500,  monthly: 18000 }, images: ['https://images.unsplash.com/photo-1558979158-65a1eaa08691?w=600'], features: ['Dual ABS', 'Tripper Nav', 'LED DRL', 'USB'],                description: 'Iconic cruiser with modern amenities.',  available: true,  rating: 4.7, reviews: 312 },
  { name: 'KTM Duke 390',             brand: 'KTM',            model: 'Duke 390',      year: 2023, type: '2W', fuelType: 'Petrol',  transmission: 'Manual',    seats: 2, engine: '373.2cc',  mileage: '25 kmpl', color: 'Super Orange',   location, agencyId, price: { daily: 1300, weekly: 8000,  monthly: 26000 }, images: ['https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=600'], features: ['TFT Display', 'QuickShifter+', 'Cornering ABS'],            description: 'Pure street fighter.',                  available: true,  rating: 4.8, reviews: 189 },
  { name: 'Maruti Suzuki Swift',      brand: 'Maruti Suzuki',  model: 'Swift',         year: 2024, type: '4W', fuelType: 'Petrol',  transmission: 'Manual',    seats: 5, engine: '1.2L',     mileage: '23 kmpl', color: 'Midnight Black', location, agencyId, price: { daily: 2500, weekly: 15000, monthly: 48000 }, images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600'], features: ['Touchscreen', 'Rear Camera', 'Auto AC', 'Push Start'],      description: "India's favourite hatchback.",           available: true,  rating: 4.4, reviews: 421 },
  { name: 'Toyota Innova Crysta',     brand: 'Toyota',         model: 'Innova Crysta', year: 2023, type: '4W', fuelType: 'Diesel',  transmission: 'Automatic', seats: 8, engine: '2.4L',     mileage: '15 kmpl', color: 'Silver',         location, agencyId, price: { daily: 4500, weekly: 28000, monthly: 90000 }, images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'], features: ['8 Seater', 'Ventilated Seats', 'Cruise Control'],           description: "India's most trusted MPV.",             available: true,  rating: 4.6, reviews: 267 },
  { name: 'Hyundai Creta',            brand: 'Hyundai',        model: 'Creta',         year: 2024, type: '4W', fuelType: 'Petrol',  transmission: 'Automatic', seats: 5, engine: '1.5L',     mileage: '18 kmpl', color: 'Atlas White',    location, agencyId, price: { daily: 3500, weekly: 22000, monthly: 70000 }, images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'], features: ['Panoramic Sunroof', 'BOSE Sound', 'ADAS L2', '360 Camera'], description: "India's favourite SUV.",                 available: true,  rating: 4.5, reviews: 356 },
];

const makeBookings = (vGroups, customers, agencies) => [
  { vehicleId: vGroups[0][3]._id, customerId: customers[0]._id, agencyId: agencies[0]._id, startDate: daysFromNow(1),   endDate: daysFromNow(8),   days: 7,  durationType: 'weekly',  totalPrice: 15000, status: 'confirmed', pickupLocation: 'Mumbai',    vehicleName: 'Maruti Suzuki Swift',      customerName: customers[0].name },
  { vehicleId: vGroups[0][1]._id, customerId: customers[1]._id, agencyId: agencies[0]._id, startDate: daysFromNow(-7),  endDate: daysFromNow(-1),  days: 6,  durationType: 'daily',   totalPrice: 5400,  status: 'completed', pickupLocation: 'Mumbai',    vehicleName: 'Royal Enfield Classic 350', customerName: customers[1].name },
  { vehicleId: vGroups[1][2]._id, customerId: customers[2]._id, agencyId: agencies[1]._id, startDate: daysFromNow(2),   endDate: daysFromNow(4),   days: 2,  durationType: 'daily',   totalPrice: 2600,  status: 'pending',   pickupLocation: 'Bangalore', vehicleName: 'KTM Duke 390',             customerName: customers[2].name },
  { vehicleId: vGroups[1][4]._id, customerId: customers[3]._id, agencyId: agencies[1]._id, startDate: daysFromNow(-30), endDate: daysFromNow(-2),  days: 28, durationType: 'monthly', totalPrice: 90000, status: 'completed', pickupLocation: 'Bangalore', vehicleName: 'Toyota Innova Crysta',     customerName: customers[3].name },
  { vehicleId: vGroups[2][5]._id, customerId: customers[4]._id, agencyId: agencies[2]._id, startDate: daysFromNow(0),   endDate: daysFromNow(3),   days: 3,  durationType: 'daily',   totalPrice: 10500, status: 'active',    pickupLocation: 'Delhi',     vehicleName: 'Hyundai Creta',            customerName: customers[4].name },
  { vehicleId: vGroups[2][3]._id, customerId: customers[5]._id, agencyId: agencies[2]._id, startDate: daysFromNow(5),   endDate: daysFromNow(12),  days: 7,  durationType: 'weekly',  totalPrice: 15000, status: 'pending',   pickupLocation: 'Delhi',     vehicleName: 'Maruti Suzuki Swift',      customerName: customers[5].name },
  { vehicleId: vGroups[0][5]._id, customerId: customers[0]._id, agencyId: agencies[0]._id, startDate: daysFromNow(-20), endDate: daysFromNow(-13), days: 7,  durationType: 'weekly',  totalPrice: 22000, status: 'completed', pickupLocation: 'Mumbai',    vehicleName: 'Hyundai Creta',            customerName: customers[0].name },
  { vehicleId: vGroups[1][0]._id, customerId: customers[1]._id, agencyId: agencies[1]._id, startDate: daysFromNow(10),  endDate: daysFromNow(11),  days: 1,  durationType: 'daily',   totalPrice: 400,   status: 'confirmed', pickupLocation: 'Bangalore', vehicleName: 'Honda Activa 6G',          customerName: customers[1].name },
  { vehicleId: vGroups[2][1]._id, customerId: customers[4]._id, agencyId: agencies[2]._id, startDate: daysFromNow(-10), endDate: daysFromNow(-8),  days: 2,  durationType: 'daily',   totalPrice: 1800,  status: 'rejected',  pickupLocation: 'Delhi',     vehicleName: 'Royal Enfield Classic 350', customerName: customers[4].name, rejectionReason: 'Vehicle under maintenance.' },
  { vehicleId: vGroups[0][4]._id, customerId: customers[2]._id, agencyId: agencies[0]._id, startDate: daysFromNow(15),  endDate: daysFromNow(43),  days: 28, durationType: 'monthly', totalPrice: 90000, status: 'pending',   pickupLocation: 'Mumbai',    vehicleName: 'Toyota Innova Crysta',     customerName: customers[2].name, notes: 'Corporate rental. GST invoice needed.' },
  { vehicleId: vGroups[1][3]._id, customerId: customers[3]._id, agencyId: agencies[1]._id, startDate: daysFromNow(-5),  endDate: daysFromNow(-3),  days: 2,  durationType: 'daily',   totalPrice: 5000,  status: 'cancelled', pickupLocation: 'Bangalore', vehicleName: 'Maruti Suzuki Swift',      customerName: customers[3].name },
  { vehicleId: vGroups[2][2]._id, customerId: customers[5]._id, agencyId: agencies[2]._id, startDate: daysFromNow(20),  endDate: daysFromNow(27),  days: 7,  durationType: 'weekly',  totalPrice: 8000,  status: 'confirmed', pickupLocation: 'Delhi',     vehicleName: 'KTM Duke 390',             customerName: customers[5].name },
];

/* ─── Main ─── */
async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set — check your backend/.env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n🌱 Connected to MongoDB');
    console.log('🗑️  Clearing existing data...\n');

    await Promise.all([User.deleteMany(), Agency.deleteMany(), Vehicle.deleteMany(), Booking.deleteMany()]);

    /* Admin */
    const admin = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', status: 'active', location: 'Mumbai', avatar: 'https://cdn-icons-png.flaticon.com/512/2945/2945361.png' });
    console.log('✅ Admin:', admin.email);

    /* Agency owners */
    const owners = await Promise.all(AGENCY_OWNERS.map(o => User.create({ ...o, role: 'agency', status: 'active' })));
    console.log(`✅ ${owners.length} agency owners`);

    /* Agencies */
    const agencies = await Promise.all(AGENCY_DATA.map((a, i) => Agency.create({ 
      ...a, 
      ownerId: owners[i]._id, 
      status: 'approved',
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: daysFromNow(365)
    })));
    await Promise.all(owners.map((o, i) => { o.agencyId = agencies[i]._id; return o.save(); }));
    console.log(`✅ ${agencies.length} agencies`);

    /* Vehicles */
    const vGroups = await Promise.all(agencies.map(a => Vehicle.insertMany(makeVehicles(a._id, a.location))));
    console.log(`✅ ${vGroups.flat().length} vehicles (6 per agency)`);

    /* Customers */
    const customers = await Promise.all(CUSTOMERS.map(c => User.create({ ...c, role: 'customer', status: 'active' })));
    console.log(`✅ ${customers.length} customers`);

    /* Bookings */
    const bookings = await Booking.insertMany(makeBookings(vGroups, customers, agencies));
    console.log(`✅ ${bookings.length} bookings`);

    console.log('\n' + '═'.repeat(50));
    console.log('  🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('\n  Demo Credentials (all passwords: demo123)\n');
    console.log('  👑  admin@demo.com        → Admin');
    console.log('  🏢  rajesh@demo.com       → Agency (Mumbai)');
    console.log('  🏢  priya@demo.com        → Agency (Bangalore)');
    console.log('  🏢  amit@demo.com         → Agency (Delhi)');
    console.log('  👤  customer@demo.com     → Customer');
    console.log('  👤  ananya@demo.com       → Customer');
    console.log('  👤  karthik@demo.com      → Customer\n');
    console.log('═'.repeat(50) + '\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected\n');
  }
}

seed();
