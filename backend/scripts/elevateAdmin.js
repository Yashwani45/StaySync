const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

async function elevateAdmin() {
  try {
    await connectDB();
    const admin = await User.findOne({ email: 'admin@staysync.com' });
    if (admin) {
      admin.role = 'SUPER_ADMIN';
      admin.accountStatus = 'Active';
      admin.permissions = ['ALL'];
      await admin.save();
      console.log('Successfully updated admin@staysync.com to SUPER_ADMIN!');
    } else {
      console.log('admin@staysync.com not found');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

elevateAdmin();
