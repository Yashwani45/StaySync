const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const mongoose = require('mongoose');

async function check() {
  await connectDB();
  const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const properties = await Property.find({}).lean();
  console.log('--- PROPERTIES ---');
  for (const p of properties) {
    const owner = p.owner ? await User.findById(p.owner).lean() : null;
    console.log(`Property: "${p.title}" | Owner ID: ${p.owner} | Owner Name: ${owner ? owner.name : 'Unknown'} | Email: ${owner ? owner.email : 'Unknown'}`);
  }

  console.log('\n--- ALL USERS ---');
  const users = await User.find({}).lean();
  for (const u of users) {
    console.log(`User: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
