const mongoose = require('mongoose');

const connectMongoDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cargoshare';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Warning: ${error.message}`);
    console.log(`[MongoDB] Note: Running in fallback mode if MongoDB instance is not active.`);
    return null;
  }
};

module.exports = connectMongoDB;
