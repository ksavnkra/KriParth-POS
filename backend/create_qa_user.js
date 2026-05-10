const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createQAUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model("User", UserSchema, "users");

  const exists = await User.findOne({ email: "qa_tester@test.com" });
  if (exists) await User.deleteOne({ _id: exists._id });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("tester123", salt);

  await User.create({
    name: "QA Tester Agent",
    email: "qa_tester@test.com",
    password: hashedPassword,
    role: "admin",
    isActive: true
  });

  console.log("QA User created securely: qa_tester@test.com / tester123");
  process.exit(0);
}

createQAUser().catch(e => { console.error(e); process.exit(1); });
