import dns from "node:dns";
import mongoose from "mongoose";
import "@/models/businessModel";
import "@/models/licenseModel";
import "@/models/conversationMembershipModel";
import "@/models/conversationModel";
import "@/models/messageModel";
import "@/models/userModel";
import "@/models/preferenceModel";
import "@/models/productModel";

// Use Google & Cloudflare public DNS to prevent local router/ISP 'querySrv EBADRESP' errors with mongodb+srv://
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if unsupported in edge runtime
}

// Cache across hot reloads in dev
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null as any, promise: null as any };
}

export async function connect() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI is missing in environment variables. Database operations will fail at runtime.");
    return null;
  }

  // already connected
  if (cached.conn) return cached.conn;

  // start connecting only once
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((m) => m)
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cached.promise = null;
        return null;
      });

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