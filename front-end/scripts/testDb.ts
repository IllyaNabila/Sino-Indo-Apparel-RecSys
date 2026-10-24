import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connect } from "../dbConfig/dbConfig";

// Load .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testDbConnection() {
  console.log("Testing Next.js / Mongoose database connection...");
  const conn = await connect();

  if (!conn || mongoose.connection.readyState !== 1) {
    console.error("❌ Failed to connect to MongoDB. Check your MONGO_URI in front-end/.env.local");
    process.exit(1);
  }

  const db = mongoose.connection.db;
  console.log(`✅ Connected to MongoDB! Database name: "${db?.databaseName}"`);

  if (db) {
    const collections = await db.listCollections().toArray();
    console.log(`📂 Collections (${collections.length}):`, collections.map((c) => c.name));
  }

  await mongoose.disconnect();
  process.exit(0);
}

testDbConnection().catch((err) => {
  console.error("❌ Database test error:", err);
  process.exit(1);
});
