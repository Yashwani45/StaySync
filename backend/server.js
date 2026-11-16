const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

let PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Auto-Seeder: No users found. Seeding initial demo accounts...');
      const seedData = require('./scripts/seed');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('Auto-Seeder warning:', seedErr.message);
  }

  // Start Express Server with EADDRINUSE fallback
  const startServer = (portToUse) => {
    const server = app.listen(portToUse, () => {
      console.log(`StaySync Server is running on port ${portToUse}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Ready for authentication at http://localhost:${portToUse}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${portToUse} is already in use. Retrying on port ${Number(portToUse) + 1}...`);
        startServer(Number(portToUse) + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(PORT);
}).catch(err => {
  console.error('Fatal database connection error during server startup:', err);
});
// Trigger nodemon reload 4
