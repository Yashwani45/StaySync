const connectDB = require('../config/db');
const User = require('../models/User');

async function checkRoles() {
  try {
    await connectDB();
    const distinctRoles = await User.distinct('role');
    const roleCounts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    console.log('Distinct roles in DB:', distinctRoles);
    console.log('Role counts:', roleCounts);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRoles();
