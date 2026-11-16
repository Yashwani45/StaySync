const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {}

let mongoMemoryInstance = null;

// Handle runtime connection warnings so background monitor heartbeats do not crash the process
mongoose.connection.on('error', (err) => {
  console.warn('DB Runtime Notice:', err.message);
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connUri = process.env.MONGODB_URI;
  const forceLocal = process.env.USE_LOCAL_DB === 'true';

  // 1. Try primary connection (e.g. MongoDB Atlas) unless forced to local
  if (connUri && !forceLocal) {
    try {
      console.log('DB: Testing primary database connection...');
      const conn = await mongoose.connect(connUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });

      // Strict healthcheck probe to ensure primary replica can actually respond without monitor timeouts
      const probe = await Promise.race([
        conn.connection.db.admin().ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Primary DB ping probe timed out')), 8000)
        )
      ]);

      if (probe && probe.ok) {
        console.log(`DB Connected & Verified (Primary): ${conn.connection.host}`);
        return conn;
      }
      throw new Error('Ping probe returned invalid response');
    } catch (primaryErr) {
      console.warn(`DB: Primary database connection failed or timed out (${primaryErr.message}).`);
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  }

  // 2. Try local MongoDB daemon if running
  const localUri = 'mongodb://127.0.0.1:27017/staysync';
  try {
    console.log(`DB: Checking local daemon (${localUri})...`);
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`DB Connected (Local Daemon): ${conn.connection.host}`);
    return conn;
  } catch (localErr) {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }

  // 3. Automated High-Availability In-Memory Engine Fallback
  console.log('DB: Starting high-performance In-Memory Database engine...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryInstance) {
      mongoMemoryInstance = await MongoMemoryServer.create();
    }
    const memUri = mongoMemoryInstance.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`DB Connected (In-Memory Engine): ${conn.connection.host}`);

    // Auto-seed if database is fresh
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('DB: Fresh database detected. Auto-seeding initial StaySync properties & accounts...');
      try {
        const seedData = require('../scripts/seed');
        await seedData();
        console.log('DB: Auto-seeding complete! Ready for all requests.');
      } catch (seedErr) {
        console.warn('DB: Auto-seeding warning:', seedErr.message);
      }
    }

    return conn;
  } catch (memErr) {
    console.error('CRITICAL: In-Memory DB Engine failed to start:', memErr.message);
    throw memErr;
  }
};

module.exports = connectDB;
