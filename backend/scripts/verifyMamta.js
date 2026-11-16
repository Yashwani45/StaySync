const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function checkMamta() {
  await connectDB();
  const mamta = await User.findOne({ email: 'mamtakushwaha@gmail.com' }).select('+password');
  if (mamta) {
    console.log('Mamta found. Has password?', !!mamta.password);
    const isMatch = mamta.password ? await bcrypt.compare('password123', mamta.password) : false;
    console.log('Does password123 match?', isMatch);
    if (!isMatch) {
      console.log('Resetting mamta password to password123...');
      const salt = await bcrypt.genSalt(10);
      mamta.password = await bcrypt.hash('password123', salt);
      await mamta.save();
      console.log('Mamta password successfully set to password123!');
    }
  } else {
    console.log('Mamta not found!');
  }

  const owner = await User.findOne({ email: 'owner@staysync.com' }).select('+password');
  if (owner) {
    const isMatch = owner.password ? await bcrypt.compare('password123', owner.password) : false;
    console.log('owner@staysync.com does password123 match?', isMatch);
    if (!isMatch) {
      const salt = await bcrypt.genSalt(10);
      owner.password = await bcrypt.hash('password123', salt);
      await owner.save();
      console.log('owner@staysync.com password updated to password123!');
    }
  }

  process.exit(0);
}

checkMamta().catch(console.error);
