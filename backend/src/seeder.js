import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@umojafund.com" });
    if (existingAdmin) {
      console.log("Admin déjà présent");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("SuperSecretAdmin", 10);

    const adminUser = await User.create({
      name: "Admin UmojaFund",
      email: "admin@umojafund.com",
      passwordHash: hashedPassword,
      role: "admin"
    });

    console.log("Admin créé :", adminUser);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
