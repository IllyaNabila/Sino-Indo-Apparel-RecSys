import "dotenv/config";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import User from "@/models/userModel"; // adjust path
import { connect } from "@/dbConfig/dbConfig"; // adjust path

async function seed() {
  await connect();

  const email = process.env.ADMIN_EMAIL!.toLowerCase();
  const password = process.env.ADMIN_PASSWORD!;
  if (!email || !password) throw new Error("Missing ADMIN_EMAIL / ADMIN_PASSWORD in env");

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(password, salt);

  await User.create({
    email,
    password: hashed,
    role: "admin",
    isVerified: true,
  });

  console.log("✅ Admin created:", email);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
