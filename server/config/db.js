const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Force connection to your local MongoDB Compass instance database namespace
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Local MongoDB Compass Pipeline Synchronized.');
  } catch (err) {
    console.error(' Database connection failure:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;