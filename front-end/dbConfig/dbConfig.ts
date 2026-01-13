import mongoose from "mongoose";
import "@/models/businessModel";
import "@/models/licenseModel";
import "@/models/conversationMembershipModel";
import "@/models/conversationModel";
import "@/models/messageModel";
import "@/models/userModel";
import "@/models/preferenceModel";
import "@/models/productModel";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing in environment variables");
}

// Cache across hot reloads in dev
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null as any, promise: null as any };
}

export async function connect() {
  // already connected
  if (cached.conn) return cached.conn;

  // start connecting only once
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((m) => m);

    // attach listeners once
    mongoose.connection.once("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.once("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}