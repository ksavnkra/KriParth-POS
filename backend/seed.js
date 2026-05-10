require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: "admin@kriparth.com" });
    if (existing) {
      console.log("Admin user already exists, skipping seed.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await User.create({
      name: "Admin",
      email: "admin@kriparth.com",
      password: hashedPassword,
      role: "admin",
      contact: "9999999999",
    });

    console.log("Admin user created!");
    console.log("  Email: admin@kriparth.com");
    console.log("  Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
