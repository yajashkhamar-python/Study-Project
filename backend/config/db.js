const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {}

    let uri = process.env.MONGODB_URI;
    if (uri) {
      const databaseName = process.env.MONGODB_DB || 'studypulse_db';
      const parsedUri = new URL(uri);
      if (!parsedUri.pathname || parsedUri.pathname === '/') {
        parsedUri.pathname = `/${databaseName}`;
      }
      uri = parsedUri.toString();
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.log(`ℹ️ Application will use persistent local database store.`);
    return false;
  }
};

module.exports = connectDB;

