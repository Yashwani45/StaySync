const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('SUCCESS: Atlas Connected!');
    const User = require('../models/User');
    const users = await User.find({});
    console.log('Atlas Users count:', users.length);
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.role}`));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Atlas connection error:', err.message);
  }
}

test();
