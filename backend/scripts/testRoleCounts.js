const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

async function testCounts() {
  await connectDB();
  const allUsers = await User.find({});
  console.log('Total users:', allUsers.length);
  
  const cleaning = allUsers.filter(u => 
    u.role === 'CLEANING_LAUNDRY_PROVIDER' || 
    (u.providerType && /clean/i.test(u.providerType)) ||
    (u.name && /clean/i.test(u.name))
  );
  console.log('Cleaning providers:', cleaning.map(u => ({ name: u.name, role: u.role, providerType: u.providerType })));

  const tiffin = allUsers.filter(u => 
    u.role === 'TIFFIN_PROVIDER' || 
    (u.providerType && /tiffin/i.test(u.providerType)) ||
    (u.name && /tiffin/i.test(u.name))
  );
  console.log('Tiffin providers:', tiffin.map(u => ({ name: u.name, role: u.role, providerType: u.providerType })));

  const laundry = allUsers.filter(u => 
    (u.providerType && /laundry/i.test(u.providerType)) ||
    (u.name && /laundry/i.test(u.name))
  );
  console.log('Laundry providers:', laundry.map(u => ({ name: u.name, role: u.role, providerType: u.providerType })));

  process.exit(0);
}

testCounts();
