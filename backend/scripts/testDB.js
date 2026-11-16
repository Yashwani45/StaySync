const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function test() {
  try {
    const mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.6'
      },
      instance: {
        dbName: 'staysync'
      }
    });
    const uri = mongoServer.getUri();
    console.log('MongoMemoryServer URI:', uri);
    await mongoose.connect(uri);
    console.log('Mongoose connected successfully!');
    await mongoose.disconnect();
    await mongoServer.stop();
  } catch (err) {
    console.error('MongoMemoryServer failed:', err);
  }
}

test();
