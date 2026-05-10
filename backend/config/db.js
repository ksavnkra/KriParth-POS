const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/kriparth-pos";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // Log the error but don't exit - allow server to start for frontend dev even when DB is unreachable.
    console.error("DB connection failed:", err.message);
  }
};

module.exports = connectDB;
