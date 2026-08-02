// Run once to create the first admin account:  node seedAdmin.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

(async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashed });

  console.log("Admin created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  process.exit(0);
})();
