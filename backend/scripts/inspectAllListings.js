const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');

async function check() {
  await connectDB();
  const props = await Property.find({});
  console.log('=== PROPERTIES (' + props.length + ') ===');
  props.forEach(p => console.log({ id: p._id, title: p.title, city: p.city, address: p.address, rent: p.monthlyRent, type: p.propertyType }));

  const servs = await ServiceProvider.find({});
  console.log('=== SERVICES (' + servs.length + ') ===');
  servs.forEach(s => console.log({ id: s._id, businessName: s.businessName, category: s.category, city: s.city, address: s.address, rating: s.rating }));
  process.exit(0);
}

check();
