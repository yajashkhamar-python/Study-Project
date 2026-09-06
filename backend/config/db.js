const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {}

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('⚠️ MONGODB_URI is not defined in environment variables.');
      return false;
    }

    const databaseName = process.env.MONGODB_DB || 'studypulse_db';

    const conn = await mongoose.connect(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log(`ℹ️ Application will use persistent local database store.`);
    return false;
  }
};

module.exports = connectDB;


