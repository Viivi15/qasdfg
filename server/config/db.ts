import express from "express";
import mongoose from "mongoose";

export let isDbConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not defined in .env");
    return;
  }
  
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Fail fast if cannot connect
    });
    isDbConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isDbConnected = false;
  }
}
