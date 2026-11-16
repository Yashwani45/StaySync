const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

async function check() {
  await connectDB();
  const providerUsers = await User.find({
    role: { $in: ['PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER'] }
  });
  console.log('Provider users count:', providerUsers.length);
  providerUsers.forEach(u => console.log({ id: u._id, name: u.name, role: u.role, providerType: u.providerType }));

  const services = await ServiceProvider.find({});
  console.log('Services count:', services.length);
  services.forEach(s => console.log({ id: s._id, businessName: s.businessName, category: s.category }));
  process.exit(0);
}

check();
