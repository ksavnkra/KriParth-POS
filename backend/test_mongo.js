const mongoose = require("mongoose");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");
  const Stock = mongoose.model("Stock", new mongoose.Schema({}, {strict: false}));
  const stock = await Stock.findOne();
  console.log("Sample Stock Item:", stock ? stock._id : "None Found");
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
