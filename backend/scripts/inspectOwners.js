const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

async function check() {
  await connectDB();
  const owners = await User.find({
    role: { $in: ['PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'] }
  });
  console.log('Owners count:', owners.length);
  owners.forEach(u => console.log({ id: u._id, name: u.name, role: u.role, propertyType: u.propertyType }));
  process.exit(0);
}

check();
