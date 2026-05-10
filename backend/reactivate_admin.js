require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

const reactivateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "admin@kriparth.com" });
    
    if (!admin) {
      console.log("Admin user not found!");
      process.exit(1);
    }

    console.log("Found admin user:", {
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      role: admin.role
    });

    // Reactivate admin
    admin.isActive = true;
    await admin.save();

    console.log("✅ Admin user reactivated successfully!");
    console.log("  Email: admin@kriparth.com");
    console.log("  Password: admin123");
    console.log("  Status: Active");
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

reactivateAdmin();
