const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    await connectDB();
    const mamta = await User.findOne({ email: 'mamtakushwaha@gmail.com' }).select('+password');
    if (!mamta) {
      console.log('Mamta not found in database!');
      process.exit(0);
    }
    const match = await bcrypt.compare('password123', mamta.password);
    console.log('Mamta password match:', match);
    if (!match) {
      mamta.password = 'password123';
      await mamta.save();
      console.log('Successfully updated mamtakushwaha@gmail.com password to password123!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

main();
