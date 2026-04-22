import "colors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ensureSystemCategorias } from "../helpers/systemCategories";

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_MONGO!;
    const connection = await mongoose.connect(mongoUri);
    const { host, port, name } = connection.connection;

    console.log("────────────────────────────────────────".gray);
    console.log("🧠 MongoDB connected successfully".green.bold);
    console.log(`📍 Host : ${host}`.magenta);
    console.log(`🔌 Port : ${port}`.magenta);
    console.log(`📦 DB   : ${name}`.cyan);
    await ensureSystemCategorias();
    console.log("🧩 System categories ensured".yellow);
    console.log("────────────────────────────────────────".gray);
  } catch (error) {
    console.log("❌ MongoDB connection error".red.bold);
    console.error(error);
    process.exit(1);
  }
};
