const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Property = require('../models/Property');

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to Atlas successfully.');

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const mamta = await User.findOneAndUpdate(
    { email: 'mamtakushwaha@gmail.com' },
    {
      name: 'Mamta Kushwaha',
      email: 'mamtakushwaha@gmail.com',
      password: hashedPassword,
      phone: '+919876543210',
      role: 'PROPERTY_OWNER',
      propertyType: 'Hostel',
      isVerified: true,
      currentCity: 'Indore',
      preferredCity: 'Indore'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Mamta Kushwaha account ready in Atlas:', {
    id: mamta._id,
    name: mamta.name,
    email: mamta.email,
    role: mamta.role,
    propertyType: mamta.propertyType
  });

  // Assign any unassigned properties to Mamta if none assigned
  const mamtaProps = await Property.find({ owner: mamta._id });
  console.log(`Mamta currently owns ${mamtaProps.length} properties.`);
  
  if (mamtaProps.length === 0) {
    const defaultOwner = await User.findOne({ email: 'owner@staysync.com' });
    if (defaultOwner) {
      const result = await Property.updateMany(
        { owner: defaultOwner._id },
        { owner: mamta._id }
      );
      console.log(`Transferred ${result.modifiedCount} demo properties to Mamta Kushwaha.`);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
