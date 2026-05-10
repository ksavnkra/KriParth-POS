require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: "Keshav@gmail.com" });
    if (existing) {
      console.log("Admin user already exists, skipping seed.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Keshav@1006", salt);

    await User.create({
      name: "Keshav",
      email: "Keshav@gmail.com",
      password: hashedPassword,
      role: "admin",
      contact: "9352565559",
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
